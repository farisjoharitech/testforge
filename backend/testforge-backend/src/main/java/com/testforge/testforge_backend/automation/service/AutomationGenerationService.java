package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.generation.PlaywrightJavaGenerator;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AutomationGenerationService {

    private final AutomationScriptRepository
            automationScriptRepository;

    private final AutomationStepRepository
            automationStepRepository;

    private final PlaywrightJavaGenerator
            playwrightJavaGenerator;

    public AutomationGenerationService(
            AutomationScriptRepository automationScriptRepository,
            AutomationStepRepository automationStepRepository,
            PlaywrightJavaGenerator playwrightJavaGenerator
    ) {

        this.automationScriptRepository =
                automationScriptRepository;

        this.automationStepRepository =
                automationStepRepository;

        this.playwrightJavaGenerator =
                playwrightJavaGenerator;
    }

    public GeneratedScriptResponse generate(
            Long scriptId
    ) {

        AutomationScript script =
                findScript(
                        scriptId
                );

        List<AutomationStep> steps =
                loadSteps(
                        scriptId
                );

        if (steps.isEmpty()) {
            throw new AutomationValidationException(
                    "Automation Script must contain at least one Automation Step before generation"
            );
        }

        TestCase testCase =
                script.getTestCase();

        validateTestCase(
                testCase,
                steps
        );

        PlaywrightJavaGenerator.GeneratedCode generatedCode =
                playwrightJavaGenerator.generate(
                        script,
                        steps
                );

        LocalDateTime generatedAt =
                LocalDateTime.now();

        script.setGeneratedClassName(
                generatedCode.className()
        );

        script.setGeneratedSource(
                generatedCode.source()
        );

        script.setGeneratedStepCount(
                steps.size()
        );

        script.setGeneratedAt(
                generatedAt
        );

        testCase.setAutomationStatus(
                AutomationStatus.SCRIPT_GENERATED
        );

        automationScriptRepository.save(
                script
        );

        return toResponse(
                script,
                false
        );
    }

    @Transactional(readOnly = true)
    public GeneratedScriptResponse getGenerated(
            Long scriptId
    ) {

        AutomationScript script =
                findScript(
                        scriptId
                );

        if (
                script.getGeneratedSource() == null
                        || script.getGeneratedSource().isBlank()
                        || script.getGeneratedAt() == null
        ) {

            throw new AutomationNotFoundException(
                    "Generated script not found for Automation Script: "
                            + scriptId
            );
        }

        List<AutomationStep> steps =
                loadSteps(
                        scriptId
                );

        boolean stale =
                isStale(
                        script,
                        steps
                );

        return toResponse(
                script,
                stale
        );
    }

    private AutomationScript findScript(
            Long scriptId
    ) {

        if (scriptId == null) {
            throw new IllegalArgumentException(
                    "Automation Script ID must not be null"
            );
        }

        return automationScriptRepository
                .findById(scriptId)
                .orElseThrow(
                        () ->
                                new AutomationNotFoundException(
                                        "Automation Script not found: "
                                                + scriptId
                                )
                );
    }

    private List<AutomationStep> loadSteps(
            Long scriptId
    ) {

        return automationStepRepository
                .findByAutomationScriptIdOrderByStepOrderAsc(
                        scriptId
                );
    }

    private void validateTestCase(
            TestCase testCase,
            List<AutomationStep> steps
    ) {

        if (!testCase.isAutomatable()) {
            throw new AutomationValidationException(
                    "Test Case is not automatable"
            );
        }

        AutomationType automationType =
                testCase.getAutomationType();

        if (
                automationType == null
                        || automationType == AutomationType.MANUAL
        ) {

            throw new AutomationValidationException(
                    "Automation Script cannot be generated for a MANUAL Test Case"
            );
        }

        boolean containsUi =
                steps.stream()
                        .anyMatch(
                                step ->
                                        isUiAction(
                                                step.getActionType()
                                        )
                        );

        boolean containsApi =
                steps.stream()
                        .anyMatch(
                                step ->
                                        isApiAction(
                                                step.getActionType()
                                        )
                        );

        if (
                automationType == AutomationType.UI
                        && containsApi
        ) {

            throw new AutomationValidationException(
                    "UI Test Case cannot contain API automation actions"
            );
        }

        if (
                automationType == AutomationType.API
                        && containsUi
        ) {

            throw new AutomationValidationException(
                    "API Test Case cannot contain UI automation actions"
            );
        }
    }

    private boolean isUiAction(
            AutomationActionType actionType
    ) {

        return switch (actionType) {

            case API_GET,
                 API_POST,
                 API_PUT,
                 API_PATCH,
                 API_DELETE,
                 ASSERT_API_STATUS,
                 ASSERT_API_BODY_CONTAINS ->
                    false;

            default ->
                    true;
        };
    }

    private boolean isApiAction(
            AutomationActionType actionType
    ) {

        return !isUiAction(
                actionType
        );
    }

    private boolean isStale(
            AutomationScript script,
            List<AutomationStep> steps
    ) {

        if (
                script.getGeneratedStepCount() == null
                        || script.getGeneratedStepCount()
                        != steps.size()
        ) {

            return true;
        }

        LocalDateTime generatedAt =
                script.getGeneratedAt();

        return steps.stream()
                .anyMatch(
                        step ->
                                step.getUpdatedAt() != null
                                        && step.getUpdatedAt()
                                        .isAfter(
                                                generatedAt
                                        )
                );
    }

    private GeneratedScriptResponse toResponse(
            AutomationScript script,
            boolean stale
    ) {

        return new GeneratedScriptResponse(
                script.getId(),
                script.getAutomationScriptId(),
                script.getTestCase().getId(),
                script.getGeneratedClassName(),
                "Java 17",
                "Playwright",
                script.getGeneratedSource(),
                script.getGeneratedStepCount(),
                script.getGeneratedAt(),
                stale
        );
    }
}