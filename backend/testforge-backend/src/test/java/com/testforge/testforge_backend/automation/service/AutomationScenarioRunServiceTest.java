package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutomationScenarioRunServiceTest {

    private TestScenarioRepository testScenarioRepository;
    private TestCaseRepository testCaseRepository;
    private AutomationMultiRunService automationMultiRunService;
    private AutomationScenarioRunService service;

    @BeforeEach
    void setUp() {
        testScenarioRepository = mock(TestScenarioRepository.class);
        testCaseRepository = mock(TestCaseRepository.class);
        automationMultiRunService = mock(AutomationMultiRunService.class);

        service = new AutomationScenarioRunService(
                testScenarioRepository,
                testCaseRepository,
                automationMultiRunService
        );
    }

    @Test
    void shouldExecuteOnlyAutomatableScenarioTestCases() {
        TestScenario scenario = new TestScenario();
        scenario.setScenarioId("SC-AUTO-001");
        scenario.setAutomatable(true);

        TestCase uiCase = testCase(11L, true, AutomationType.UI);
        TestCase apiCase = testCase(12L, true, AutomationType.API);
        TestCase manualCase = testCase(13L, false, AutomationType.MANUAL);
        uiCase.setTestScenario(scenario);
        apiCase.setTestScenario(scenario);
        manualCase.setTestScenario(scenario);

        when(testScenarioRepository.findById(5L))
                .thenReturn(Optional.of(scenario));
        when(testCaseRepository.findByTestScenarioOrderByIdAsc(scenario))
                .thenReturn(List.of(uiCase, manualCase, apiCase));

        AutomationRunResponse expected = new AutomationRunResponse(
                20L,
                "RUN-SCENARIO-001",
                AutomationRunType.SCENARIO,
                AutomationRunStatus.RUNNING,
                2,
                0,
                0,
                0,
                LocalDateTime.now(),
                null,
                null
        );

        when(automationMultiRunService.executeScenarioTestCases(List.of(11L, 12L)))
                .thenReturn(expected);

        AutomationRunResponse actual = service.executeScenario(5L);

        assertEquals(expected, actual);
        verify(automationMultiRunService)
                .executeScenarioTestCases(List.of(11L, 12L));
    }

    @Test
    void shouldRejectScenarioWithoutAutomatableTestCases() {
        TestScenario scenario = new TestScenario();
        scenario.setScenarioId("SC-MANUAL-001");
        scenario.setAutomatable(false);

        TestCase manualCase = testCase(13L, false, AutomationType.MANUAL);
        manualCase.setTestScenario(scenario);

        when(testScenarioRepository.findById(5L))
                .thenReturn(Optional.of(scenario));
        when(testCaseRepository.findByTestScenarioOrderByIdAsc(scenario))
                .thenReturn(List.of(manualCase));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.executeScenario(5L)
        );

        assertEquals(
                "Scenario has no automatable Test Cases: SC-MANUAL-001",
                exception.getMessage()
        );
    }

    private TestCase testCase(
            Long id,
            boolean automatable,
            AutomationType automationType
    ) {
        TestCase testCase = new TestCase();
        testCase.setId(id);
        testCase.setAutomationType(automationType);
        return testCase;
    }
}
