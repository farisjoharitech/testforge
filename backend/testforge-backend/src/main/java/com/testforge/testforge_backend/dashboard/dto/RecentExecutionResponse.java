package com.testforge.testforge_backend.dashboard.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;

import java.time.LocalDateTime;

public record RecentExecutionResponse(

        String executionId,

        Long testCaseId,

        String testCaseBusinessId,

        String testCaseName,

        String automationScriptBusinessId,

        AutomationExecutionStatus status,

        LocalDateTime startedAt,

        LocalDateTime finishedAt,

        Long durationMs

) {
}