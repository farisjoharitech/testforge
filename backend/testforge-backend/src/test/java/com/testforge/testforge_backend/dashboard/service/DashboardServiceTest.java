package com.testforge.testforge_backend.dashboard.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.dashboard.dto.AutomationTypeSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.DashboardSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.ExecutionStatusSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentExecutionResponse;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    private TestCaseRepository
            testCaseRepository;

    private AutomationScriptRepository
            automationScriptRepository;

    private AutomationExecutionRepository
            automationExecutionRepository;

    private DashboardService
            dashboardService;

    @BeforeEach
    void setUp() {

        testCaseRepository =
                mock(
                        TestCaseRepository.class
                );

        automationScriptRepository =
                mock(
                        AutomationScriptRepository.class
                );

        automationExecutionRepository =
                mock(
                        AutomationExecutionRepository.class
                );

        dashboardService =
                new DashboardService(
                        testCaseRepository,
                        automationScriptRepository,
                        automationExecutionRepository
                );
    }

    /*
     * =========================================================
     * DASHBOARD SUMMARY
     * =========================================================
     */

    @Test
    void shouldCalculateDashboardSummary() {

        when(
                testCaseRepository.count()
        ).thenReturn(
                10L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrue()
        ).thenReturn(
                6L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrueAndAutomationStatus(
                                AutomationStatus.AUTOMATED
                        )
        ).thenReturn(
                2L
        );

        when(
                automationScriptRepository.count()
        ).thenReturn(
                4L
        );

        when(
                automationScriptRepository
                        .countByGeneratedAtIsNotNull()
        ).thenReturn(
                3L
        );

        DashboardSummaryResponse result =
                dashboardService
                        .getSummary();

        assertEquals(
                10L,
                result.totalTestCases()
        );

        assertEquals(
                6L,
                result.automatableTestCases()
        );

        assertEquals(
                2L,
                result.automatedTestCases()
        );

        assertEquals(
                33.33,
                result.automationCoveragePercentage()
        );

        assertEquals(
                4L,
                result.totalAutomationScripts()
        );

        assertEquals(
                3L,
                result.generatedScripts()
        );
    }

    @Test
    void shouldReturnZeroAutomationCoverageWhenNoAutomatableCasesExist() {

        when(
                testCaseRepository.count()
        ).thenReturn(
                5L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrue()
        ).thenReturn(
                0L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrueAndAutomationStatus(
                                AutomationStatus.AUTOMATED
                        )
        ).thenReturn(
                0L
        );

        DashboardSummaryResponse result =
                dashboardService
                        .getSummary();

        assertEquals(
                0.0,
                result.automationCoveragePercentage()
        );
    }

    /*
     * =========================================================
     * EXECUTION STATUS
     * =========================================================
     */

    @Test
    void shouldCalculateExecutionSummaryAndPassRate() {

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.PASSED
                        )
        ).thenReturn(
                4L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.FAILED
                        )
        ).thenReturn(
                2L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.TIMED_OUT
                        )
        ).thenReturn(
                1L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.ERROR
                        )
        ).thenReturn(
                1L
        );

        ExecutionStatusSummaryResponse result =
                dashboardService
                        .getExecutionStatusSummary();

        assertEquals(
                8L,
                result.totalExecutions()
        );

        assertEquals(
                4L,
                result.passed()
        );

        assertEquals(
                2L,
                result.failed()
        );

        assertEquals(
                1L,
                result.timedOut()
        );

        assertEquals(
                1L,
                result.errors()
        );

        assertEquals(
                50.0,
                result.passRatePercentage()
        );
    }

    @Test
    void shouldReturnZeroPassRateWhenNoCompletedExecutionsExist() {

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.PASSED
                        )
        ).thenReturn(
                0L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.FAILED
                        )
        ).thenReturn(
                0L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.TIMED_OUT
                        )
        ).thenReturn(
                0L
        );

        when(
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.ERROR
                        )
        ).thenReturn(
                0L
        );

        ExecutionStatusSummaryResponse result =
                dashboardService
                        .getExecutionStatusSummary();

        assertEquals(
                0L,
                result.totalExecutions()
        );

        assertEquals(
                0.0,
                result.passRatePercentage()
        );
    }

    /*
     * =========================================================
     * AUTOMATION TYPES
     * =========================================================
     */

    @Test
    void shouldCalculateAutomationTypeDistribution() {

        when(
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.UI
                        )
        ).thenReturn(
                3L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.API
                        )
        ).thenReturn(
                2L
        );

        when(
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.UI_API
                        )
        ).thenReturn(
                1L
        );

        AutomationTypeSummaryResponse result =
                dashboardService
                        .getAutomationTypeSummary();

        assertEquals(
                3L,
                result.ui()
        );

        assertEquals(
                2L,
                result.api()
        );

        assertEquals(
                1L,
                result.uiApi()
        );

        assertEquals(
                6L,
                result.totalAutomatable()
        );
    }

    /*
     * =========================================================
     * RECENT RESULTS
     * =========================================================
     */

    @Test
    void shouldReturnRecentCompletedExecutions() {

        AutomationExecution first =
                createRecentExecution(
                        "EXEC-RECENT-001",
                        AutomationExecutionStatus.PASSED,
                        8_000L
                );

        AutomationExecution second =
                createRecentExecution(
                        "EXEC-RECENT-002",
                        AutomationExecutionStatus.FAILED,
                        4_500L
                );

        when(
                automationExecutionRepository
                        .findTop5ByStatusNotOrderByStartedAtDesc(
                                AutomationExecutionStatus.RUNNING
                        )
        ).thenReturn(
                List.of(
                        first,
                        second
                )
        );

        List<RecentExecutionResponse> results =
                dashboardService
                        .getRecentResults();

        assertEquals(
                2,
                results.size()
        );

        assertEquals(
                "EXEC-RECENT-001",
                results.get(0)
                        .executionId()
        );

        assertEquals(
                "TC-DASH-001",
                results.get(0)
                        .testCaseBusinessId()
        );

        assertEquals(
                "Dashboard Test Case",
                results.get(0)
                        .testCaseName()
        );

        assertEquals(
                "AUTO-DASH-001",
                results.get(0)
                        .automationScriptBusinessId()
        );

        assertEquals(
                AutomationExecutionStatus.PASSED,
                results.get(0)
                        .status()
        );

        assertEquals(
                8_000L,
                results.get(0)
                        .durationMs()
        );

        verify(
                automationExecutionRepository
        ).findTop5ByStatusNotOrderByStartedAtDesc(
                AutomationExecutionStatus.RUNNING
        );
    }

    private AutomationExecution
    createRecentExecution(
            String executionId,
            AutomationExecutionStatus status,
            Long durationMs
    ) {

        TestCase testCase =
                mock(
                        TestCase.class
                );

        when(
                testCase.getId()
        ).thenReturn(
                50L
        );

        when(
                testCase.getTestCaseId()
        ).thenReturn(
                "TC-DASH-001"
        );

        when(
                testCase.getName()
        ).thenReturn(
                "Dashboard Test Case"
        );

        AutomationScript script =
                mock(
                        AutomationScript.class
                );

        when(
                script.getAutomationScriptId()
        ).thenReturn(
                "AUTO-DASH-001"
        );

        AutomationExecution execution =
                mock(
                        AutomationExecution.class
                );

        LocalDateTime startedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        21,
                        0
                );

        when(
                execution.getExecutionId()
        ).thenReturn(
                executionId
        );

        when(
                execution.getTestCase()
        ).thenReturn(
                testCase
        );

        when(
                execution.getAutomationScript()
        ).thenReturn(
                script
        );

        when(
                execution.getStatus()
        ).thenReturn(
                status
        );

        when(
                execution.getStartedAt()
        ).thenReturn(
                startedAt
        );

        when(
                execution.getFinishedAt()
        ).thenReturn(
                startedAt.plusNanos(
                        durationMs * 1_000_000
                )
        );

        when(
                execution.getDurationMs()
        ).thenReturn(
                durationMs
        );

        return execution;
    }
}