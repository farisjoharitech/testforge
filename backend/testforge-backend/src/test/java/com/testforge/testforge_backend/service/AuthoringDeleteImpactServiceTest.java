package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.cleanup.dto.AuthoringDeleteImpactResponse;
import com.testforge.testforge_backend.cleanup.service.AuthoringDeleteImpactService;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthoringDeleteImpactServiceTest {

    @Mock RequirementRepository requirementRepository;
    @Mock TestScenarioRepository testScenarioRepository;
    @Mock TestCaseRepository testCaseRepository;
    @Mock TestStepRepository testStepRepository;
    @Mock AutomationScriptRepository automationScriptRepository;
    @Mock AutomationStepRepository automationStepRepository;
    @Mock AutomationExecutionRepository automationExecutionRepository;
    @Mock TestSetRepository testSetRepository;

    private AuthoringDeleteImpactService service;

    @BeforeEach
    void setUp() {
        service = new AuthoringDeleteImpactService(
                requirementRepository,
                testScenarioRepository,
                testCaseRepository,
                testStepRepository,
                automationScriptRepository,
                automationStepRepository,
                automationExecutionRepository,
                testSetRepository
        );
    }

    @Test
    void shouldReturnRequirementImpactAndPreserveExecutionHistory() {
        Requirement requirement = new Requirement();
        requirement.setId(10L);
        requirement.setRequirementId("REQ-000010");
        when(requirementRepository.findById(10L)).thenReturn(Optional.of(requirement));
        when(testScenarioRepository.countByRequirement_Id(10L)).thenReturn(2L);
        when(testCaseRepository.countByRequirementId(10L)).thenReturn(5L);
        when(testStepRepository.countByRequirementId(10L)).thenReturn(18L);
        when(automationScriptRepository.countByRequirementId(10L)).thenReturn(4L);
        when(automationStepRepository.countByRequirementId(10L)).thenReturn(12L);
        when(testSetRepository.countMembershipsByRequirementId(10L)).thenReturn(3L);
        when(automationExecutionRepository.countByRequirementId(10L)).thenReturn(21L);

        AuthoringDeleteImpactResponse result = service.getRequirementImpact(10L);

        assertEquals("REQUIREMENT", result.entityType());
        assertEquals(2L, result.scenarioCount());
        assertEquals(5L, result.testCaseCount());
        assertEquals(18L, result.testStepCount());
        assertEquals(12L, result.automationStepCount());
        assertEquals(21L, result.historicalExecutionCount());
        assertTrue(result.historicalExecutionsPreserved());
    }

    @Test
    void shouldReturnScenarioImpact() {
        TestScenario scenario = new TestScenario();
        scenario.setId(20L);
        scenario.setScenarioId("SCN-000020");
        when(testScenarioRepository.findById(20L)).thenReturn(Optional.of(scenario));
        when(testCaseRepository.countByTestScenario_Id(20L)).thenReturn(3L);
        when(testStepRepository.countByScenarioId(20L)).thenReturn(9L);
        when(automationScriptRepository.countByScenarioId(20L)).thenReturn(2L);
        when(automationStepRepository.countByScenarioId(20L)).thenReturn(7L);
        when(testSetRepository.countMembershipsByScenarioId(20L)).thenReturn(2L);
        when(automationExecutionRepository.countByScenarioId(20L)).thenReturn(8L);

        AuthoringDeleteImpactResponse result = service.getScenarioImpact(20L);

        assertEquals("SCENARIO", result.entityType());
        assertEquals(3L, result.testCaseCount());
        assertEquals(9L, result.testStepCount());
        assertEquals(8L, result.historicalExecutionCount());
    }

    @Test
    void shouldReturnTestCaseImpact() {
        TestCase testCase = new TestCase();
        testCase.setId(30L);
        testCase.setTestCaseId("TC-000030");
        when(testCaseRepository.findById(30L)).thenReturn(Optional.of(testCase));
        when(testStepRepository.countByTestCase_Id(30L)).thenReturn(4L);
        when(automationScriptRepository.countByTestCaseId(30L)).thenReturn(1L);
        when(automationStepRepository.countByTestCaseId(30L)).thenReturn(3L);
        when(testSetRepository.countMembershipsByTestCaseId(30L)).thenReturn(2L);
        when(automationExecutionRepository.countByTestCase_Id(30L)).thenReturn(11L);

        AuthoringDeleteImpactResponse result = service.getTestCaseImpact(30L);

        assertEquals("TEST_CASE", result.entityType());
        assertEquals(4L, result.testStepCount());
        assertEquals(1L, result.automationScriptCount());
        assertEquals(3L, result.automationStepCount());
        assertEquals(2L, result.testSetMembershipCount());
        assertEquals(11L, result.historicalExecutionCount());
        assertTrue(result.historicalExecutionsPreserved());
    }
}
