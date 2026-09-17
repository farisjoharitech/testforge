package com.testforge.testforge_backend.dashboard.dto;

public record PortfolioProjectResponse(
        String projectId,
        String projectName,
        long totalTestPlans,
        long totalTestCases,
        long automatableTestCases,
        long automatedTestCases,
        double automationCoveragePercentage,
        long passedTestCases,
        long needsAttentionTestCases,
        long notRunTestCases,
        double passRatePercentage
) {
}
