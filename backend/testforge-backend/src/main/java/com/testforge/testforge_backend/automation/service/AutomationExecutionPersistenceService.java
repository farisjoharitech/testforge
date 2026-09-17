package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationRun;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionRunner;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationRunRepository;
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

    private static final DateTimeFormatter ID_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final AutomationExecutionRepository automationExecutionRepository;
    private final AutomationRunRepository automationRunRepository;
    private final AutomationScriptRepository automationScriptRepository;
    private final EntityManager entityManager;

    public AutomationExecutionPersistenceService(
            AutomationExecutionRepository automationExecutionRepository,
            AutomationRunRepository automationRunRepository,
            AutomationScriptRepository automationScriptRepository,
            EntityManager entityManager
    ) {
        this.automationExecutionRepository = automationExecutionRepository;
        this.automationRunRepository = automationRunRepository;
        this.automationScriptRepository = automationScriptRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public AutomationExecutionResponse startExecution(
            Long scriptId,
            GeneratedScriptResponse generatedScript
    ) {
        assertScriptNotRunning(scriptId);

        AutomationScript script = findScript(scriptId);
        TestCase testCase = script.getTestCase();

        testCase.setAutomationStatus(AutomationStatus.READY);
        entityManager.flush();

        LocalDateTime startedAt = LocalDateTime.now();

        AutomationRun run = new AutomationRun(
                createRunBusinessId(startedAt),
                AutomationRunType.SINGLE_TEST_CASE,
                AutomationRunStatus.RUNNING,
                1,
                startedAt
        );
        automationRunRepository.save(run);

        AutomationExecution execution = createExecution(
                run,
                script,
                testCase,
                generatedScript,
                startedAt
        );

        testCase.setAutomationStatus(AutomationStatus.RUNNING);
        entityManager.flush();

        return toResponse(execution);
    }

    @Transactional
    public AutomationRunResponse startRun(
            AutomationRunType runType,
            int totalExecutions
    ) {
        if (runType == null) {
            throw new IllegalArgumentException("Automation Run type must not be null");
        }

        if (totalExecutions < 1) {
            throw new IllegalArgumentException("Automation Run must contain at least one execution");
        }

        LocalDateTime startedAt = LocalDateTime.now();

        AutomationRun run = new AutomationRun(
                createRunBusinessId(startedAt),
                runType,
                AutomationRunStatus.RUNNING,
                totalExecutions,
                startedAt
        );

        automationRunRepository.save(run);
        return toRunResponse(run);
    }

    @Transactional
    public AutomationExecutionResponse startExecutionInRun(
            Long runId,
            Long scriptId,
            GeneratedScriptResponse generatedScript
    ) {
        AutomationRun run = automationRunRepository.findById(runId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Run not found: " + runId));

        if (run.getStatus() != AutomationRunStatus.RUNNING) {
            throw new AutomationConflictException(
                    "Automation Run is not RUNNING: " + run.getRunId());
        }

        assertScriptNotRunning(scriptId);

        AutomationScript script = findScript(scriptId);
        TestCase testCase = script.getTestCase();
        LocalDateTime startedAt = LocalDateTime.now();

        AutomationExecution execution = createExecution(
                run,
                script,
                testCase,
                generatedScript,
                startedAt
        );

        testCase.setAutomationStatus(AutomationStatus.RUNNING);
        entityManager.flush();

        return toResponse(execution);
    }

    @Transactional
    public void appendLiveLog(Long executionDatabaseId, String chunk) {
        if (chunk == null || chunk.isEmpty()) {
            return;
        }

        AutomationExecution execution = automationExecutionRepository.findById(executionDatabaseId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Execution not found: " + executionDatabaseId));

        String current = execution.getLogOutput() == null ? "" : execution.getLogOutput();
        String updated = current + chunk;
        int maxLength = 500_000;

        if (updated.length() > maxLength) {
            updated = updated.substring(0, maxLength);
        }

        execution.setLogOutput(updated);
    }

    @Transactional
    public AutomationExecutionResponse finishExecution(
            Long executionDatabaseId,
            AutomationExecutionRunner.RunnerResult result
    ) {
        AutomationExecution execution = automationExecutionRepository.findById(executionDatabaseId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Execution not found: " + executionDatabaseId));

        execution.setStatus(result.status());
        execution.setExitCode(result.exitCode());
        execution.setLogOutput(result.logOutput());
        execution.setErrorMessage(result.errorMessage());
        execution.setFailedStepOrder(result.failedStepOrder());
        execution.setFailedAutomationStepId(result.failedAutomationStepId());
        execution.setFailedActionType(result.failedActionType());
        execution.setArtifactDirectory(result.artifactDirectory());
        execution.setFailureScreenshotPath(result.failureScreenshotPath());
        execution.setTracePath(result.tracePath());
        execution.setFinishedAt(result.finishedAt());
        execution.setDurationMs(result.durationMs());

        TestCase testCase = execution.getTestCase();
        boolean passed = result.status() == AutomationExecutionStatus.PASSED;
        testCase.setAutomationStatus(
                passed ? AutomationStatus.AUTOMATED : AutomationStatus.READY
        );

        AutomationRun run = execution.getAutomationRun();

        if (run.getRunType() == AutomationRunType.SINGLE_TEST_CASE) {
            run.finishSingleExecution(
                    toRunStatus(result.status()),
                    result.finishedAt(),
                    result.durationMs(),
                    passed
            );
        } else {
            run.recordExecutionFinished(
                    passed,
                    result.finishedAt()
            );
        }

        return toResponse(execution);
    }

    @Transactional
    public void markRunInfrastructureError(Long runId) {
        AutomationRun run = automationRunRepository.findById(runId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Run not found: " + runId));
        run.markInfrastructureError(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public AutomationExecutionResponse getLatest(Long scriptId) {
        AutomationExecution execution = automationExecutionRepository
                .findTopByAutomationScript_IdOrderByStartedAtDesc(scriptId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "No Automation Execution found for Automation Script: " + scriptId));
        return toResponse(execution);
    }

    @Transactional(readOnly = true)
    public AutomationExecutionResponse getById(Long executionId) {
        AutomationExecution execution = automationExecutionRepository.findById(executionId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Execution not found: " + executionId));
        return toResponse(execution);
    }

    private AutomationExecution createExecution(
            AutomationRun run,
            AutomationScript script,
            TestCase testCase,
            GeneratedScriptResponse generatedScript,
            LocalDateTime startedAt
    ) {
        AutomationExecution execution = new AutomationExecution(
                createExecutionBusinessId(startedAt),
                run,
                script,
                testCase,
                AutomationExecutionStatus.RUNNING,
                generatedScript.className(),
                generatedScript.generatedAt(),
                startedAt
        );

        return automationExecutionRepository.save(execution);
    }

    private AutomationScript findScript(Long scriptId) {
        return automationScriptRepository.findById(scriptId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Script not found: " + scriptId));
    }

    private void assertScriptNotRunning(Long scriptId) {
        if (automationExecutionRepository.existsByAutomationScript_IdAndStatus(
                scriptId,
                AutomationExecutionStatus.RUNNING
        )) {
            throw new AutomationConflictException(
                    "Automation Script already has a RUNNING execution");
        }
    }

    private AutomationRunStatus toRunStatus(AutomationExecutionStatus status) {
        return switch (status) {
            case RUNNING -> AutomationRunStatus.RUNNING;
            case PASSED -> AutomationRunStatus.PASSED;
            case FAILED -> AutomationRunStatus.FAILED;
            case TIMED_OUT -> AutomationRunStatus.TIMED_OUT;
            case ERROR -> AutomationRunStatus.ERROR;
        };
    }

    private String createRunBusinessId(LocalDateTime now) {
        return "RUN-" + ID_TIME_FORMAT.format(now) + "-" + randomPart();
    }

    private String createExecutionBusinessId(LocalDateTime now) {
        return "EXEC-" + ID_TIME_FORMAT.format(now) + "-" + randomPart();
    }

    private String randomPart() {
        return UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
    }

    private AutomationExecutionResponse toResponse(AutomationExecution execution) {
        return new AutomationExecutionResponse(
                execution.getId(),
                execution.getExecutionId(),
                execution.getAutomationRun().getId(),
                execution.getAutomationRun().getRunId(),
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

    private AutomationRunResponse toRunResponse(AutomationRun run) {
        return new AutomationRunResponse(
                run.getId(),
                run.getRunId(),
                run.getRunType(),
                run.getStatus(),
                run.getTotalExecutions(),
                run.getCompletedExecutions(),
                run.getPassedExecutions(),
                run.getFailedExecutions(),
                run.getStartedAt(),
                run.getFinishedAt(),
                run.getDurationMs()
        );
    }
}
