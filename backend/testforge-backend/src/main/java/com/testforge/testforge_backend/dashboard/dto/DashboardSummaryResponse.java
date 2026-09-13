package com.testforge.testforge_backend.dashboard.dto;

public record DashboardSummaryResponse(

        long totalTestCases,

        long automatableTestCases,

        long automatedTestCases,

        double automationCoveragePercentage,

        long totalAutomationScripts,

        long generatedScripts

) {
}