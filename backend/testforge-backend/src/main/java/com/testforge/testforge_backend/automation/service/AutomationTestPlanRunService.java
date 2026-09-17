package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutomationTestPlanRunService {

    private final TestPlanRepository testPlanRepository;
    private final TestCaseRepository testCaseRepository;
    private final AutomationMultiRunService automationMultiRunService;

    public AutomationTestPlanRunService(
            TestPlanRepository testPlanRepository,
            TestCaseRepository testCaseRepository,
            AutomationMultiRunService automationMultiRunService
    ) {
        this.testPlanRepository = testPlanRepository;
        this.testCaseRepository = testCaseRepository;
        this.automationMultiRunService = automationMultiRunService;
    }

    public AutomationRunResponse executeTestPlan(Long testPlanId) {
        if (testPlanId == null) {
            throw new IllegalArgumentException("Test Plan ID must not be null");
        }

        TestPlan testPlan = testPlanRepository
                .findById(testPlanId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Test Plan not found: " + testPlanId));

        List<Long> automatableTestCaseIds = testCaseRepository
                .findByTestPlanIdOrderByIdAsc(testPlanId)
                .stream()
                .filter(TestCase::isAutomatable)
                .filter(testCase -> testCase.getAutomationType() != AutomationType.MANUAL)
                .map(TestCase::getId)
                .toList();

        if (automatableTestCaseIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Test Plan has no automatable Test Cases: " + testPlan.getTestPlanId());
        }

        return automationMultiRunService.executeTestPlanTestCases(
                automatableTestCaseIds
        );
    }
}
