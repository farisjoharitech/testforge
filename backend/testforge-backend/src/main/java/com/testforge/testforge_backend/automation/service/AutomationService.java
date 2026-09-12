package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationScriptResponse;
import com.testforge.testforge_backend.automation.dto.AutomationStepResponse;
import com.testforge.testforge_backend.automation.dto.CreateAutomationScriptRequest;
import com.testforge.testforge_backend.automation.dto.CreateAutomationStepRequest;
import com.testforge.testforge_backend.automation.dto.UpdateAutomationStepRequest;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.automation.model.NormalizedSelector;
import com.testforge.testforge_backend.automation.validation.AutomationActionValidator;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class AutomationService {

    private final AutomationScriptRepository
            automationScriptRepository;

    private final AutomationStepRepository
            automationStepRepository;

    private final TestCaseRepository
            testCaseRepository;

    private final TestStepRepository
            testStepRepository;

    private final AutomationActionValidator
            automationActionValidator;

    public AutomationService(
            AutomationScriptRepository automationScriptRepository,
            AutomationStepRepository automationStepRepository,
            TestCaseRepository testCaseRepository,
            TestStepRepository testStepRepository,
            AutomationActionValidator automationActionValidator
    ) {
        this.automationScriptRepository =
                automationScriptRepository;

        this.automationStepRepository =
                automationStepRepository;

        this.testCaseRepository =
                testCaseRepository;

        this.testStepRepository =
                testStepRepository;

        this.automationActionValidator =
                automationActionValidator;
    }

    public AutomationScriptResponse createScript(
            Long testCaseId,
            CreateAutomationScriptRequest request
    ) {

        if (testCaseId == null) {
            throw new IllegalArgumentException(
                    "Test Case ID must not be null"
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Automation Script request must not be null"
            );
        }

        TestCase testCase =
                testCaseRepository.findById(testCaseId)
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Test Case not found: "
                                                        + testCaseId
                                        )
                        );

        if (automationScriptRepository
                .existsByTestCaseId(testCaseId)) {

            throw new AutomationConflictException(
                    "Automation Script already exists for Test Case: "
                            + testCaseId
            );
        }

        if (automationScriptRepository
                .existsByAutomationScriptId(
                        request.automationScriptId()
                )) {

            throw new AutomationConflictException(
                    "Automation Script ID already exists: "
                            + request.automationScriptId()
            );
        }

        AutomationScript automationScript =
                new AutomationScript(
                        request.automationScriptId(),
                        testCase,
                        request.name()
                );

        AutomationScript saved =
                automationScriptRepository.save(
                        automationScript
                );

        return toScriptResponse(
                saved
        );
    }

    @Transactional(readOnly = true)
    public AutomationScriptResponse getScript(
            Long automationScriptId
    ) {

        AutomationScript automationScript =
                findScript(
                        automationScriptId
                );

        return toScriptResponse(
                automationScript
        );
    }

    @Transactional(readOnly = true)
    public AutomationScriptResponse getScriptByTestCase(
            Long testCaseId
    ) {

        if (testCaseId == null) {
            throw new IllegalArgumentException(
                    "Test Case ID must not be null"
            );
        }

        AutomationScript automationScript =
                automationScriptRepository
                        .findByTestCaseId(
                                testCaseId
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Automation Script not found for Test Case: "
                                                        + testCaseId
                                        )
                        );

        return toScriptResponse(
                automationScript
        );
    }

    public AutomationStepResponse createStep(
            Long automationScriptId,
            CreateAutomationStepRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Automation Step request must not be null"
            );
        }

        AutomationScript automationScript =
                findScript(
                        automationScriptId
                );

        if (automationStepRepository
                .existsByAutomationStepId(
                        request.automationStepId()
                )) {

            throw new AutomationConflictException(
                    "Automation Step ID already exists: "
                            + request.automationStepId()
            );
        }

        if (automationStepRepository
                .existsByAutomationScriptIdAndStepOrder(
                        automationScriptId,
                        request.stepOrder()
                )) {

            throw new AutomationConflictException(
                    "Automation step order already exists in script: "
                            + request.stepOrder()
            );
        }

        TestStep testStep =
                findTestStep(
                        request.sourceTestStepId()
                );

        validateTestStepBelongsToScriptTestCase(
                automationScript,
                testStep
        );

        NormalizedAutomationAction action =
                buildNormalizedAction(
                        testStep,
                        request.stepOrder(),
                        request.actionType(),
                        request.target(),
                        request.selectorStrategy(),
                        request.selectorValue(),
                        request.selectorRole(),
                        request.selectorName(),
                        request.selectorExact(),
                        request.inputValue(),
                        request.expectedValue()
                );

        automationActionValidator.validate(
                action
        );

        AutomationStep automationStep =
                new AutomationStep(
                        request.automationStepId(),
                        automationScript,
                        testStep,
                        request.stepOrder(),
                        request.actionType()
                );

        applyAutomationConfiguration(
                automationStep,
                request.target(),
                request.selectorStrategy(),
                request.selectorValue(),
                request.selectorRole(),
                request.selectorName(),
                request.selectorExact(),
                request.inputValue(),
                request.expectedValue()
        );

        AutomationStep saved =
                automationStepRepository.save(
                        automationStep
                );

        return toStepResponse(
                saved
        );
    }

    @Transactional(readOnly = true)
    public AutomationStepResponse getStep(
            Long automationStepId
    ) {

        AutomationStep automationStep =
                findStep(
                        automationStepId
                );

        return toStepResponse(
                automationStep
        );
    }

    @Transactional(readOnly = true)
    public List<AutomationStepResponse> getSteps(
            Long automationScriptId
    ) {

        findScript(
                automationScriptId
        );

        return automationStepRepository
                .findByAutomationScriptIdOrderByStepOrderAsc(
                        automationScriptId
                )
                .stream()
                .map(
                        this::toStepResponse
                )
                .toList();
    }

    public AutomationStepResponse updateStep(
            Long automationStepId,
            UpdateAutomationStepRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Automation Step update request must not be null"
            );
        }

        AutomationStep automationStep =
                findStep(
                        automationStepId
                );

        Long automationScriptId =
                automationStep
                        .getAutomationScript()
                        .getId();

        if (!Objects.equals(
                automationStep.getStepOrder(),
                request.stepOrder()
        )) {

            if (automationStepRepository
                    .existsByAutomationScriptIdAndStepOrder(
                            automationScriptId,
                            request.stepOrder()
                    )) {

                throw new AutomationConflictException(
                        "Automation step order already exists in script: "
                                + request.stepOrder()
                );
            }
        }

        TestStep testStep =
                automationStep.getTestStep();

        NormalizedAutomationAction action =
                buildNormalizedAction(
                        testStep,
                        request.stepOrder(),
                        request.actionType(),
                        request.target(),
                        request.selectorStrategy(),
                        request.selectorValue(),
                        request.selectorRole(),
                        request.selectorName(),
                        request.selectorExact(),
                        request.inputValue(),
                        request.expectedValue()
                );

        automationActionValidator.validate(
                action
        );

        automationStep.setStepOrder(
                request.stepOrder()
        );

        automationStep.setActionType(
                request.actionType()
        );

        applyAutomationConfiguration(
                automationStep,
                request.target(),
                request.selectorStrategy(),
                request.selectorValue(),
                request.selectorRole(),
                request.selectorName(),
                request.selectorExact(),
                request.inputValue(),
                request.expectedValue()
        );

        AutomationStep saved =
                automationStepRepository.save(
                        automationStep
                );

        return toStepResponse(
                saved
        );
    }

    public void deleteStep(
            Long automationStepId
    ) {

        AutomationStep automationStep =
                findStep(
                        automationStepId
                );

        automationStepRepository.delete(
                automationStep
        );
    }

    private AutomationScript findScript(
            Long automationScriptId
    ) {

        if (automationScriptId == null) {
            throw new IllegalArgumentException(
                    "Automation Script ID must not be null"
            );
        }

        return automationScriptRepository
                .findById(
                        automationScriptId
                )
                .orElseThrow(
                        () ->
                                new AutomationNotFoundException(
                                        "Automation Script not found: "
                                                + automationScriptId
                                )
                );
    }

    private AutomationStep findStep(
            Long automationStepId
    ) {

        if (automationStepId == null) {
            throw new IllegalArgumentException(
                    "Automation Step ID must not be null"
            );
        }

        return automationStepRepository
                .findById(
                        automationStepId
                )
                .orElseThrow(
                        () ->
                                new AutomationNotFoundException(
                                        "Automation Step not found: "
                                                + automationStepId
                                )
                );
    }

    private TestStep findTestStep(
            Long testStepId
    ) {

        if (testStepId == null) {
            throw new IllegalArgumentException(
                    "Source Test Step ID must not be null"
            );
        }

        return testStepRepository
                .findById(
                        testStepId
                )
                .orElseThrow(
                        () ->
                                new AutomationNotFoundException(
                                        "Test Step not found: "
                                                + testStepId
                                )
                );
    }

    private void validateTestStepBelongsToScriptTestCase(
            AutomationScript automationScript,
            TestStep testStep
    ) {

        Long scriptTestCaseId =
                automationScript
                        .getTestCase()
                        .getId();

        Long stepTestCaseId =
                testStep
                        .getTestCase()
                        .getId();

        if (!Objects.equals(
                scriptTestCaseId,
                stepTestCaseId
        )) {

            throw new AutomationConflictException(
                    "Source Test Step does not belong to the Automation Script Test Case"
            );
        }
    }

    private NormalizedAutomationAction buildNormalizedAction(
            TestStep testStep,
            Integer stepOrder,
            com.testforge.testforge_backend.automation.model.AutomationActionType actionType,
            String target,
            com.testforge.testforge_backend.automation.model.SelectorStrategy selectorStrategy,
            String selectorValue,
            com.testforge.testforge_backend.automation.model.UiElementRole selectorRole,
            String selectorName,
            boolean selectorExact,
            String inputValue,
            String expectedValue
    ) {

        NormalizedSelector selector =
                buildSelector(
                        selectorStrategy,
                        selectorValue,
                        selectorRole,
                        selectorName,
                        selectorExact
                );

        return new NormalizedAutomationAction(
                testStep.getTestStepId(),
                stepOrder,
                actionType,
                target,
                selector,
                inputValue,
                expectedValue
        );
    }

    private NormalizedSelector buildSelector(
            com.testforge.testforge_backend.automation.model.SelectorStrategy selectorStrategy,
            String selectorValue,
            com.testforge.testforge_backend.automation.model.UiElementRole selectorRole,
            String selectorName,
            boolean selectorExact
    ) {

        if (!hasSelectorData(
                selectorStrategy,
                selectorValue,
                selectorRole,
                selectorName,
                selectorExact
        )) {

            return null;
        }

        return new NormalizedSelector(
                selectorStrategy,
                selectorValue,
                selectorRole,
                selectorName,
                selectorExact
        );
    }

    private boolean hasSelectorData(
            com.testforge.testforge_backend.automation.model.SelectorStrategy selectorStrategy,
            String selectorValue,
            com.testforge.testforge_backend.automation.model.UiElementRole selectorRole,
            String selectorName,
            boolean selectorExact
    ) {

        return selectorStrategy != null
                || !isBlank(selectorValue)
                || selectorRole != null
                || !isBlank(selectorName)
                || selectorExact;
    }

    private void applyAutomationConfiguration(
            AutomationStep automationStep,
            String target,
            com.testforge.testforge_backend.automation.model.SelectorStrategy selectorStrategy,
            String selectorValue,
            com.testforge.testforge_backend.automation.model.UiElementRole selectorRole,
            String selectorName,
            boolean selectorExact,
            String inputValue,
            String expectedValue
    ) {

        automationStep.setTarget(
                target
        );

        automationStep.setSelectorStrategy(
                selectorStrategy
        );

        automationStep.setSelectorValue(
                selectorValue
        );

        automationStep.setSelectorRole(
                selectorRole
        );

        automationStep.setSelectorName(
                selectorName
        );

        automationStep.setSelectorExact(
                selectorExact
        );

        automationStep.setInputValue(
                inputValue
        );

        automationStep.setExpectedValue(
                expectedValue
        );
    }

    private AutomationScriptResponse toScriptResponse(
            AutomationScript automationScript
    ) {

        return new AutomationScriptResponse(
                automationScript.getId(),
                automationScript.getAutomationScriptId(),
                automationScript
                        .getTestCase()
                        .getId(),
                automationScript.getName(),
                automationScript.getCreatedAt(),
                automationScript.getUpdatedAt()
        );
    }

    private AutomationStepResponse toStepResponse(
            AutomationStep automationStep
    ) {

        return new AutomationStepResponse(
                automationStep.getId(),
                automationStep.getAutomationStepId(),
                automationStep
                        .getAutomationScript()
                        .getId(),
                automationStep
                        .getTestStep()
                        .getId(),
                automationStep.getStepOrder(),
                automationStep.getActionType(),
                automationStep.getTarget(),
                automationStep.getSelectorStrategy(),
                automationStep.getSelectorValue(),
                automationStep.getSelectorRole(),
                automationStep.getSelectorName(),
                automationStep.isSelectorExact(),
                automationStep.getInputValue(),
                automationStep.getExpectedValue(),
                automationStep.getCreatedAt(),
                automationStep.getUpdatedAt()
        );
    }

    private boolean isBlank(
            String value
    ) {

        return value == null
                || value.isBlank();
    }
}