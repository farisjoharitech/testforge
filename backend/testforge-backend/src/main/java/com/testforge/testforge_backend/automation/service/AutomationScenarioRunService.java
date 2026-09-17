package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutomationScenarioRunService {

    private final TestScenarioRepository testScenarioRepository;
    private final TestCaseRepository testCaseRepository;
    private final AutomationMultiRunService automationMultiRunService;

    public AutomationScenarioRunService(
            TestScenarioRepository testScenarioRepository,
            TestCaseRepository testCaseRepository,
            AutomationMultiRunService automationMultiRunService
    ) {
        this.testScenarioRepository = testScenarioRepository;
        this.testCaseRepository = testCaseRepository;
        this.automationMultiRunService = automationMultiRunService;
    }

    public AutomationRunResponse executeScenario(Long scenarioId) {
        if (scenarioId == null) {
            throw new IllegalArgumentException("Scenario ID must not be null");
        }

        TestScenario scenario = testScenarioRepository
                .findById(scenarioId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Test Scenario not found: " + scenarioId));

        List<Long> automatableTestCaseIds = testCaseRepository
                .findByTestScenarioOrderByIdAsc(scenario)
                .stream()
                .filter(TestCase::isAutomatable)
                .filter(testCase -> testCase.getAutomationType() != AutomationType.MANUAL)
                .map(TestCase::getId)
                .toList();

        if (automatableTestCaseIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Scenario has no automatable Test Cases: " + scenario.getScenarioId());
        }

        return automationMultiRunService.executeScenarioTestCases(
                automatableTestCaseIds
        );
    }
}
