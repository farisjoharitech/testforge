package com.testforge.testforge_backend.projectmonitoring.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectMonitoringExecutionResponse;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectMonitoringResponse;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectNeedsAttentionResponse;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectTestPlanMonitoringResponse;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProjectMonitoringService {

    private final ProjectService projectService;
    private final TestPlanRepository testPlanRepository;
    private final TestCaseRepository testCaseRepository;
    private final AutomationExecutionRepository automationExecutionRepository;

    public ProjectMonitoringService(
            ProjectService projectService,
            TestPlanRepository testPlanRepository,
            TestCaseRepository testCaseRepository,
            AutomationExecutionRepository automationExecutionRepository
    ) {
        this.projectService = projectService;
        this.testPlanRepository = testPlanRepository;
        this.testCaseRepository = testCaseRepository;
        this.automationExecutionRepository = automationExecutionRepository;
    }

    @Transactional(readOnly = true)
    public ProjectMonitoringResponse getMonitoring(
            String projectId
    ) {
        Project project = projectService.getByProjectId(
                projectId
        );

        List<TestPlan> testPlans =
                testPlanRepository.findByProjectOrderByIdAsc(
                        project
                );

        List<TestCase> testCases =
                testCaseRepository.findByProjectIdOrderByIdAsc(
                        project.getId()
                );

        List<AutomationExecution> completedExecutions =
                automationExecutionRepository
                        .findCompletedByProjectIdOrderByStartedAtDesc(
                                project.getId(),
                                AutomationExecutionStatus.RUNNING
                        );

        Map<Long, AutomationExecution> latestExecutionByTestCase =
                new LinkedHashMap<>();

        for (
                AutomationExecution execution
                : completedExecutions
        ) {
            latestExecutionByTestCase.putIfAbsent(
                    execution.getTestCase().getId(),
                    execution
            );
        }

        MonitoringCounters projectCounters =
                new MonitoringCounters();

        Map<Long, MonitoringCounters> testPlanCounters =
                new LinkedHashMap<>();

        for (TestPlan testPlan : testPlans) {
            testPlanCounters.put(
                    testPlan.getId(),
                    new MonitoringCounters()
            );
        }

        List<ProjectNeedsAttentionResponse> needsAttention =
                new ArrayList<>();

        for (TestCase testCase : testCases) {
            TestPlan testPlan = getTestPlan(
                    testCase
            );

            MonitoringCounters planCounters =
                    testPlanCounters.computeIfAbsent(
                            testPlan.getId(),
                            ignored -> new MonitoringCounters()
                    );

            AutomationExecution latestExecution =
                    latestExecutionByTestCase.get(
                            testCase.getId()
                    );

            applyTestCase(
                    projectCounters,
                    testCase,
                    latestExecution
            );

            applyTestCase(
                    planCounters,
                    testCase,
                    latestExecution
            );

            if (
                    latestExecution != null
                            && isNeedsAttention(
                            latestExecution.getStatus()
                    )
            ) {
                needsAttention.add(
                        toNeedsAttentionResponse(
                                latestExecution
                        )
                );
            }
        }

        List<ProjectTestPlanMonitoringResponse> testPlanBreakdown =
                testPlans
                        .stream()
                        .map(testPlan ->
                                toTestPlanResponse(
                                        testPlan,
                                        testPlanCounters.getOrDefault(
                                                testPlan.getId(),
                                                new MonitoringCounters()
                                        )
                                )
                        )
                        .toList();

        List<AutomationExecution> currentExecutions =
                latestExecutionByTestCase
                        .values()
                        .stream()
                        .sorted((left, right) ->
                                right.getStartedAt()
                                        .compareTo(
                                                left.getStartedAt()
                                        )
                        )
                        .toList();

        ProjectMonitoringExecutionResponse latestPassedExecution =
                currentExecutions
                        .stream()
                        .filter(execution ->
                                execution.getStatus()
                                        == AutomationExecutionStatus.PASSED
                        )
                        .findFirst()
                        .map(this::toExecutionResponse)
                        .orElse(null);

        ProjectMonitoringExecutionResponse latestFailedExecution =
                currentExecutions
                        .stream()
                        .filter(execution ->
                                execution.getStatus()
                                        == AutomationExecutionStatus.FAILED
                        )
                        .findFirst()
                        .map(this::toExecutionResponse)
                        .orElse(null);

        ProjectMonitoringExecutionResponse latestNeedsAttentionExecution =
                currentExecutions
                        .stream()
                        .filter(execution ->
                                isNeedsAttention(
                                        execution.getStatus()
                                )
                        )
                        .findFirst()
                        .map(this::toExecutionResponse)
                        .orElse(null);

        return new ProjectMonitoringResponse(
                project.getProjectId(),
                project.getName(),
                testPlans.size(),
                projectCounters.total,
                projectCounters.automatable,
                projectCounters.automated,
                calculatePercentage(
                        projectCounters.automated,
                        projectCounters.automatable
                ),
                projectCounters.passed,
                projectCounters.failed,
                projectCounters.timedOut,
                projectCounters.errors,
                projectCounters.needsAttention(),
                projectCounters.notRun,
                projectCounters.manual,
                projectCounters.completed(),
                calculatePercentage(
                        projectCounters.passed,
                        projectCounters.completed()
                ),
                latestPassedExecution,
                latestFailedExecution,
                latestNeedsAttentionExecution,
                testPlanBreakdown,
                needsAttention
        );
    }

    private void applyTestCase(
            MonitoringCounters counters,
            TestCase testCase,
            AutomationExecution latestExecution
    ) {
        counters.total++;

        boolean manual =
                !testCase.isAutomatable()
                        || testCase.getAutomationType()
                        == AutomationType.MANUAL;

        if (manual) {
            counters.manual++;
            return;
        }

        counters.automatable++;

        if (
                testCase.getAutomationStatus()
                        == AutomationStatus.AUTOMATED
        ) {
            counters.automated++;
        }

        if (latestExecution == null) {
            counters.notRun++;
            return;
        }

        switch (latestExecution.getStatus()) {
            case PASSED -> counters.passed++;
            case FAILED -> counters.failed++;
            case TIMED_OUT -> counters.timedOut++;
            case ERROR -> counters.errors++;
            case RUNNING -> {
                // RUNNING executions are intentionally excluded
                // from the completed execution query.
            }
        }
    }

    private ProjectTestPlanMonitoringResponse toTestPlanResponse(
            TestPlan testPlan,
            MonitoringCounters counters
    ) {
        return new ProjectTestPlanMonitoringResponse(
                testPlan.getId(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                counters.total,
                counters.automatable,
                counters.automated,
                calculatePercentage(
                        counters.automated,
                        counters.automatable
                ),
                counters.passed,
                counters.needsAttention(),
                counters.notRun,
                counters.manual,
                calculatePercentage(
                        counters.passed,
                        counters.completed()
                )
        );
    }

    private ProjectNeedsAttentionResponse toNeedsAttentionResponse(
            AutomationExecution execution
    ) {
        TestCase testCase = execution.getTestCase();
        TestPlan testPlan = getTestPlan(testCase);

        return new ProjectNeedsAttentionResponse(
                testCase.getId(),
                testCase.getTestCaseId(),
                testCase.getName(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                testCase.getAutomationType(),
                execution.getStatus(),
                execution.getExecutionId(),
                execution.getStartedAt(),
                execution.getDurationMs(),
                execution.getErrorMessage()
        );
    }

    private ProjectMonitoringExecutionResponse toExecutionResponse(
            AutomationExecution execution
    ) {
        TestCase testCase = execution.getTestCase();
        TestPlan testPlan = getTestPlan(testCase);

        return new ProjectMonitoringExecutionResponse(
                execution.getId(),
                execution.getExecutionId(),
                testCase.getId(),
                testCase.getTestCaseId(),
                testCase.getName(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                execution.getStatus(),
                execution.getStartedAt(),
                execution.getFinishedAt(),
                execution.getDurationMs()
        );
    }

    private TestPlan getTestPlan(
            TestCase testCase
    ) {
        return testCase
                .getTestScenario()
                .getRequirement()
                .getTestPlan();
    }

    private boolean isNeedsAttention(
            AutomationExecutionStatus status
    ) {
        return status
                == AutomationExecutionStatus.FAILED
                || status
                == AutomationExecutionStatus.TIMED_OUT
                || status
                == AutomationExecutionStatus.ERROR;
    }

    private double calculatePercentage(
            long numerator,
            long denominator
    ) {
        if (denominator <= 0) {
            return 0.0;
        }

        double percentage =
                (numerator * 100.0)
                        / denominator;

        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }

    private static class MonitoringCounters {
        private long total;
        private long automatable;
        private long automated;
        private long passed;
        private long failed;
        private long timedOut;
        private long errors;
        private long notRun;
        private long manual;

        private long needsAttention() {
            return failed + timedOut + errors;
        }

        private long completed() {
            return passed + needsAttention();
        }
    }
}
