package com.testforge.testforge_backend.hierarchymonitoring.dto;

import java.util.List;

public record TestPlanMonitoringResponse(
        Long testPlanId,
        String testPlanBusinessId,
        String testPlanName,
        String projectBusinessId,
        String projectName,
        long totalRequirements,
        long totalScenarios,
        MonitoringSummaryResponse summary,
        List<RequirementMonitoringBreakdownResponse> requirements
) {
}
