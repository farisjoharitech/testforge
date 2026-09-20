package com.testforge.testforge_backend.dashboard.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.dashboard.dto.AutomationTypeSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.DashboardSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.ExecutionStatusSummaryResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentExecutionResponse;
import com.testforge.testforge_backend.dashboard.dto.PortfolioDashboardResponse;
import com.testforge.testforge_backend.dashboard.dto.PortfolioProjectResponse;
import com.testforge.testforge_backend.dashboard.dto.PortfolioTestPlanAttentionResponse;
import com.testforge.testforge_backend.dashboard.dto.RecentAutomationRunResponse;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectMonitoringResponse;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectTestPlanMonitoringResponse;
import com.testforge.testforge_backend.projectmonitoring.service.ProjectMonitoringService;
import com.testforge.testforge_backend.repository.AutomationRunRepository;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final TestCaseRepository
            testCaseRepository;

    private final AutomationScriptRepository
            automationScriptRepository;

    private final AutomationExecutionRepository
            automationExecutionRepository;

    private final ProjectRepository projectRepository;
    private final ProjectMonitoringService projectMonitoringService;
    private final AutomationRunRepository automationRunRepository;

    public DashboardService(
            TestCaseRepository testCaseRepository,
            AutomationScriptRepository automationScriptRepository,
            AutomationExecutionRepository automationExecutionRepository,
            ProjectRepository projectRepository,
            ProjectMonitoringService projectMonitoringService,
            AutomationRunRepository automationRunRepository
    ) {

        this.testCaseRepository =
                testCaseRepository;

        this.automationScriptRepository =
                automationScriptRepository;

        this.automationExecutionRepository =
                automationExecutionRepository;
        this.projectRepository = projectRepository;
        this.projectMonitoringService = projectMonitoringService;
        this.automationRunRepository = automationRunRepository;
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
                        .countByScenarioAutomatableTrue();

        long automatedTestCases =
                testCaseRepository
                        .countByScenarioAutomatableTrueAndAutomationStatus(
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
                        .countByScenarioAutomatableTrueAndAutomationType(
                                AutomationType.UI
                        );

        long api =
                testCaseRepository
                        .countByScenarioAutomatableTrueAndAutomationType(
                                AutomationType.API
                        );

        long uiApi =
                testCaseRepository
                        .countByScenarioAutomatableTrueAndAutomationType(
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


    @Transactional(readOnly = true)
    public PortfolioDashboardResponse getPortfolio() {
        List<ProjectMonitoringResponse> monitoring = projectRepository
                .findAllByOrderByIdAsc()
                .stream()
                .map(project -> projectMonitoringService.getMonitoring(project.getProjectId()))
                .toList();

        List<PortfolioProjectResponse> projects = monitoring.stream()
                .map(item -> new PortfolioProjectResponse(
                        item.projectId(), item.projectName(), item.totalTestPlans(),
                        item.totalTestCases(), item.automatableTestCases(), item.automatedTestCases(),
                        item.automationCoveragePercentage(), item.passedTestCases(),
                        item.needsAttentionTestCases(), item.notRunTestCases(), item.passRatePercentage()))
                .sorted(Comparator.comparingLong(PortfolioProjectResponse::needsAttentionTestCases).reversed()
                        .thenComparing(PortfolioProjectResponse::projectName))
                .toList();

        List<PortfolioTestPlanAttentionResponse> attentionPlans = new ArrayList<>();
        for (ProjectMonitoringResponse project : monitoring) {
            for (ProjectTestPlanMonitoringResponse plan : project.testPlans()) {
                if (plan.needsAttentionTestCases() > 0 || plan.notRunTestCases() > 0) {
                    attentionPlans.add(new PortfolioTestPlanAttentionResponse(
                            project.projectId(), project.projectName(), plan.testPlanId(),
                            plan.testPlanBusinessId(), plan.testPlanName(), plan.totalTestCases(),
                            plan.needsAttentionTestCases(), plan.notRunTestCases(),
                            plan.automationCoveragePercentage(), plan.passRatePercentage()));
                }
            }
        }
        attentionPlans.sort(
                Comparator.comparingLong(
                                PortfolioTestPlanAttentionResponse::needsAttentionTestCases
                        ).reversed()
                        .thenComparing(
                                Comparator.comparingLong(
                                        PortfolioTestPlanAttentionResponse::notRunTestCases
                                ).reversed()
                        )
        );

        List<RecentAutomationRunResponse> recentRuns = automationRunRepository
                .findTop8ByOrderByStartedAtDesc()
                .stream()
                .map(run -> new RecentAutomationRunResponse(
                        run.getId(), run.getRunId(), run.getRunType(), run.getStatus(),
                        run.getTotalExecutions(), run.getCompletedExecutions(),
                        run.getPassedExecutions(), run.getFailedExecutions(),
                        run.getStartedAt(), run.getFinishedAt(), run.getDurationMs()))
                .toList();

        long totalTestPlans = monitoring.stream().mapToLong(ProjectMonitoringResponse::totalTestPlans).sum();
        long projectsNeedingAttention = monitoring.stream().filter(item -> item.needsAttentionTestCases() > 0).count();

        return new PortfolioDashboardResponse(
                monitoring.size(), totalTestPlans, projectsNeedingAttention, attentionPlans.size(),
                projects, attentionPlans.stream().limit(10).toList(), recentRuns);
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
