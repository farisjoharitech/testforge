package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.TestScenarioPriority;
import com.testforge.testforge_backend.domain.enums.TestScenarioStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import com.testforge.testforge_backend.dto.CreateTestScenarioRequest;
import com.testforge.testforge_backend.dto.UpdateTestScenarioRequest;
import com.testforge.testforge_backend.exception.InvalidTestCaseAutomationException;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.testsuite.repository.TestSuiteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TestScenarioAutomationServiceTest {

    private TestScenarioRepository scenarioRepository;
    private RequirementRepository requirementRepository;
    private AutomationScriptRepository automationScriptRepository;
    private TestScenarioService service;

    @BeforeEach
    void setUp() {
        scenarioRepository = mock(TestScenarioRepository.class);
        requirementRepository = mock(RequirementRepository.class);
        automationScriptRepository = mock(AutomationScriptRepository.class);
        service = new TestScenarioService(
                scenarioRepository,
                requirementRepository,
                mock(BusinessIdGeneratorService.class),
                mock(TestCaseRepository.class),
                automationScriptRepository,
                mock(TestSuiteRepository.class),
                mock(com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService.class)
        );
    }

    @Test
    void shouldCreateManualScenario() {
        TestScenario saved = createScenario(false);
        assertFalse(saved.isAutomatable());
    }

    @Test
    void shouldCreateAutomatableScenario() {
        TestScenario saved = createScenario(true);
        assertTrue(saved.isAutomatable());
    }

    @Test
    void shouldUpdateScenarioAutomationFlagWhenNoConfigurationExists() {
        TestScenario scenario = scenario(true);
        when(scenarioRepository.findById(7L)).thenReturn(Optional.of(scenario));
        when(automationScriptRepository.countByScenarioId(7L)).thenReturn(0L);

        TestScenario updated = service.update(7L, updateRequest(false));

        assertSame(scenario, updated);
        assertFalse(updated.isAutomatable());
    }

    @Test
    void shouldPreserveAutomationAndRejectChangingConfiguredScenarioToManual() {
        TestScenario scenario = scenario(true);
        when(scenarioRepository.findById(7L)).thenReturn(Optional.of(scenario));
        when(automationScriptRepository.countByScenarioId(7L)).thenReturn(2L);

        assertThrows(
                InvalidTestCaseAutomationException.class,
                () -> service.update(7L, updateRequest(false))
        );

        assertTrue(scenario.isAutomatable());
        verify(scenarioRepository, never()).deleteById(7L);
    }

    private TestScenario createScenario(boolean automatable) {
        Requirement requirement = new Requirement();
        requirement.setRequirementId("REQ-000001");
        when(requirementRepository.findByRequirementId("REQ-000001"))
                .thenReturn(Optional.of(requirement));
        when(scenarioRepository.existsByScenarioId("SCN-000001"))
                .thenReturn(false);
        when(scenarioRepository.save(org.mockito.ArgumentMatchers.any(TestScenario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CreateTestScenarioRequest request = new CreateTestScenarioRequest();
        request.setScenarioId("SCN-000001");
        request.setDescription("Login");
        request.setTestType(TestType.FUNCTIONAL);
        request.setAutomatable(automatable);
        request.setPriority(TestScenarioPriority.MEDIUM);
        request.setStatus(TestScenarioStatus.DRAFT);
        return service.create("REQ-000001", request);
    }

    private TestScenario scenario(boolean automatable) {
        TestScenario scenario = new TestScenario();
        scenario.setAutomatable(automatable);
        scenario.setDescription("Login");
        scenario.setTestType(TestType.FUNCTIONAL);
        scenario.setPriority(TestScenarioPriority.MEDIUM);
        scenario.setStatus(TestScenarioStatus.DRAFT);
        return scenario;
    }

    private UpdateTestScenarioRequest updateRequest(boolean automatable) {
        UpdateTestScenarioRequest request = new UpdateTestScenarioRequest();
        request.setDescription("Updated login");
        request.setTestType(TestType.FUNCTIONAL);
        request.setAutomatable(automatable);
        request.setPriority(TestScenarioPriority.HIGH);
        request.setStatus(TestScenarioStatus.ACTIVE);
        return request;
    }
}
