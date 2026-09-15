package com.testforge.testforge_backend.monitoringdrilldown.dto;

import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestType;

import java.time.LocalDateTime;

public record MonitoringDrilldownItemResponse(
        Long testCaseId,
        String testCaseBusinessId,
        String testCaseName,
        TestCasePriority priority,
        TestType testType,
        boolean automatable,
        AutomationType automationType,
        AutomationStatus automationStatus,
        String testPlanBusinessId,
        String testPlanName,
        String requirementBusinessId,
        String requirementDescription,
        String scenarioBusinessId,
        String scenarioDescription,
        MonitoringDrilldownStatus currentResult,
        String executionId,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        Long durationMs,
        String errorMessage
) {
}
