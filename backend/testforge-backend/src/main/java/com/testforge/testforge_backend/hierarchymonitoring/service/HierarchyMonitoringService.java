package com.testforge.testforge_backend.hierarchymonitoring.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.hierarchymonitoring.dto.MonitoringSummaryResponse;
import com.testforge.testforge_backend.hierarchymonitoring.dto.RequirementMonitoringBreakdownResponse;
import com.testforge.testforge_backend.hierarchymonitoring.dto.RequirementMonitoringResponse;
import com.testforge.testforge_backend.hierarchymonitoring.dto.ScenarioMonitoringBreakdownResponse;
import com.testforge.testforge_backend.hierarchymonitoring.dto.TestPlanMonitoringResponse;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.service.RequirementService;
import com.testforge.testforge_backend.service.TestPlanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HierarchyMonitoringService {

    private final TestPlanService testPlanService;
    private final RequirementService requirementService;
    private final RequirementRepository requirementRepository;
    private final TestScenarioRepository testScenarioRepository;
    private final TestCaseRepository testCaseRepository;
    private final AutomationExecutionRepository automationExecutionRepository;

    public HierarchyMonitoringService(
            TestPlanService testPlanService,
            RequirementService requirementService,
            RequirementRepository requirementRepository,
            TestScenarioRepository testScenarioRepository,
            TestCaseRepository testCaseRepository,
            AutomationExecutionRepository automationExecutionRepository
    ) {
        this.testPlanService = testPlanService;
        this.requirementService = requirementService;
        this.requirementRepository = requirementRepository;
        this.testScenarioRepository = testScenarioRepository;
        this.testCaseRepository = testCaseRepository;
        this.automationExecutionRepository = automationExecutionRepository;
    }

    @Transactional(readOnly = true)
    public TestPlanMonitoringResponse getTestPlanMonitoring(
            String testPlanId
    ) {
        TestPlan testPlan = testPlanService.getByTestPlanId(testPlanId);

        List<Requirement> requirements =
                requirementRepository.findByModuleTestPlanOrderByIdAsc(testPlan);

        List<TestCase> testCases =
                testCaseRepository.findByTestPlanIdOrderByIdAsc(testPlan.getId());

        Map<Long, AutomationExecution> latestByTestCase =
                latestByTestCase(
                        automationExecutionRepository
                                .findCompletedByTestPlanIdOrderByStartedAtDesc(
                                        testPlan.getId(),
                                        AutomationExecutionStatus.RUNNING
                                )
                );

        Counters totalCounters = new Counters();
        Map<Long, Counters> requirementCounters = new LinkedHashMap<>();
        Map<Long, Long> scenarioCounts = new LinkedHashMap<>();

        for (Requirement requirement : requirements) {
            requirementCounters.put(requirement.getId(), new Counters());
            scenarioCounts.put(
                    requirement.getId(),
                    (long) testScenarioRepository
                            .findByRequirementOrderByIdAsc(requirement)
                            .size()
            );
        }

        for (TestCase testCase : testCases) {
            Requirement requirement = getRequirement(testCase);
            AutomationExecution latest = latestByTestCase.get(testCase.getId());

            apply(totalCounters, testCase, latest);
            apply(
                    requirementCounters.computeIfAbsent(
                            requirement.getId(),
                            ignored -> new Counters()
                    ),
                    testCase,
                    latest
            );
        }

        List<RequirementMonitoringBreakdownResponse> breakdown =
                requirements.stream()
                        .map(requirement ->
                                new RequirementMonitoringBreakdownResponse(
                                        requirement.getId(),
                                        requirement.getRequirementId(),
                                        requirement.getDescription(),
                                        scenarioCounts.getOrDefault(
                                                requirement.getId(),
                                                0L
                                        ),
                                        toSummary(
                                                requirementCounters.getOrDefault(
                                                        requirement.getId(),
                                                        new Counters()
                                                )
                                        )
                                )
                        )
                        .toList();

        long totalScenarios = scenarioCounts.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();

        return new TestPlanMonitoringResponse(
                testPlan.getId(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                testPlan.getProject().getProjectId(),
                testPlan.getProject().getName(),
                requirements.size(),
                totalScenarios,
                toSummary(totalCounters),
                breakdown
        );
    }

    @Transactional(readOnly = true)
    public RequirementMonitoringResponse getRequirementMonitoring(
            String requirementId
    ) {
        Requirement requirement =
                requirementService.getByRequirementId(requirementId);

        List<TestScenario> scenarios =
                testScenarioRepository.findByRequirementOrderByIdAsc(requirement);

        List<TestCase> testCases =
                testCaseRepository.findByRequirementIdOrderByIdAsc(
                        requirement.getId()
                );

        Map<Long, AutomationExecution> latestByTestCase =
                latestByTestCase(
                        automationExecutionRepository
                                .findCompletedByRequirementIdOrderByStartedAtDesc(
                                        requirement.getId(),
                                        AutomationExecutionStatus.RUNNING
                                )
                );

        Counters totalCounters = new Counters();
        Map<Long, Counters> scenarioCounters = new LinkedHashMap<>();

        for (TestScenario scenario : scenarios) {
            scenarioCounters.put(scenario.getId(), new Counters());
        }

        for (TestCase testCase : testCases) {
            TestScenario scenario = testCase.getTestScenario();
            AutomationExecution latest = latestByTestCase.get(testCase.getId());

            apply(totalCounters, testCase, latest);
            apply(
                    scenarioCounters.computeIfAbsent(
                            scenario.getId(),
                            ignored -> new Counters()
                    ),
                    testCase,
                    latest
            );
        }

        List<ScenarioMonitoringBreakdownResponse> breakdown =
                scenarios.stream()
                        .map(scenario ->
                                new ScenarioMonitoringBreakdownResponse(
                                        scenario.getId(),
                                        scenario.getScenarioId(),
                                        scenario.getDescription(),
                                        scenario.getTestType(),
                                        toSummary(
                                                scenarioCounters.getOrDefault(
                                                        scenario.getId(),
                                                        new Counters()
                                                )
                                        )
                                )
                        )
                        .toList();

        TestPlan testPlan = requirement.getModule().getTestPlan();

        return new RequirementMonitoringResponse(
                requirement.getId(),
                requirement.getRequirementId(),
                requirement.getDescription(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                scenarios.size(),
                toSummary(totalCounters),
                breakdown
        );
    }

    private Map<Long, AutomationExecution> latestByTestCase(
            List<AutomationExecution> executions
    ) {
        Map<Long, AutomationExecution> latest = new LinkedHashMap<>();

        for (AutomationExecution execution : executions) {
            latest.putIfAbsent(
                    execution.getTestCase().getId(),
                    execution
            );
        }

        return latest;
    }

    private void apply(
            Counters counters,
            TestCase testCase,
            AutomationExecution latestExecution
    ) {
        counters.total++;

        boolean manual =
                !testCase.isAutomatable()
                        || testCase.getAutomationType() == AutomationType.MANUAL;

        if (manual) {
            counters.manual++;
            return;
        }

        counters.automatable++;

        if (testCase.getAutomationStatus() == AutomationStatus.AUTOMATED) {
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
                // RUNNING is excluded by the repository query.
            }
        }
    }

    private MonitoringSummaryResponse toSummary(
            Counters counters
    ) {
        return new MonitoringSummaryResponse(
                counters.total,
                counters.automatable,
                counters.automated,
                percentage(counters.automated, counters.automatable),
                counters.passed,
                counters.failed,
                counters.timedOut,
                counters.errors,
                counters.needsAttention(),
                counters.notRun,
                counters.manual,
                counters.completed(),
                percentage(counters.passed, counters.completed())
        );
    }

    private Requirement getRequirement(TestCase testCase) {
        return testCase.getTestScenario().getRequirement();
    }

    private double percentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0.0;
        }

        double value = (numerator * 100.0) / denominator;
        return Math.round(value * 100.0) / 100.0;
    }

    private static class Counters {
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
