package com.testforge.testforge_backend.projectmonitoring.dto;

public record ProjectTestPlanMonitoringResponse(
        Long testPlanId,
        String testPlanBusinessId,
        String testPlanName,
        long totalTestCases,
        long automatableTestCases,
        long automatedTestCases,
        double automationCoveragePercentage,
        long passedTestCases,
        long needsAttentionTestCases,
        long notRunTestCases,
        long manualTestCases,
        double passRatePercentage
) {
}
