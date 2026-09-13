package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;

import java.time.LocalDateTime;

public record AutomationResultSummaryResponse(

        Long id,

        String executionId,

        Long automationScriptId,

        String automationScriptBusinessId,

        Long testCaseId,

        String testCaseBusinessId,

        String testCaseName,

        AutomationExecutionStatus status,

        String generatedClassName,

        Integer exitCode,

        LocalDateTime startedAt,

        LocalDateTime finishedAt,

        Long durationMs,

        boolean successful

) {
}