package com.testforge.testforge_backend.projectmonitoring.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.projectmonitoring.dto.ProjectMonitoringResponse;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProjectMonitoringServiceTest {

    private ProjectService projectService;
    private TestPlanRepository testPlanRepository;
    private TestCaseRepository testCaseRepository;
    private AutomationExecutionRepository automationExecutionRepository;
    private ProjectMonitoringService projectMonitoringService;

    @BeforeEach
    void setUp() {
        projectService = mock(ProjectService.class);
        testPlanRepository = mock(TestPlanRepository.class);
        testCaseRepository = mock(TestCaseRepository.class);
        automationExecutionRepository = mock(
                AutomationExecutionRepository.class
        );

        projectMonitoringService =
                new ProjectMonitoringService(
                        projectService,
                        testPlanRepository,
                        testCaseRepository,
                        automationExecutionRepository
                );
    }

    @Test
    void shouldUseLatestCompletedExecutionPerTestCase() {
        Project project = project(
                1L,
                "PRJ-000001",
                "TestForge"
        );

        TestPlan testPlan = testPlan(
                10L,
                "TP-000001",
                "Release Plan",
                project
        );

        TestCase passed = testCase(
                101L,
                "TC-000001",
                "Passed Case",
                testPlan,
                true,
                AutomationType.API,
                AutomationStatus.AUTOMATED
        );

        TestCase failed = testCase(
                102L,
                "TC-000002",
                "Failed Case",
                testPlan,
                true,
                AutomationType.UI,
                AutomationStatus.READY
        );

        TestCase notRun = testCase(
                103L,
                "TC-000003",
                "Not Run Case",
                testPlan,
                true,
                AutomationType.UI_API,
                AutomationStatus.NOT_AUTOMATED
        );

        TestCase manual = testCase(
                104L,
                "TC-000004",
                "Manual Case",
                testPlan,
                false,
                AutomationType.MANUAL,
                AutomationStatus.NOT_APPLICABLE
        );

        AutomationExecution latestPass = execution(
                "EXEC-PASS-LATEST",
                passed,
                AutomationExecutionStatus.PASSED,
                LocalDateTime.of(
                        2026,
                        9,
                        14,
                        10,
                        0
                )
        );

        AutomationExecution olderFailure = execution(
                "EXEC-FAIL-OLD",
                passed,
                AutomationExecutionStatus.FAILED,
                LocalDateTime.of(
                        2026,
                        9,
                        14,
                        9,
                        0
                )
        );

        AutomationExecution currentFailure = execution(
                "EXEC-FAIL-CURRENT",
                failed,
                AutomationExecutionStatus.FAILED,
                LocalDateTime.of(
                        2026,
                        9,
                        14,
                        11,
                        0
                )
        );

        when(
                projectService.getByProjectId(
                        "PRJ-000001"
                )
        ).thenReturn(project);

        when(
                testPlanRepository.findByProjectOrderByIdAsc(
                        project
                )
        ).thenReturn(
                List.of(testPlan)
        );

        when(
                testCaseRepository.findByProjectIdOrderByIdAsc(
                        1L
                )
        ).thenReturn(
                List.of(
                        passed,
                        failed,
                        notRun,
                        manual
                )
        );

        when(
                automationExecutionRepository
                        .findCompletedByProjectIdOrderByStartedAtDesc(
                                1L,
                                AutomationExecutionStatus.RUNNING
                        )
        ).thenReturn(
                List.of(
                        currentFailure,
                        latestPass,
                        olderFailure
                )
        );

        ProjectMonitoringResponse result =
                projectMonitoringService.getMonitoring(
                        "PRJ-000001"
                );

        assertEquals(
                1L,
                result.totalTestPlans()
        );

        assertEquals(
                4L,
                result.totalTestCases()
        );

        assertEquals(
                3L,
                result.automatableTestCases()
        );

        assertEquals(
                1L,
                result.automatedTestCases()
        );

        assertEquals(
                33.33,
                result.automationCoveragePercentage()
        );

        assertEquals(
                1L,
                result.passedTestCases()
        );

        assertEquals(
                1L,
                result.failedTestCases()
        );

        assertEquals(
                1L,
                result.needsAttentionTestCases()
        );

        assertEquals(
                1L,
                result.notRunTestCases()
        );

        assertEquals(
                1L,
                result.manualTestCases()
        );

        assertEquals(
                50.0,
                result.passRatePercentage()
        );

        assertEquals(
                "EXEC-PASS-LATEST",
                result.latestPassedExecution()
                        .executionId()
        );

        assertEquals(
                "EXEC-FAIL-CURRENT",
                result.latestNeedsAttentionExecution()
                        .executionId()
        );

        assertEquals(
                1,
                result.needsAttention().size()
        );

        assertEquals(
                "TC-000002",
                result.needsAttention()
                        .get(0)
                        .testCaseBusinessId()
        );

        assertEquals(
                1,
                result.testPlans().size()
        );

        assertEquals(
                50.0,
                result.testPlans()
                        .get(0)
                        .passRatePercentage()
        );
    }

    @Test
    void shouldReturnZeroPercentagesForEmptyProject() {
        Project project = project(
                2L,
                "PRJ-000002",
                "Empty Project"
        );

        when(
                projectService.getByProjectId(
                        "PRJ-000002"
                )
        ).thenReturn(project);

        when(
                testPlanRepository.findByProjectOrderByIdAsc(
                        project
                )
        ).thenReturn(List.of());

        when(
                testCaseRepository.findByProjectIdOrderByIdAsc(
                        2L
                )
        ).thenReturn(List.of());

        when(
                automationExecutionRepository
                        .findCompletedByProjectIdOrderByStartedAtDesc(
                                2L,
                                AutomationExecutionStatus.RUNNING
                        )
        ).thenReturn(List.of());

        ProjectMonitoringResponse result =
                projectMonitoringService.getMonitoring(
                        "PRJ-000002"
                );

        assertEquals(
                0.0,
                result.automationCoveragePercentage()
        );

        assertEquals(
                0.0,
                result.passRatePercentage()
        );

        assertNotNull(
                result.testPlans()
        );

        assertNotNull(
                result.needsAttention()
        );

        assertNull(
                result.latestPassedExecution()
        );

        assertNull(
                result.latestNeedsAttentionExecution()
        );
    }

    private Project project(
            Long id,
            String projectId,
            String name
    ) {
        Project project = new Project();
        project.setId(id);
        project.setProjectId(projectId);
        project.setName(name);
        return project;
    }

    private TestPlan testPlan(
            Long id,
            String testPlanId,
            String name,
            Project project
    ) {
        TestPlan testPlan = new TestPlan();
        testPlan.setId(id);
        testPlan.setTestPlanId(testPlanId);
        testPlan.setName(name);
        testPlan.setProject(project);
        return testPlan;
    }

    private TestCase testCase(
            Long id,
            String testCaseId,
            String name,
            TestPlan testPlan,
            boolean automatable,
            AutomationType automationType,
            AutomationStatus automationStatus
    ) {
        Requirement requirement = new Requirement();
        requirement.setTestPlan(testPlan);

        TestScenario scenario = new TestScenario();
        scenario.setRequirement(requirement);

        TestCase testCase = new TestCase();
        testCase.setId(id);
        testCase.setTestCaseId(testCaseId);
        testCase.setName(name);
        testCase.setTestScenario(scenario);
        testCase.setAutomatable(automatable);
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
        AutomationExecution execution =
                new AutomationExecution(
                        executionId,
                        mock(AutomationScript.class),
                        testCase,
                        status,
                        "GeneratedTest",
                        startedAt.minusMinutes(1),
                        startedAt
                );

        execution.setFinishedAt(
                startedAt.plusSeconds(1)
        );

        execution.setDurationMs(
                1000L
        );

        return execution;
    }
}
