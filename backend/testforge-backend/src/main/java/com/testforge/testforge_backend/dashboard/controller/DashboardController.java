package com.testforge.testforge_backend.dashboard.controller;

import com.testforge.testforge_backend.dashboard.dto.AutomationTypeSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.DashboardSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.ExecutionStatusSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentExecutionResponse;
import com.testforge.testforge_backend.dashboard.dto.PortfolioDashboardResponse;
import com.testforge.testforge_backend.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(
        "/api/dashboard"
)
public class DashboardController {

    private final DashboardService
            dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {

        this.dashboardService =
                dashboardService;
    }

    /*
     * GET
     * /api/dashboard/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<
            DashboardSummaryResponse
            >
    getSummary() {

        return ResponseEntity.ok(
                dashboardService
                        .getSummary()
        );
    }

    /*
     * GET
     * /api/dashboard/execution-status
     */
    @GetMapping(
            "/execution-status"
    )
    public ResponseEntity<
            ExecutionStatusSummaryResponse
            >
    getExecutionStatusSummary() {

        return ResponseEntity.ok(
                dashboardService
                        .getExecutionStatusSummary()
        );
    }

    /*
     * GET
     * /api/dashboard/automation-types
     */
    @GetMapping(
            "/automation-types"
    )
    public ResponseEntity<
            AutomationTypeSummaryResponse
            >
    getAutomationTypeSummary() {

        return ResponseEntity.ok(
                dashboardService
                        .getAutomationTypeSummary()
        );
    }

    /*
     * GET
     * /api/dashboard/recent-results
     */
    @GetMapping("/portfolio")
    public ResponseEntity<PortfolioDashboardResponse> getPortfolio() {
        return ResponseEntity.ok(dashboardService.getPortfolio());
    }

    @GetMapping(
            "/recent-results"
    )
    public ResponseEntity<
            List<RecentExecutionResponse>
            >
    getRecentResults() {

        return ResponseEntity.ok(
                dashboardService
                        .getRecentResults()
        );
    }
}