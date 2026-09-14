package com.testforge.testforge_backend.hierarchymonitoring.dto;

public record MonitoringSummaryResponse(
        long totalTestCases,
        long automatableTestCases,
        long automatedTestCases,
        double automationCoveragePercentage,
        long passedTestCases,
        long failedTestCases,
        long timedOutTestCases,
        long errorTestCases,
        long needsAttentionTestCases,
        long notRunTestCases,
        long manualTestCases,
        long currentCompletedTestCases,
        double passRatePercentage
) {
}
