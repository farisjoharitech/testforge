package com.testforge.testforge_backend.testset.service;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.service.BusinessIdGeneratorService;
import com.testforge.testforge_backend.testset.dto.CreateTestSetRequest;
import com.testforge.testforge_backend.testset.entity.TestSet;
import com.testforge.testforge_backend.testset.exception.InvalidTestSetException;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TestSetServiceTest {

    private TestSetRepository testSetRepository;
    private TestPlanRepository testPlanRepository;
    private TestCaseRepository testCaseRepository;
    private BusinessIdGeneratorService businessIdGeneratorService;
    private TestSetService service;

    @BeforeEach
    void setUp() {
        testSetRepository = mock(TestSetRepository.class);
        testPlanRepository = mock(TestPlanRepository.class);
        testCaseRepository = mock(TestCaseRepository.class);
        businessIdGeneratorService = mock(BusinessIdGeneratorService.class);

        service = new TestSetService(
                testSetRepository,
                testPlanRepository,
                testCaseRepository,
                businessIdGeneratorService
        );

        when(testSetRepository.save(any(TestSet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(businessIdGeneratorService.generateTestSetId())
                .thenReturn("TS-000001");
    }

    @Test
    void shouldPreserveSelectedOrder() {
        TestPlan plan = plan(4L, "TP-000004");
        TestCase first = testCase(11L, "TC-001", plan, AutomationType.UI);
        TestCase second = testCase(12L, "TC-002", plan, AutomationType.API);

        when(testPlanRepository.findById(4L)).thenReturn(Optional.of(plan));
        when(testCaseRepository.findById(12L)).thenReturn(Optional.of(second));
        when(testCaseRepository.findById(11L)).thenReturn(Optional.of(first));

        var response = service.create(new CreateTestSetRequest(
                4L,
                "Ordered Pack",
                null,
                List.of(12L, 11L)
        ));

        assertEquals("TC-002", response.members().get(0).testCaseBusinessId());
        assertEquals(1, response.members().get(0).itemOrder());
        assertEquals("TC-001", response.members().get(1).testCaseBusinessId());
        assertEquals(2, response.members().get(1).itemOrder());
    }

    @Test
    void shouldRejectManualTestCase() {
        TestPlan plan = plan(4L, "TP-000004");
        TestCase manual = testCase(11L, "TC-001", plan, AutomationType.MANUAL);
        manual.setAutomatable(false);

        when(testPlanRepository.findById(4L)).thenReturn(Optional.of(plan));
        when(testCaseRepository.findById(11L)).thenReturn(Optional.of(manual));

        assertThrows(
                InvalidTestSetException.class,
                () -> service.create(new CreateTestSetRequest(
                        4L,
                        "Manual Pack",
                        null,
                        List.of(11L)
                ))
        );
    }

    private TestPlan plan(Long id, String businessId) {
        TestPlan plan = new TestPlan();
        plan.setId(id);
        plan.setTestPlanId(businessId);
        plan.setName("Plan " + businessId);
        return plan;
    }

    private TestCase testCase(
            Long id,
            String businessId,
            TestPlan plan,
            AutomationType automationType
    ) {
        Requirement requirement = new Requirement();
        requirement.setTestPlan(plan);

        TestScenario scenario = new TestScenario();
        scenario.setId(8L);
        scenario.setScenarioId("SCN-000008");
        scenario.setRequirement(requirement);

        TestCase testCase = new TestCase();
        testCase.setId(id);
        testCase.setTestCaseId(businessId);
        testCase.setName("Case " + businessId);
        testCase.setTestScenario(scenario);
        testCase.setAutomatable(automationType != AutomationType.MANUAL);
        testCase.setAutomationType(automationType);
        testCase.setAutomationStatus(
                automationType == AutomationType.MANUAL
                        ? AutomationStatus.NOT_APPLICABLE
                        : AutomationStatus.READY
        );
        return testCase;
    }
}
