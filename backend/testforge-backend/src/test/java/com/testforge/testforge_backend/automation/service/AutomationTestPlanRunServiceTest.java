package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
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

class AutomationTestPlanRunServiceTest {

    private TestPlanRepository testPlanRepository;
    private TestCaseRepository testCaseRepository;
    private AutomationMultiRunService automationMultiRunService;
    private AutomationTestPlanRunService service;

    @BeforeEach
    void setUp() {
        testPlanRepository = mock(TestPlanRepository.class);
        testCaseRepository = mock(TestCaseRepository.class);
        automationMultiRunService = mock(AutomationMultiRunService.class);

        service = new AutomationTestPlanRunService(
                testPlanRepository,
                testCaseRepository,
                automationMultiRunService
        );
    }

    @Test
    void shouldExecuteOnlyAutomatableTestPlanTestCases() {
        TestPlan testPlan = new TestPlan();
        testPlan.setId(5L);
        testPlan.setTestPlanId("TP-AUTO-001");

        TestCase uiCase = testCase(11L, true, AutomationType.UI);
        TestCase apiCase = testCase(12L, true, AutomationType.API);
        TestCase combinedCase = testCase(13L, true, AutomationType.UI_API);
        TestCase manualCase = testCase(14L, false, AutomationType.MANUAL);

        when(testPlanRepository.findById(5L))
                .thenReturn(Optional.of(testPlan));
        when(testCaseRepository.findByTestPlanIdOrderByIdAsc(5L))
                .thenReturn(List.of(uiCase, manualCase, apiCase, combinedCase));

        AutomationRunResponse expected = new AutomationRunResponse(
                30L,
                "RUN-TEST-PLAN-001",
                AutomationRunType.TEST_PLAN,
                AutomationRunStatus.RUNNING,
                3,
                0,
                0,
                0,
                LocalDateTime.now(),
                null,
                null
        );

        when(automationMultiRunService.executeTestPlanTestCases(
                List.of(11L, 12L, 13L)
        )).thenReturn(expected);

        AutomationRunResponse actual = service.executeTestPlan(5L);

        assertEquals(expected, actual);
        verify(automationMultiRunService)
                .executeTestPlanTestCases(List.of(11L, 12L, 13L));
    }

    @Test
    void shouldAllowTestPlanWithOneAutomatableTestCase() {
        TestPlan testPlan = new TestPlan();
        testPlan.setId(5L);
        testPlan.setTestPlanId("TP-SINGLE-AUTO");

        TestCase uiCase = testCase(11L, true, AutomationType.UI);

        when(testPlanRepository.findById(5L))
                .thenReturn(Optional.of(testPlan));
        when(testCaseRepository.findByTestPlanIdOrderByIdAsc(5L))
                .thenReturn(List.of(uiCase));

        AutomationRunResponse expected = new AutomationRunResponse(
                31L,
                "RUN-TEST-PLAN-002",
                AutomationRunType.TEST_PLAN,
                AutomationRunStatus.RUNNING,
                1,
                0,
                0,
                0,
                LocalDateTime.now(),
                null,
                null
        );

        when(automationMultiRunService.executeTestPlanTestCases(List.of(11L)))
                .thenReturn(expected);

        AutomationRunResponse actual = service.executeTestPlan(5L);

        assertEquals(expected, actual);
        verify(automationMultiRunService)
                .executeTestPlanTestCases(List.of(11L));
    }

    @Test
    void shouldRejectTestPlanWithoutAutomatableTestCases() {
        TestPlan testPlan = new TestPlan();
        testPlan.setId(5L);
        testPlan.setTestPlanId("TP-MANUAL-001");

        TestCase manualCase = testCase(14L, false, AutomationType.MANUAL);

        when(testPlanRepository.findById(5L))
                .thenReturn(Optional.of(testPlan));
        when(testCaseRepository.findByTestPlanIdOrderByIdAsc(5L))
                .thenReturn(List.of(manualCase));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.executeTestPlan(5L)
        );

        assertEquals(
                "Test Plan has no automatable Test Cases: TP-MANUAL-001",
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
        testCase.setAutomatable(automatable);
        testCase.setAutomationType(automationType);
        return testCase;
    }
}
