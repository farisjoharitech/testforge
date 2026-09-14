package com.testforge.testforge_backend.projectmonitoring.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;

import java.time.LocalDateTime;

public record ProjectMonitoringExecutionResponse(
        Long id,
        String executionId,
        Long testCaseId,
        String testCaseBusinessId,
        String testCaseName,
        String testPlanBusinessId,
        String testPlanName,
        AutomationExecutionStatus status,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        Long durationMs
) {
}
