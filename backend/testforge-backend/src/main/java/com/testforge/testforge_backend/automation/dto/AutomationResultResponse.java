package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;

import java.time.LocalDateTime;

public record AutomationResultResponse(

        Long id,

        String executionId,

        Long automationScriptId,

        String automationScriptBusinessId,

        Long testCaseId,

        String testCaseBusinessId,

        String testCaseName,

        AutomationExecutionStatus status,

        String generatedClassName,

        LocalDateTime generatedAt,

        Integer exitCode,

        String logOutput,

        String errorMessage,

        LocalDateTime startedAt,

        LocalDateTime finishedAt,

        Long durationMs,

        boolean successful

) {
}