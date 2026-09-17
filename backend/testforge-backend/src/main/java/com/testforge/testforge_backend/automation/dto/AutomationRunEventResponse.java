package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.execution.AutomationRunEventType;

import java.time.LocalDateTime;

public record AutomationRunEventResponse(
        long sequence,
        AutomationRunEventType eventType,
        Long runId,
        String runBusinessId,
        Long executionId,
        String executionBusinessId,
        Long testCaseId,
        String testCaseBusinessId,
        Integer stepOrder,
        String automationStepId,
        String actionType,
        String message,
        LocalDateTime occurredAt
) {
}
