package com.testforge.testforge_backend.hierarchymonitoring.dto;

import com.testforge.testforge_backend.domain.enums.TestType;

public record ScenarioMonitoringBreakdownResponse(
        Long scenarioId,
        String scenarioBusinessId,
        String description,
        TestType testType,
        MonitoringSummaryResponse summary
) {
}
