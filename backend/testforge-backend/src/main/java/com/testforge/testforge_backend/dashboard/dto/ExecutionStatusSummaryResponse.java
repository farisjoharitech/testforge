package com.testforge.testforge_backend.dashboard.dto;

public record ExecutionStatusSummaryResponse(

        long totalExecutions,

        long passed,

        long failed,

        long timedOut,

        long errors,

        double passRatePercentage

) {
}