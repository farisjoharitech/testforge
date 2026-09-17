package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.testset.entity.TestSet;
import com.testforge.testforge_backend.testset.entity.TestSetItem;
import com.testforge.testforge_backend.testset.exception.TestSetNotFoundException;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutomationTestSetRunServiceTest {

    private TestSetRepository testSetRepository;
    private AutomationMultiRunService automationMultiRunService;
    private AutomationTestSetRunService service;

    @BeforeEach
    void setUp() {
        testSetRepository = mock(TestSetRepository.class);
        automationMultiRunService = mock(AutomationMultiRunService.class);
        service = new AutomationTestSetRunService(
                testSetRepository,
                automationMultiRunService
        );
    }

    @Test
    void shouldExecuteMembersInSavedItemOrder() {
        TestCase firstCase = automationEligibleTestCase(101L, "TC-101");
        TestCase secondCase = automationEligibleTestCase(202L, "TC-202");

        TestSetItem orderTwo = new TestSetItem();
        orderTwo.setTestCase(secondCase);
        orderTwo.setItemOrder(2);

        TestSetItem orderOne = new TestSetItem();
        orderOne.setTestCase(firstCase);
        orderOne.setItemOrder(1);

        TestSet testSet = new TestSet();
        testSet.setId(9L);
        testSet.setTestSetId("TS-000009");
        testSet.replaceItems(List.of(orderTwo, orderOne));

        AutomationRunResponse expected = new AutomationRunResponse(
                50L,
                "RUN-TEST-SET-001",
                AutomationRunType.TEST_SET,
                AutomationRunStatus.RUNNING,
                2,
                0,
                0,
                0,
                LocalDateTime.now(),
                null,
                null
        );

        when(testSetRepository.findById(9L)).thenReturn(Optional.of(testSet));
        when(automationMultiRunService.executeTestSetTestCases(List.of(101L, 202L)))
                .thenReturn(expected);

        AutomationRunResponse actual = service.executeTestSet(9L);

        assertEquals(AutomationRunType.TEST_SET, actual.runType());
        assertEquals(2, actual.totalExecutions());
        verify(automationMultiRunService)
                .executeTestSetTestCases(List.of(101L, 202L));
    }

    @Test
    void shouldRejectMissingTestSet() {
        when(testSetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                TestSetNotFoundException.class,
                () -> service.executeTestSet(999L)
        );
    }

    @Test
    void shouldRejectMemberThatIsNoLongerAutomationEligible() {
        TestCase manualCase = new TestCase();
        manualCase.setId(303L);
        manualCase.setTestCaseId("TC-303");
        manualCase.setAutomatable(false);
        manualCase.setAutomationType(AutomationType.MANUAL);

        TestSetItem item = new TestSetItem();
        item.setTestCase(manualCase);
        item.setItemOrder(1);

        TestSet testSet = new TestSet();
        testSet.setId(11L);
        testSet.setTestSetId("TS-000011");
        testSet.replaceItems(List.of(item));

        when(testSetRepository.findById(11L)).thenReturn(Optional.of(testSet));

        assertThrows(
                AutomationConflictException.class,
                () -> service.executeTestSet(11L)
        );
    }

    @Test
    void shouldRejectEmptyTestSet() {
        TestSet testSet = new TestSet();
        testSet.setId(10L);
        testSet.setTestSetId("TS-000010");

        when(testSetRepository.findById(10L)).thenReturn(Optional.of(testSet));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.executeTestSet(10L)
        );

        assertEquals(
                "Test Set has no Test Cases: TS-000010",
                exception.getMessage()
        );
    }
    private TestCase automationEligibleTestCase(Long id, String businessId) {
        TestCase testCase = new TestCase();
        testCase.setId(id);
        testCase.setTestCaseId(businessId);
        testCase.setAutomatable(true);
        testCase.setAutomationType(AutomationType.UI);
        return testCase;
    }

}
