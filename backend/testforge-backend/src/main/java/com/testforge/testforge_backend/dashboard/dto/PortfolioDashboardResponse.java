package com.testforge.testforge_backend.dashboard.dto;

import java.util.List;

public record PortfolioDashboardResponse(
        long totalProjects,
        long totalTestPlans,
        long projectsNeedingAttention,
        long testPlansNeedingAttention,
        List<PortfolioProjectResponse> projects,
        List<PortfolioTestPlanAttentionResponse> testPlansNeedingAttentionList,
        List<RecentAutomationRunResponse> recentRuns
) {
}
