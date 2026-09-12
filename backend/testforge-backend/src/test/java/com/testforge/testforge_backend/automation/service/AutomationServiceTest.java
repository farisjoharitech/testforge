package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationStepResponse;
import com.testforge.testforge_backend.automation.dto.CreateAutomationStepRequest;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.validation.AutomationActionValidator;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutomationServiceTest {

    private AutomationScriptRepository
            automationScriptRepository;

    private AutomationStepRepository
            automationStepRepository;

    private TestCaseRepository
            testCaseRepository;

    private TestStepRepository
            testStepRepository;

    private AutomationActionValidator
            automationActionValidator;

    private AutomationService
            automationService;

    @BeforeEach
    void setUp() {

        automationScriptRepository =
                mock(
                        AutomationScriptRepository.class
                );

        automationStepRepository =
                mock(
                        AutomationStepRepository.class
                );

        testCaseRepository =
                mock(
                        TestCaseRepository.class
                );

        testStepRepository =
                mock(
                        TestStepRepository.class
                );

        automationActionValidator =
                new AutomationActionValidator();

        automationService =
                new AutomationService(
                        automationScriptRepository,
                        automationStepRepository,
                        testCaseRepository,
                        testStepRepository,
                        automationActionValidator
                );
    }

    @Test
    void shouldCreateValidFillAutomationStep() {

        TestCase testCase =
                mock(
                        TestCase.class
                );

        when(
                testCase.getId()
        ).thenReturn(
                10L
        );

        TestStep testStep =
                mock(
                        TestStep.class
                );

        when(
                testStep.getId()
        ).thenReturn(
                20L
        );

        when(
                testStep.getTestStepId()
        ).thenReturn(
                "STEP-001"
        );

        when(
                testStep.getTestCase()
        ).thenReturn(
                testCase
        );

        AutomationScript automationScript =
                mock(
                        AutomationScript.class
                );

        when(
                automationScript.getId()
        ).thenReturn(
                30L
        );

        when(
                automationScript.getTestCase()
        ).thenReturn(
                testCase
        );

        when(
                automationScriptRepository.findById(
                        30L
                )
        ).thenReturn(
                Optional.of(
                        automationScript
                )
        );

        when(
                testStepRepository.findById(
                        20L
                )
        ).thenReturn(
                Optional.of(
                        testStep
                )
        );

        when(
                automationStepRepository
                        .existsByAutomationStepId(
                                "AUTO-STEP-001"
                        )
        ).thenReturn(
                false
        );

        when(
                automationStepRepository
                        .existsByAutomationScriptIdAndStepOrder(
                                30L,
                                1
                        )
        ).thenReturn(
                false
        );

        when(
                automationStepRepository.save(
                        any(
                                AutomationStep.class
                        )
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(
                                0
                        )
        );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        "AUTO-STEP-001",
                        20L,
                        1,
                        AutomationActionType.FILL,
                        "Username field",
                        SelectorStrategy.LABEL,
                        "Username",
                        null,
                        null,
                        false,
                        "${TEST_USERNAME}",
                        null
                );

        AutomationStepResponse response =
                automationService.createStep(
                        30L,
                        request
                );

        assertEquals(
                "AUTO-STEP-001",
                response.automationStepId()
        );

        assertEquals(
                AutomationActionType.FILL,
                response.actionType()
        );

        assertEquals(
                SelectorStrategy.LABEL,
                response.selectorStrategy()
        );

        assertEquals(
                "Username",
                response.selectorValue()
        );

        assertEquals(
                "${TEST_USERNAME}",
                response.inputValue()
        );

        verify(
                automationStepRepository
        ).save(
                any(
                        AutomationStep.class
                )
        );
    }

    @Test
    void shouldRejectTestStepFromDifferentTestCase() {

        TestCase scriptTestCase =
                mock(
                        TestCase.class
                );

        when(
                scriptTestCase.getId()
        ).thenReturn(
                10L
        );

        TestCase otherTestCase =
                mock(
                        TestCase.class
                );

        when(
                otherTestCase.getId()
        ).thenReturn(
                99L
        );

        AutomationScript automationScript =
                mock(
                        AutomationScript.class
                );

        when(
                automationScript.getTestCase()
        ).thenReturn(
                scriptTestCase
        );

        TestStep testStep =
                mock(
                        TestStep.class
                );

        when(
                testStep.getTestCase()
        ).thenReturn(
                otherTestCase
        );

        when(
                automationScriptRepository.findById(
                        30L
                )
        ).thenReturn(
                Optional.of(
                        automationScript
                )
        );

        when(
                testStepRepository.findById(
                        20L
                )
        ).thenReturn(
                Optional.of(
                        testStep
                )
        );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        "AUTO-STEP-001",
                        20L,
                        1,
                        AutomationActionType.CLICK,
                        "Login button",
                        SelectorStrategy.TEXT,
                        "Login",
                        null,
                        null,
                        false,
                        null,
                        null
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createStep(
                                30L,
                                request
                        )
        );
    }

    @Test
    void shouldRejectDuplicateStepOrder() {

        AutomationScript automationScript =
                mock(
                        AutomationScript.class
                );

        when(
                automationScriptRepository.findById(
                        30L
                )
        ).thenReturn(
                Optional.of(
                        automationScript
                )
        );

        when(
                automationStepRepository
                        .existsByAutomationStepId(
                                "AUTO-STEP-002"
                        )
        ).thenReturn(
                false
        );

        when(
                automationStepRepository
                        .existsByAutomationScriptIdAndStepOrder(
                                30L,
                                2
                        )
        ).thenReturn(
                true
        );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        "AUTO-STEP-002",
                        20L,
                        2,
                        AutomationActionType.CLICK,
                        "Login button",
                        SelectorStrategy.TEXT,
                        "Login",
                        null,
                        null,
                        false,
                        null,
                        null
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createStep(
                                30L,
                                request
                        )
        );
    }
}