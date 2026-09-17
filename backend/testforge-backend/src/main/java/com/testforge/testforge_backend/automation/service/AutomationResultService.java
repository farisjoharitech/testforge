package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationResultResponse;
import com.testforge.testforge_backend.automation.dto.AutomationResultSummaryResponse;
import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AutomationResultService {

    private final AutomationExecutionRepository
            automationExecutionRepository;

    public AutomationResultService(
            AutomationExecutionRepository automationExecutionRepository
    ) {

        this.automationExecutionRepository =
                automationExecutionRepository;
    }

    /*
     * =========================================================
     * ALL RESULTS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<AutomationResultSummaryResponse> getAllResults(
            AutomationExecutionStatus status
    ) {

        List<AutomationExecution> executions =
                automationExecutionRepository
                        .findAllByOrderByStartedAtDesc();

        return executions
                .stream()
                .filter(this::isCompleted)
                .filter(
                        execution ->
                                status == null
                                        || execution.getStatus()
                                        == status
                )
                .map(this::toSummaryResponse)
                .toList();
    }

    /*
     * =========================================================
     * SCRIPT RESULTS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<AutomationResultSummaryResponse>
    getResultsByAutomationScript(
            Long automationScriptId
    ) {

        if (automationScriptId == null) {

            throw new IllegalArgumentException(
                    "Automation script ID is required"
            );
        }

        return automationExecutionRepository
                .findByAutomationScript_IdOrderByStartedAtDesc(
                        automationScriptId
                )
                .stream()
                .filter(this::isCompleted)
                .map(this::toSummaryResponse)
                .toList();
    }

    /*
     * =========================================================
     * TEST CASE RESULTS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<AutomationResultSummaryResponse>
    getResultsByTestCase(
            Long testCaseId
    ) {

        if (testCaseId == null) {

            throw new IllegalArgumentException(
                    "Test Case ID is required"
            );
        }

        return automationExecutionRepository
                .findByTestCase_IdOrderByStartedAtDesc(
                        testCaseId
                )
                .stream()
                .filter(this::isCompleted)
                .map(this::toSummaryResponse)
                .toList();
    }

    /*
     * =========================================================
     * RESULT DETAIL
     * =========================================================
     */

    @Transactional(readOnly = true)
    public AutomationResultResponse getResult(
            String executionId
    ) {

        if (
                executionId == null
                        || executionId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Execution ID is required"
            );
        }

        AutomationExecution execution =
                automationExecutionRepository
                        .findByExecutionId(
                                executionId.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new AutomationNotFoundException(
                                                "Automation execution not found: "
                                                        + executionId
                                        )
                        );

        if (
                execution.getStatus()
                        == AutomationExecutionStatus.RUNNING
        ) {

            throw new AutomationConflictException(
                    "Automation execution is still running and does not have a final result yet"
            );
        }

        return toDetailResponse(
                execution
        );
    }

    /*
     * =========================================================
     * COMPLETED EXECUTION
     * =========================================================
     */

    private boolean isCompleted(
            AutomationExecution execution
    ) {

        return execution.getStatus()
                != AutomationExecutionStatus.RUNNING;
    }

    /*
     * =========================================================
     * MAPPING
     * =========================================================
     */

    private AutomationResultSummaryResponse toSummaryResponse(
            AutomationExecution execution
    ) {

        return new AutomationResultSummaryResponse(

                execution.getId(),

                execution.getExecutionId(),

                execution.getAutomationScript() == null ? null : execution.getAutomationScript().getId(),

                execution.getAutomationScript() == null ? execution.getAutomationScriptBusinessIdSnapshot() : execution.getAutomationScript().getAutomationScriptId(),

                execution.getTestCase() == null ? null : execution.getTestCase().getId(),

                execution.getTestCase() == null ? execution.getTestCaseBusinessIdSnapshot() : execution.getTestCase().getTestCaseId(),

                execution.getTestCase() == null ? execution.getTestCaseNameSnapshot() : execution.getTestCase().getName(),

                execution.getStatus(),

                execution.getGeneratedClassName(),

                execution.getExitCode(),

                execution.getStartedAt(),

                execution.getFinishedAt(),

                execution.getDurationMs(),

                execution.getStatus()
                        == AutomationExecutionStatus.PASSED
        );
    }

    private AutomationResultResponse toDetailResponse(
            AutomationExecution execution
    ) {

        return new AutomationResultResponse(

                execution.getId(),

                execution.getExecutionId(),

                execution.getAutomationScript() == null ? null : execution.getAutomationScript().getId(),

                execution.getAutomationScript() == null ? execution.getAutomationScriptBusinessIdSnapshot() : execution.getAutomationScript().getAutomationScriptId(),

                execution.getTestCase() == null ? null : execution.getTestCase().getId(),

                execution.getTestCase() == null ? execution.getTestCaseBusinessIdSnapshot() : execution.getTestCase().getTestCaseId(),

                execution.getTestCase() == null ? execution.getTestCaseNameSnapshot() : execution.getTestCase().getName(),

                execution.getStatus(),

                execution.getGeneratedClassName(),

                execution.getGeneratedAt(),

                execution.getExitCode(),

                execution.getLogOutput(),

                execution.getErrorMessage(),

                execution.getFailedStepOrder(),

                execution.getFailedAutomationStepId(),

                execution.getFailedActionType(),

                execution.getFailureScreenshotPath() != null
                        && !execution.getFailureScreenshotPath().isBlank(),

                execution.getTracePath() != null
                        && !execution.getTracePath().isBlank(),

                execution.getLogOutput() != null
                        && !execution.getLogOutput().isBlank(),

                execution.getStartedAt(),

                execution.getFinishedAt(),

                execution.getDurationMs(),

                execution.getStatus()
                        == AutomationExecutionStatus.PASSED
        );
    }
}