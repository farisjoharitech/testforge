package com.testforge.testforge_backend.monitoringdrilldown.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownResponse;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.service.ProjectService;
import com.testforge.testforge_backend.service.RequirementService;
import com.testforge.testforge_backend.service.TestPlanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MonitoringDrilldownServiceTest {

    private TestPlanService testPlanService;
    private RequirementService requirementService;
    private TestCaseRepository testCaseRepository;
    private AutomationExecutionRepository automationExecutionRepository;
    private MonitoringDrilldownService service;

    @BeforeEach
    void setUp() {
        testPlanService = mock(TestPlanService.class);
        requirementService = mock(RequirementService.class);
        testCaseRepository = mock(TestCaseRepository.class);
        automationExecutionRepository = mock(AutomationExecutionRepository.class);

        service = new MonitoringDrilldownService(
                mock(ProjectService.class),
                testPlanService,
                requirementService,
                testCaseRepository,
                automationExecutionRepository
        );
    }

    @Test
    void shouldUseLatestCompletedExecutionAndFilterPassedCases() {
        TestPlan plan = testPlan();
        TestScenario scenario = scenario(plan);
        TestCase testCase = testCase(
                40L,
                "TC-000001",
                scenario,
                true,
                AutomationType.API,
                AutomationStatus.AUTOMATED
        );

        AutomationExecution latestPass = execution(
                "EXEC-PASS",
                testCase,
                AutomationExecutionStatus.PASSED,
                LocalDateTime.of(2026, 9, 14, 12, 0)
        );
        AutomationExecution olderFailure = execution(
                "EXEC-OLD-FAIL",
                testCase,
                AutomationExecutionStatus.FAILED,
                LocalDateTime.of(2026, 9, 14, 11, 0)
        );

        when(testPlanService.getByTestPlanId("TP-000001"))
                .thenReturn(plan);
        when(testCaseRepository.findByTestPlanIdOrderByIdAsc(10L))
                .thenReturn(List.of(testCase));
        when(automationExecutionRepository.findCompletedByTestPlanIdOrderByStartedAtDesc(
                10L,
                AutomationExecutionStatus.RUNNING
        )).thenReturn(List.of(latestPass, olderFailure));

        MonitoringDrilldownResponse result = service.getTestPlanDrilldown(
                "TP-000001",
                MonitoringDrilldownStatus.PASSED
        );

        assertEquals(1L, result.totalCount());
        assertEquals(MonitoringDrilldownStatus.PASSED, result.filter());
        assertEquals(MonitoringDrilldownStatus.PASSED,
                result.testCases().get(0).currentResult());
        assertEquals("EXEC-PASS", result.testCases().get(0).executionId());
    }

    @Test
    void shouldGroupFailedTimedOutAndErrorAsNeedsAttention() {
        TestPlan plan = testPlan();
        TestScenario scenario = scenario(plan);
        Requirement requirement = scenario.getRequirement();

        TestCase failed = testCase(40L, "TC-FAIL", scenario, true,
                AutomationType.UI, AutomationStatus.READY);
        TestCase timedOut = testCase(41L, "TC-TIMEOUT", scenario, true,
                AutomationType.UI, AutomationStatus.READY);
        TestCase notRun = testCase(42L, "TC-NOT-RUN", scenario, true,
                AutomationType.API, AutomationStatus.NOT_AUTOMATED);
        TestCase manual = testCase(43L, "TC-MANUAL", scenario, false,
                AutomationType.MANUAL, AutomationStatus.NOT_APPLICABLE);

        AutomationExecution failedExecution = execution(
                "EXEC-FAIL", failed, AutomationExecutionStatus.FAILED,
                LocalDateTime.of(2026, 9, 14, 12, 0));
        AutomationExecution timeoutExecution = execution(
                "EXEC-TIMEOUT", timedOut, AutomationExecutionStatus.TIMED_OUT,
                LocalDateTime.of(2026, 9, 14, 11, 0));

        when(requirementService.getByRequirementId("REQ-000001"))
                .thenReturn(requirement);
        when(testCaseRepository.findByRequirementIdOrderByIdAsc(20L))
                .thenReturn(List.of(failed, timedOut, notRun, manual));
        when(automationExecutionRepository.findCompletedByRequirementIdOrderByStartedAtDesc(
                20L,
                AutomationExecutionStatus.RUNNING
        )).thenReturn(List.of(failedExecution, timeoutExecution));

        MonitoringDrilldownResponse needsAttention = service.getRequirementDrilldown(
                "REQ-000001",
                MonitoringDrilldownStatus.NEEDS_ATTENTION
        );
        MonitoringDrilldownResponse notRunResult = service.getRequirementDrilldown(
                "REQ-000001",
                MonitoringDrilldownStatus.NOT_RUN
        );
        MonitoringDrilldownResponse manualResult = service.getRequirementDrilldown(
                "REQ-000001",
                MonitoringDrilldownStatus.MANUAL
        );

        assertEquals(2L, needsAttention.totalCount());
        assertEquals(1L, notRunResult.totalCount());
        assertEquals("TC-NOT-RUN", notRunResult.testCases().get(0).testCaseBusinessId());
        assertEquals(1L, manualResult.totalCount());
        assertEquals("TC-MANUAL", manualResult.testCases().get(0).testCaseBusinessId());
    }

    private TestPlan testPlan() {
        TestPlan plan = new TestPlan();
        plan.setId(10L);
        plan.setTestPlanId("TP-000001");
        plan.setName("Release Plan");
        return plan;
    }

    private TestScenario scenario(TestPlan plan) {
        Requirement requirement = new Requirement();
        requirement.setId(20L);
        requirement.setRequirementId("REQ-000001");
        requirement.setDescription("Authentication");
        Module module = new Module();
        module.setTestPlan(plan);
        requirement.setModule(module);

        TestScenario scenario = new TestScenario();
        scenario.setId(30L);
        scenario.setScenarioId("SCN-000001");
        scenario.setDescription("Login");
        scenario.setRequirement(requirement);
        scenario.setAutomatable(true);
        return scenario;
    }

    private TestCase testCase(
            Long id,
            String businessId,
            TestScenario scenario,
            boolean automatable,
            AutomationType automationType,
            AutomationStatus automationStatus
    ) {
        TestCase testCase = new TestCase();
        testCase.setId(id);
        testCase.setTestCaseId(businessId);
        testCase.setName(businessId);
        testCase.setTestScenario(scenario);
        testCase.setAutomationType(automationType);
        testCase.setAutomationStatus(automationStatus);
        return testCase;
    }

    private AutomationExecution execution(
            String executionId,
            TestCase testCase,
            AutomationExecutionStatus status,
            LocalDateTime startedAt
    ) {
        AutomationExecution execution = new AutomationExecution(
                executionId,
                mock(AutomationScript.class),
                testCase,
                status,
                "GeneratedTest",
                startedAt.minusMinutes(1),
                startedAt
        );
        execution.setFinishedAt(startedAt.plusSeconds(1));
        execution.setDurationMs(1000L);
        return execution;
    }
}
