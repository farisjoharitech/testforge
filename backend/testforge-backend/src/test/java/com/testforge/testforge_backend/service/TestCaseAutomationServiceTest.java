package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestCaseStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import com.testforge.testforge_backend.dto.CreateTestCaseRequest;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TestCaseAutomationServiceTest {

    private TestCaseRepository testCaseRepository;
    private TestScenarioRepository scenarioRepository;
    private TestCaseService service;

    @BeforeEach
    void setUp() {
        testCaseRepository = mock(TestCaseRepository.class);
        scenarioRepository = mock(TestScenarioRepository.class);
        service = new TestCaseService(
                testCaseRepository,
                scenarioRepository,
                mock(BusinessIdGeneratorService.class),
                mock(com.testforge.testforge_backend.cleanup.service.TestCaseDeletionService.class)
        );
        when(testCaseRepository.save(any(TestCase.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testCaseCannotOverrideManualScenarioEligibility() {
        TestScenario scenario = scenario(false);
        when(scenarioRepository.findByScenarioId("SCN-1"))
                .thenReturn(Optional.of(scenario));

        CreateTestCaseRequest request = request(AutomationType.MANUAL);
        request.setAutomatable(true);

        TestCase created = service.create("SCN-1", request);

        assertFalse(created.isAutomatable());
        assertTrue(created.getAutomationStatus() == AutomationStatus.NOT_APPLICABLE);
    }

    @Test
    void testCaseUsesAutomatableScenarioEvenWhenLegacyRequestSaysFalse() {
        TestScenario scenario = scenario(true);
        when(scenarioRepository.findByScenarioId("SCN-1"))
                .thenReturn(Optional.of(scenario));

        CreateTestCaseRequest request = request(AutomationType.UI);
        request.setAutomatable(false);

        TestCase created = service.create("SCN-1", request);

        assertTrue(created.isAutomatable());
        assertTrue(created.getAutomationStatus() == AutomationStatus.NOT_AUTOMATED);
    }

    private TestScenario scenario(boolean automatable) {
        TestScenario scenario = new TestScenario();
        scenario.setAutomatable(automatable);
        return scenario;
    }

    private CreateTestCaseRequest request(AutomationType automationType) {
        CreateTestCaseRequest request = new CreateTestCaseRequest();
        request.setTestCaseId("TC-1");
        request.setName("Login");
        request.setExpectedResult("Logged in");
        request.setPriority(TestCasePriority.MEDIUM);
        request.setTestType(TestType.FUNCTIONAL);
        request.setAutomationType(automationType);
        request.setStatus(TestCaseStatus.DRAFT);
        return request;
    }
}
