package com.testforge.testforge_backend.hierarchymonitoring.dto;

public record RequirementMonitoringBreakdownResponse(
        Long requirementId,
        String requirementBusinessId,
        String description,
        long totalScenarios,
        MonitoringSummaryResponse summary
) {
}
