package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.dto.TestStepDeleteImpactResponse;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TestStepServiceTest {

    private TestStepRepository testStepRepository;
    private AutomationStepRepository automationStepRepository;
    private TestStepService testStepService;

    @BeforeEach
    void setUp() {
        testStepRepository = mock(TestStepRepository.class);
        TestCaseRepository testCaseRepository = mock(TestCaseRepository.class);
        BusinessIdGeneratorService businessIdGeneratorService = mock(BusinessIdGeneratorService.class);
        automationStepRepository = mock(AutomationStepRepository.class);

        testStepService = new TestStepService(
                testStepRepository,
                testCaseRepository,
                businessIdGeneratorService,
                automationStepRepository
        );
    }

    @Test
    void shouldDeleteMappedAutomationStepsBeforeDeletingTestStep() {
        TestStep testStep = new TestStep();
        testStep.setId(21L);
        testStep.setTestStepId("STEP-000021");

        when(testStepRepository.findById(21L))
                .thenReturn(Optional.of(testStep));

        testStepService.delete(21L);

        var ordered = inOrder(automationStepRepository, testStepRepository);
        ordered.verify(automationStepRepository).deleteByTestStepId(21L);
        ordered.verify(testStepRepository).delete(testStep);
    }

    @Test
    void shouldReportMappedAutomationImpactAndGeneratedScriptStaleness() {
        TestStep testStep = new TestStep();
        testStep.setId(21L);
        testStep.setTestStepId("STEP-000021");

        AutomationScript generatedScript = mock(AutomationScript.class);
        when(generatedScript.getId()).thenReturn(10L);
        when(generatedScript.getGeneratedSource()).thenReturn("public class GeneratedTest {}");
        when(generatedScript.getGeneratedAt()).thenReturn(LocalDateTime.now());

        AutomationStep first = mock(AutomationStep.class);
        AutomationStep second = mock(AutomationStep.class);
        when(first.getAutomationScript()).thenReturn(generatedScript);
        when(second.getAutomationScript()).thenReturn(generatedScript);

        when(testStepRepository.findById(21L))
                .thenReturn(Optional.of(testStep));
        when(automationStepRepository.findByTestStepIdOrderByStepOrderAsc(21L))
                .thenReturn(List.of(first, second));

        TestStepDeleteImpactResponse impact = testStepService.getDeleteImpact(21L);

        assertEquals(21L, impact.testStepId());
        assertEquals("STEP-000021", impact.testStepBusinessId());
        assertEquals(2, impact.mappedAutomationStepCount());
        assertEquals(1, impact.affectedAutomationScriptCount());
        assertTrue(impact.generatedScriptWillBecomeStale());
    }
}
