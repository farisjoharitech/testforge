package com.testforge.testforge_backend.dashboard.dto;

public record PortfolioTestPlanAttentionResponse(
        String projectId,
        String projectName,
        Long testPlanId,
        String testPlanBusinessId,
        String testPlanName,
        long totalTestCases,
        long needsAttentionTestCases,
        long notRunTestCases,
        double automationCoveragePercentage,
        double passRatePercentage
) {
}
