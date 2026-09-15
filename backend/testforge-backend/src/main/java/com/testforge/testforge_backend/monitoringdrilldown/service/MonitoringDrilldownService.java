package com.testforge.testforge_backend.monitoringdrilldown.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownItemResponse;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownResponse;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.service.ProjectService;
import com.testforge.testforge_backend.service.RequirementService;
import com.testforge.testforge_backend.service.TestPlanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MonitoringDrilldownService {

    private final ProjectService projectService;
    private final TestPlanService testPlanService;
    private final RequirementService requirementService;
    private final TestCaseRepository testCaseRepository;
    private final AutomationExecutionRepository automationExecutionRepository;

    public MonitoringDrilldownService(
            ProjectService projectService,
            TestPlanService testPlanService,
            RequirementService requirementService,
            TestCaseRepository testCaseRepository,
            AutomationExecutionRepository automationExecutionRepository
    ) {
        this.projectService = projectService;
        this.testPlanService = testPlanService;
        this.requirementService = requirementService;
        this.testCaseRepository = testCaseRepository;
        this.automationExecutionRepository = automationExecutionRepository;
    }

    @Transactional(readOnly = true)
    public MonitoringDrilldownResponse getProjectDrilldown(
            String projectId,
            MonitoringDrilldownStatus status
    ) {
        Project project = projectService.getByProjectId(projectId);

        return buildResponse(
                "PROJECT",
                project.getProjectId(),
                project.getName(),
                normalizeStatus(status),
                testCaseRepository.findByProjectIdOrderByIdAsc(project.getId()),
                automationExecutionRepository.findCompletedByProjectIdOrderByStartedAtDesc(
                        project.getId(),
                        AutomationExecutionStatus.RUNNING
                )
        );
    }

    @Transactional(readOnly = true)
    public MonitoringDrilldownResponse getTestPlanDrilldown(
            String testPlanId,
            MonitoringDrilldownStatus status
    ) {
        TestPlan testPlan = testPlanService.getByTestPlanId(testPlanId);

        return buildResponse(
                "TEST_PLAN",
                testPlan.getTestPlanId(),
                testPlan.getName(),
                normalizeStatus(status),
                testCaseRepository.findByTestPlanIdOrderByIdAsc(testPlan.getId()),
                automationExecutionRepository.findCompletedByTestPlanIdOrderByStartedAtDesc(
                        testPlan.getId(),
                        AutomationExecutionStatus.RUNNING
                )
        );
    }

    @Transactional(readOnly = true)
    public MonitoringDrilldownResponse getRequirementDrilldown(
            String requirementId,
            MonitoringDrilldownStatus status
    ) {
        Requirement requirement = requirementService.getByRequirementId(requirementId);

        return buildResponse(
                "REQUIREMENT",
                requirement.getRequirementId(),
                requirement.getDescription(),
                normalizeStatus(status),
                testCaseRepository.findByRequirementIdOrderByIdAsc(requirement.getId()),
                automationExecutionRepository.findCompletedByRequirementIdOrderByStartedAtDesc(
                        requirement.getId(),
                        AutomationExecutionStatus.RUNNING
                )
        );
    }

    private MonitoringDrilldownResponse buildResponse(
            String scopeType,
            String scopeBusinessId,
            String scopeName,
            MonitoringDrilldownStatus filter,
            List<TestCase> testCases,
            List<AutomationExecution> completedExecutions
    ) {
        Map<Long, AutomationExecution> latestByTestCase =
                latestByTestCase(completedExecutions);

        List<MonitoringDrilldownItemResponse> items = testCases.stream()
                .map(testCase -> toItem(
                        testCase,
                        latestByTestCase.get(testCase.getId())
                ))
                .filter(item -> matches(filter, item.currentResult()))
                .toList();

        return new MonitoringDrilldownResponse(
                scopeType,
                scopeBusinessId,
                scopeName,
                filter,
                items.size(),
                items
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

    private MonitoringDrilldownItemResponse toItem(
            TestCase testCase,
            AutomationExecution latestExecution
    ) {
        TestScenario scenario = testCase.getTestScenario();
        Requirement requirement = scenario.getRequirement();
        TestPlan testPlan = requirement.getTestPlan();

        MonitoringDrilldownStatus currentResult =
                resolveCurrentResult(testCase, latestExecution);

        return new MonitoringDrilldownItemResponse(
                testCase.getId(),
                testCase.getTestCaseId(),
                testCase.getName(),
                testCase.getPriority(),
                testCase.getTestType(),
                testCase.isAutomatable(),
                testCase.getAutomationType(),
                testCase.getAutomationStatus(),
                testPlan.getTestPlanId(),
                testPlan.getName(),
                requirement.getRequirementId(),
                requirement.getDescription(),
                scenario.getScenarioId(),
                scenario.getDescription(),
                currentResult,
                latestExecution == null ? null : latestExecution.getExecutionId(),
                latestExecution == null ? null : latestExecution.getStartedAt(),
                latestExecution == null ? null : latestExecution.getFinishedAt(),
                latestExecution == null ? null : latestExecution.getDurationMs(),
                latestExecution == null ? null : latestExecution.getErrorMessage()
        );
    }

    private MonitoringDrilldownStatus resolveCurrentResult(
            TestCase testCase,
            AutomationExecution latestExecution
    ) {
        boolean manual =
                !testCase.isAutomatable()
                        || testCase.getAutomationType() == AutomationType.MANUAL;

        if (manual) {
            return MonitoringDrilldownStatus.MANUAL;
        }

        if (latestExecution == null) {
            return MonitoringDrilldownStatus.NOT_RUN;
        }

        return switch (latestExecution.getStatus()) {
            case PASSED -> MonitoringDrilldownStatus.PASSED;
            case FAILED -> MonitoringDrilldownStatus.FAILED;
            case TIMED_OUT -> MonitoringDrilldownStatus.TIMED_OUT;
            case ERROR -> MonitoringDrilldownStatus.ERROR;
            case RUNNING -> MonitoringDrilldownStatus.NOT_RUN;
        };
    }

    private boolean matches(
            MonitoringDrilldownStatus filter,
            MonitoringDrilldownStatus currentResult
    ) {
        if (filter == MonitoringDrilldownStatus.ALL) {
            return true;
        }

        if (filter == MonitoringDrilldownStatus.NEEDS_ATTENTION) {
            return currentResult == MonitoringDrilldownStatus.FAILED
                    || currentResult == MonitoringDrilldownStatus.TIMED_OUT
                    || currentResult == MonitoringDrilldownStatus.ERROR;
        }

        return filter == currentResult;
    }

    private MonitoringDrilldownStatus normalizeStatus(
            MonitoringDrilldownStatus status
    ) {
        return status == null
                ? MonitoringDrilldownStatus.ALL
                : status;
    }
}
