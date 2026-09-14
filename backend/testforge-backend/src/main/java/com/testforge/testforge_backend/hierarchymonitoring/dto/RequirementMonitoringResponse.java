package com.testforge.testforge_backend.hierarchymonitoring.dto;

import java.util.List;

public record RequirementMonitoringResponse(
        Long requirementId,
        String requirementBusinessId,
        String description,
        String testPlanBusinessId,
        String testPlanName,
        long totalScenarios,
        MonitoringSummaryResponse summary,
        List<ScenarioMonitoringBreakdownResponse> scenarios
) {
}
