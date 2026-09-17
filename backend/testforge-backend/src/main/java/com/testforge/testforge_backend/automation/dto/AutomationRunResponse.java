package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;

import java.time.LocalDateTime;

public record AutomationRunResponse(
        Long id,
        String runId,
        AutomationRunType runType,
        AutomationRunStatus status,
        int totalExecutions,
        int completedExecutions,
        int passedExecutions,
        int failedExecutions,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        Long durationMs
) {
}
