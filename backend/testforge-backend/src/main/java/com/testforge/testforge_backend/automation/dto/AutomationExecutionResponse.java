package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;

import java.time.LocalDateTime;

public record AutomationExecutionResponse(
        Long id,
        String executionId,
        Long automationRunId,
        String automationRunBusinessId,
        Long automationScriptId,
        String automationScriptBusinessId,
        Long testCaseId,
        String testCaseBusinessId,
        AutomationExecutionStatus status,
        String generatedClassName,
        LocalDateTime generatedAt,
        Integer exitCode,
        String logOutput,
        String errorMessage,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        Long durationMs
) {
}
