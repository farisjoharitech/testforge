package com.testforge.testforge_backend.projectmonitoring.dto;

import java.util.List;

public record ProjectMonitoringResponse(
        String projectId,
        String projectName,
        long totalTestPlans,
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
        double passRatePercentage,
        ProjectMonitoringExecutionResponse latestPassedExecution,
        ProjectMonitoringExecutionResponse latestFailedExecution,
        ProjectMonitoringExecutionResponse latestNeedsAttentionExecution,
        List<ProjectTestPlanMonitoringResponse> testPlans,
        List<ProjectNeedsAttentionResponse> needsAttention
) {
}
