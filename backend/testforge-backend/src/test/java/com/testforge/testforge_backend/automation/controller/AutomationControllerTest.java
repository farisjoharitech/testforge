package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationScriptResponse;
import com.testforge.testforge_backend.automation.dto.AutomationStepResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationExceptionHandler;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.service.AutomationExecutionService;
import com.testforge.testforge_backend.automation.service.AutomationGenerationService;
import com.testforge.testforge_backend.automation.service.AutomationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AutomationControllerTest {

    private AutomationService automationService;

    private MockMvc mockMvc;

    private AutomationGenerationService automationGenerationService;

    private AutomationExecutionService automationExecutionService;

    private AutomationController automationController;


    @BeforeEach
    void setUp() {

        automationService =
                mock(
                        AutomationService.class
                );

        automationGenerationService =
                mock(
                        AutomationGenerationService.class
                );

        automationExecutionService =
                mock(
                        AutomationExecutionService.class
                );

        automationController =
                new AutomationController(
                        automationService,
                        automationGenerationService,
                        automationExecutionService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                automationController
                        )
                        .setControllerAdvice(
                                new AutomationExceptionHandler()
                        )
                        .build();
    }

    @Test
    void shouldCreateAutomationScript()
            throws Exception {

        LocalDateTime now =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        1,
                        0
                );

        AutomationScriptResponse response =
                new AutomationScriptResponse(
                        15L,
                        "AUTOSCRIPT-001",
                        10L,
                        "Valid Login Automation",
                        now,
                        now
                );

        when(
                automationService.createScript(
                        eq(10L),
                        any()
                )
        ).thenReturn(
                response
        );

        mockMvc.perform(
                        post(
                                "/api/test-cases/10/automation-script"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "automationScriptId": "AUTOSCRIPT-001",
                                          "name": "Valid Login Automation"
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().isCreated()
                )
                .andExpect(
                        header().string(
                                "Location",
                                "/api/automation-scripts/15"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automationScriptId"
                        ).value(
                                "AUTOSCRIPT-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.testCaseId"
                        ).value(
                                10
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.name"
                        ).value(
                                "Valid Login Automation"
                        )
                );
    }

    @Test
    void shouldGetAutomationScriptByTestCase()
            throws Exception {

        LocalDateTime now =
                LocalDateTime.now();

        AutomationScriptResponse response =
                new AutomationScriptResponse(
                        15L,
                        "AUTOSCRIPT-001",
                        10L,
                        "Login Automation",
                        now,
                        now
                );

        when(
                automationService.getScriptByTestCase(
                        10L
                )
        ).thenReturn(
                response
        );

        mockMvc.perform(
                        get(
                                "/api/test-cases/10/automation-script"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.id"
                        ).value(
                                15
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automationScriptId"
                        ).value(
                                "AUTOSCRIPT-001"
                        )
                );
    }

    @Test
    void shouldCreateAutomationStep()
            throws Exception {

        LocalDateTime now =
                LocalDateTime.now();

        AutomationStepResponse response =
                new AutomationStepResponse(
                        31L,
                        "AUTO-STEP-001",
                        15L,
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
                        null,
                        now,
                        now
                );

        when(
                automationService.createStep(
                        eq(15L),
                        any()
                )
        ).thenReturn(
                response
        );

        mockMvc.perform(
                        post(
                                "/api/automation-scripts/15/steps"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "automationStepId": "AUTO-STEP-001",
                                          "sourceTestStepId": 20,
                                          "stepOrder": 1,
                                          "actionType": "FILL",
                                          "target": "Username field",
                                          "selectorStrategy": "LABEL",
                                          "selectorValue": "Username",
                                          "selectorRole": null,
                                          "selectorName": null,
                                          "selectorExact": false,
                                          "inputValue": "${TEST_USERNAME}",
                                          "expectedValue": null
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().isCreated()
                )
                .andExpect(
                        header().string(
                                "Location",
                                "/api/automation-steps/31"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automationStepId"
                        ).value(
                                "AUTO-STEP-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.actionType"
                        ).value(
                                "FILL"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.selectorStrategy"
                        ).value(
                                "LABEL"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.selectorValue"
                        ).value(
                                "Username"
                        )
                );
    }

    @Test
    void shouldGetAutomationStepsInServiceOrder()
            throws Exception {

        LocalDateTime now =
                LocalDateTime.now();

        AutomationStepResponse first =
                new AutomationStepResponse(
                        31L,
                        "AUTO-STEP-001",
                        15L,
                        20L,
                        1,
                        AutomationActionType.NAVIGATE,
                        "Login page",
                        null,
                        null,
                        null,
                        null,
                        false,
                        "${BASE_URL}/login",
                        null,
                        now,
                        now
                );

        AutomationStepResponse second =
                new AutomationStepResponse(
                        32L,
                        "AUTO-STEP-002",
                        15L,
                        21L,
                        2,
                        AutomationActionType.FILL,
                        "Username field",
                        SelectorStrategy.LABEL,
                        "Username",
                        null,
                        null,
                        false,
                        "${TEST_USERNAME}",
                        null,
                        now,
                        now
                );

        when(
                automationService.getSteps(
                        15L
                )
        ).thenReturn(
                List.of(
                        first,
                        second
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-scripts/15/steps"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$[0].stepOrder"
                        ).value(
                                1
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[1].stepOrder"
                        ).value(
                                2
                        )
                );
    }

    @Test
    void shouldUpdateAutomationStep()
            throws Exception {

        LocalDateTime now =
                LocalDateTime.now();

        AutomationStepResponse response =
                new AutomationStepResponse(
                        32L,
                        "AUTO-STEP-002",
                        15L,
                        21L,
                        2,
                        AutomationActionType.FILL,
                        "Username field",
                        SelectorStrategy.TEST_ID,
                        "username-input",
                        null,
                        null,
                        false,
                        "${TEST_USERNAME}",
                        null,
                        now,
                        now
                );

        when(
                automationService.updateStep(
                        eq(32L),
                        any()
                )
        ).thenReturn(
                response
        );

        mockMvc.perform(
                        put(
                                "/api/automation-steps/32"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "stepOrder": 2,
                                          "actionType": "FILL",
                                          "target": "Username field",
                                          "selectorStrategy": "TEST_ID",
                                          "selectorValue": "username-input",
                                          "selectorRole": null,
                                          "selectorName": null,
                                          "selectorExact": false,
                                          "inputValue": "${TEST_USERNAME}",
                                          "expectedValue": null
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.selectorStrategy"
                        ).value(
                                "TEST_ID"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.selectorValue"
                        ).value(
                                "username-input"
                        )
                );
    }

    @Test
    void shouldDeleteAutomationStep()
            throws Exception {

        mockMvc.perform(
                        delete(
                                "/api/automation-steps/32"
                        )
                )
                .andExpect(
                        status().isNoContent()
                );

        verify(
                automationService
        ).deleteStep(
                32L
        );
    }

    @Test
    void shouldReturn404WhenAutomationScriptNotFound()
            throws Exception {

        when(
                automationService.getScriptByTestCase(
                        999L
                )
        ).thenThrow(
                new AutomationNotFoundException(
                        "Automation Script not found for Test Case: 999"
                )
        );

        mockMvc.perform(
                        get(
                                "/api/test-cases/999/automation-script"
                        )
                )
                .andExpect(
                        status().isNotFound()
                )
                .andExpect(
                        jsonPath(
                                "$.status"
                        ).value(
                                404
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.message"
                        ).value(
                                "Automation Script not found for Test Case: 999"
                        )
                );
    }

    @Test
    void shouldReturn409ForConflict()
            throws Exception {

        when(
                automationService.createScript(
                        eq(10L),
                        any()
                )
        ).thenThrow(
                new AutomationConflictException(
                        "Automation Script already exists for Test Case: 10"
                )
        );

        mockMvc.perform(
                        post(
                                "/api/test-cases/10/automation-script"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "automationScriptId": "AUTOSCRIPT-002",
                                          "name": "Another Automation"
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().isConflict()
                )
                .andExpect(
                        jsonPath(
                                "$.status"
                        ).value(
                                409
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.error"
                        ).value(
                                "Conflict"
                        )
                );
    }

    @Test
    void shouldReturn400ForInvalidCreateScriptRequest()
            throws Exception {

        mockMvc.perform(
                        post(
                                "/api/test-cases/10/automation-script"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "automationScriptId": "",
                                          "name": ""
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().isBadRequest()
                );
    }
}