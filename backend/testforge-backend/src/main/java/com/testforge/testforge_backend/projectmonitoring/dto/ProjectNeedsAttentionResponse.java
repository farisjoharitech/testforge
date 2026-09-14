package com.testforge.testforge_backend.projectmonitoring.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;

import java.time.LocalDateTime;

public record ProjectNeedsAttentionResponse(
        Long testCaseId,
        String testCaseBusinessId,
        String testCaseName,
        String testPlanBusinessId,
        String testPlanName,
        AutomationType automationType,
        AutomationExecutionStatus status,
        String executionId,
        LocalDateTime startedAt,
        Long durationMs,
        String errorMessage
) {
}
