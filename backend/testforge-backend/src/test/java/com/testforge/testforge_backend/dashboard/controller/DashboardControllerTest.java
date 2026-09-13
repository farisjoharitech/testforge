package com.testforge.testforge_backend.dashboard.controller;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.dashboard.dto.AutomationTypeSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.DashboardSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.ExecutionStatusSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentExecutionResponse;
import com.testforge.testforge_backend.dashboard.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DashboardControllerTest {

    private DashboardService
            dashboardService;

    private MockMvc
            mockMvc;

    @BeforeEach
    void setUp() {

        dashboardService =
                mock(
                        DashboardService.class
                );

        DashboardController controller =
                new DashboardController(
                        dashboardService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                controller
                        )
                        .build();
    }

    @Test
    void shouldGetDashboardSummary()
            throws Exception {

        when(
                dashboardService
                        .getSummary()
        ).thenReturn(
                new DashboardSummaryResponse(
                        10L,
                        6L,
                        2L,
                        33.33,
                        4L,
                        3L
                )
        );

        mockMvc.perform(
                        get(
                                "/api/dashboard/summary"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.totalTestCases"
                        ).value(
                                10
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automatableTestCases"
                        ).value(
                                6
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automatedTestCases"
                        ).value(
                                2
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automationCoveragePercentage"
                        ).value(
                                33.33
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.totalAutomationScripts"
                        ).value(
                                4
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.generatedScripts"
                        ).value(
                                3
                        )
                );
    }

    @Test
    void shouldGetExecutionStatusSummary()
            throws Exception {

        when(
                dashboardService
                        .getExecutionStatusSummary()
        ).thenReturn(
                new ExecutionStatusSummaryResponse(
                        8L,
                        4L,
                        2L,
                        1L,
                        1L,
                        50.0
                )
        );

        mockMvc.perform(
                        get(
                                "/api/dashboard/execution-status"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.totalExecutions"
                        ).value(
                                8
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.passed"
                        ).value(
                                4
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.failed"
                        ).value(
                                2
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.timedOut"
                        ).value(
                                1
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.errors"
                        ).value(
                                1
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.passRatePercentage"
                        ).value(
                                50.0
                        )
                );
    }

    @Test
    void shouldGetAutomationTypeSummary()
            throws Exception {

        when(
                dashboardService
                        .getAutomationTypeSummary()
        ).thenReturn(
                new AutomationTypeSummaryResponse(
                        3L,
                        2L,
                        1L,
                        6L
                )
        );

        mockMvc.perform(
                        get(
                                "/api/dashboard/automation-types"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.ui"
                        ).value(
                                3
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.api"
                        ).value(
                                2
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.uiApi"
                        ).value(
                                1
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.totalAutomatable"
                        ).value(
                                6
                        )
                );
    }

    @Test
    void shouldGetRecentResults()
            throws Exception {

        LocalDateTime startedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        21,
                        0
                );

        when(
                dashboardService
                        .getRecentResults()
        ).thenReturn(
                List.of(
                        new RecentExecutionResponse(
                                "EXEC-RECENT-001",
                                50L,
                                "TC-001",
                                "Valid Login",
                                "AUTOSCRIPT-001",
                                AutomationExecutionStatus.PASSED,
                                startedAt,
                                startedAt.plusSeconds(
                                        8
                                ),
                                8_000L
                        )
                )
        );

        mockMvc.perform(
                        get(
                                "/api/dashboard/recent-results"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.length()"
                        ).value(
                                1
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].executionId"
                        ).value(
                                "EXEC-RECENT-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].testCaseBusinessId"
                        ).value(
                                "TC-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].status"
                        ).value(
                                "PASSED"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].durationMs"
                        ).value(
                                8000
                        )
                );
    }

    @Test
    void shouldReturnEmptyRecentResultArray()
            throws Exception {

        when(
                dashboardService
                        .getRecentResults()
        ).thenReturn(
                List.of()
        );

        mockMvc.perform(
                        get(
                                "/api/dashboard/recent-results"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.length()"
                        ).value(
                                0
                        )
                );
    }
}