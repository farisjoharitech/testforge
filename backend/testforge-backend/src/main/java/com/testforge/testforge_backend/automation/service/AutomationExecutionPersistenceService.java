package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionRunner;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

@Service
public class AutomationExecutionPersistenceService {

    private static final DateTimeFormatter
            EXECUTION_TIME_FORMAT =
            DateTimeFormatter.ofPattern(
                    "yyyyMMddHHmmss"
            );

    private final AutomationExecutionRepository
            automationExecutionRepository;

    private final AutomationScriptRepository
            automationScriptRepository;

    private final EntityManager
            entityManager;

    public AutomationExecutionPersistenceService(
            AutomationExecutionRepository automationExecutionRepository,
            AutomationScriptRepository automationScriptRepository,
            EntityManager entityManager
    ) {

        this.automationExecutionRepository =
                automationExecutionRepository;

        this.automationScriptRepository =
                automationScriptRepository;

        this.entityManager =
                entityManager;
    }

    @Transactional
    public AutomationExecutionResponse startExecution(
            Long scriptId,
            GeneratedScriptResponse generatedScript
    ) {

        if (
                automationExecutionRepository
                        .existsByAutomationScript_IdAndStatus(
                                scriptId,
                                AutomationExecutionStatus.RUNNING
                        )
        ) {

            throw new AutomationConflictException(
                    "Automation Script already has a RUNNING execution"
            );
        }

        AutomationScript script =
                automationScriptRepository
                        .findById(
                                scriptId
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Automation Script not found: "
                                                        + scriptId
                                        )
                        );

        TestCase testCase =
                script.getTestCase();

        /*
         * Validation passed.
         * The script is now ready to run.
         */
        testCase.setAutomationStatus(
                AutomationStatus.READY
        );

        /*
         * Persist READY before switching to RUNNING.
         *
         * It also makes the transition explicit in the lifecycle.
         */
        entityManager.flush();

        LocalDateTime startedAt =
                LocalDateTime.now();

        AutomationExecution execution =
                new AutomationExecution(
                        createExecutionBusinessId(
                                startedAt
                        ),
                        script,
                        testCase,
                        AutomationExecutionStatus.RUNNING,
                        generatedScript.className(),
                        generatedScript.generatedAt(),
                        startedAt
                );

        automationExecutionRepository.save(
                execution
        );

        testCase.setAutomationStatus(
                AutomationStatus.RUNNING
        );

        entityManager.flush();

        return toResponse(
                execution
        );
    }

    @Transactional
    public AutomationExecutionResponse finishExecution(
            Long executionDatabaseId,
            AutomationExecutionRunner.RunnerResult result
    ) {

        AutomationExecution execution =
                automationExecutionRepository
                        .findById(
                                executionDatabaseId
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Automation Execution not found: "
                                                        + executionDatabaseId
                                        )
                        );

        execution.setStatus(
                result.status()
        );

        execution.setExitCode(
                result.exitCode()
        );

        execution.setLogOutput(
                result.logOutput()
        );

        execution.setErrorMessage(
                result.errorMessage()
        );

        execution.setFinishedAt(
                result.finishedAt()
        );

        execution.setDurationMs(
                result.durationMs()
        );

        TestCase testCase =
                execution.getTestCase();

        if (
                result.status()
                        == AutomationExecutionStatus.PASSED
        ) {

            testCase.setAutomationStatus(
                    AutomationStatus.AUTOMATED
            );

        } else {

            /*
             * Generated script still exists and can be retried.
             */
            testCase.setAutomationStatus(
                    AutomationStatus.READY
            );
        }

        return toResponse(
                execution
        );
    }

    @Transactional(readOnly = true)
    public AutomationExecutionResponse getLatest(
            Long scriptId
    ) {

        AutomationExecution execution =
                automationExecutionRepository
                        .findTopByAutomationScript_IdOrderByStartedAtDesc(
                                scriptId
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "No Automation Execution found for Automation Script: "
                                                        + scriptId
                                        )
                        );

        return toResponse(
                execution
        );
    }

    @Transactional(readOnly = true)
    public AutomationExecutionResponse getById(
            Long executionId
    ) {

        AutomationExecution execution =
                automationExecutionRepository
                        .findById(
                                executionId
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Automation Execution not found: "
                                                        + executionId
                                        )
                        );

        return toResponse(
                execution
        );
    }

    private String createExecutionBusinessId(
            LocalDateTime now
    ) {

        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .substring(
                                0,
                                8
                        )
                        .toUpperCase(
                                Locale.ROOT
                        );

        return "EXEC-"
                + EXECUTION_TIME_FORMAT.format(
                now
        )
                + "-"
                + randomPart;
    }

    private AutomationExecutionResponse toResponse(
            AutomationExecution execution
    ) {

        return new AutomationExecutionResponse(
                execution.getId(),
                execution.getExecutionId(),
                execution.getAutomationScript().getId(),
                execution.getAutomationScript().getAutomationScriptId(),
                execution.getTestCase().getId(),
                execution.getTestCase().getTestCaseId(),
                execution.getStatus(),
                execution.getGeneratedClassName(),
                execution.getGeneratedAt(),
                execution.getExitCode(),
                execution.getLogOutput(),
                execution.getErrorMessage(),
                execution.getStartedAt(),
                execution.getFinishedAt(),
                execution.getDurationMs()
        );
    }
}