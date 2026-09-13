package com.testforge.testforge_backend.dashboard.dto;

public record AutomationTypeSummaryResponse(

        long ui,

        long api,

        long uiApi,

        long totalAutomatable

) {
}