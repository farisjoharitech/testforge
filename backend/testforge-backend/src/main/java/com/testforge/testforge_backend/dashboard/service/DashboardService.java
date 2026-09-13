package com.testforge.testforge_backend.dashboard.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.dashboard.dto.AutomationTypeSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.DashboardSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.ExecutionStatusSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentExecutionResponse;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final TestCaseRepository
            testCaseRepository;

    private final AutomationScriptRepository
            automationScriptRepository;

    private final AutomationExecutionRepository
            automationExecutionRepository;

    public DashboardService(
            TestCaseRepository testCaseRepository,
            AutomationScriptRepository automationScriptRepository,
            AutomationExecutionRepository automationExecutionRepository
    ) {

        this.testCaseRepository =
                testCaseRepository;

        this.automationScriptRepository =
                automationScriptRepository;

        this.automationExecutionRepository =
                automationExecutionRepository;
    }

    /*
     * =========================================================
     * TEST / AUTOMATION SUMMARY
     * =========================================================
     */

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {

        long totalTestCases =
                testCaseRepository.count();

        long automatableTestCases =
                testCaseRepository
                        .countByAutomatableTrue();

        long automatedTestCases =
                testCaseRepository
                        .countByAutomatableTrueAndAutomationStatus(
                                AutomationStatus.AUTOMATED
                        );

        long totalAutomationScripts =
                automationScriptRepository.count();

        long generatedScripts =
                automationScriptRepository
                        .countByGeneratedAtIsNotNull();

        double automationCoveragePercentage =
                calculatePercentage(
                        automatedTestCases,
                        automatableTestCases
                );

        return new DashboardSummaryResponse(

                totalTestCases,

                automatableTestCases,

                automatedTestCases,

                automationCoveragePercentage,

                totalAutomationScripts,

                generatedScripts
        );
    }

    /*
     * =========================================================
     * EXECUTION SUMMARY
     * =========================================================
     */

    @Transactional(readOnly = true)
    public ExecutionStatusSummaryResponse
    getExecutionStatusSummary() {

        long passed =
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.PASSED
                        );

        long failed =
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.FAILED
                        );

        long timedOut =
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.TIMED_OUT
                        );

        long errors =
                automationExecutionRepository
                        .countByStatus(
                                AutomationExecutionStatus.ERROR
                        );

        /*
         * RUNNING is intentionally not
         * included in completed executions.
         */
        long totalExecutions =
                passed
                        + failed
                        + timedOut
                        + errors;

        double passRatePercentage =
                calculatePercentage(
                        passed,
                        totalExecutions
                );

        return new ExecutionStatusSummaryResponse(

                totalExecutions,

                passed,

                failed,

                timedOut,

                errors,

                passRatePercentage
        );
    }

    /*
     * =========================================================
     * AUTOMATION TYPE SUMMARY
     * =========================================================
     */

    @Transactional(readOnly = true)
    public AutomationTypeSummaryResponse
    getAutomationTypeSummary() {

        long ui =
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.UI
                        );

        long api =
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.API
                        );

        long uiApi =
                testCaseRepository
                        .countByAutomatableTrueAndAutomationType(
                                AutomationType.UI_API
                        );

        long totalAutomatable =
                ui
                        + api
                        + uiApi;

        return new AutomationTypeSummaryResponse(

                ui,

                api,

                uiApi,

                totalAutomatable
        );
    }

    /*
     * =========================================================
     * RECENT COMPLETED EXECUTIONS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<RecentExecutionResponse>
    getRecentResults() {

        return automationExecutionRepository
                .findTop5ByStatusNotOrderByStartedAtDesc(
                        AutomationExecutionStatus.RUNNING
                )
                .stream()
                .map(
                        this::toRecentExecutionResponse
                )
                .toList();
    }

    /*
     * =========================================================
     * MAPPING
     * =========================================================
     */

    private RecentExecutionResponse
    toRecentExecutionResponse(
            AutomationExecution execution
    ) {

        return new RecentExecutionResponse(

                execution.getExecutionId(),

                execution
                        .getTestCase()
                        .getId(),

                execution
                        .getTestCase()
                        .getTestCaseId(),

                execution
                        .getTestCase()
                        .getName(),

                execution
                        .getAutomationScript()
                        .getAutomationScriptId(),

                execution.getStatus(),

                execution.getStartedAt(),

                execution.getFinishedAt(),

                execution.getDurationMs()
        );
    }

    /*
     * =========================================================
     * PERCENTAGE
     * =========================================================
     */

    private double calculatePercentage(
            long numerator,
            long denominator
    ) {

        if (denominator <= 0) {

            return 0.0;
        }

        double percentage =
                (
                        (double) numerator
                                / denominator
                )
                        * 100.0;

        /*
         * Keep two decimal places.
         *
         * Example:
         * 66.666666 -> 66.67
         */
        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }
}