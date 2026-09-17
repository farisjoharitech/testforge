package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationResultResponse;
import com.testforge.testforge_backend.automation.dto.AutomationResultSummaryResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationExceptionHandler;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.automation.service.AutomationArtifactService;
import com.testforge.testforge_backend.automation.service.AutomationResultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AutomationResultControllerTest {

    private AutomationResultService
            automationResultService;

    private AutomationArtifactService
            automationArtifactService;

    private MockMvc
            mockMvc;

    @BeforeEach
    void setUp() {

        automationResultService =
                mock(
                        AutomationResultService.class
                );

        automationArtifactService =
                mock(
                        AutomationArtifactService.class
                );

        AutomationResultController controller =
                new AutomationResultController(
                        automationResultService,
                        automationArtifactService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                controller
                        )
                        .setControllerAdvice(
                                new AutomationExceptionHandler()
                        )
                        .build();
    }

    @Test
    void shouldGetAllResults()
            throws Exception {

        when(
                automationResultService
                        .getAllResults(
                                null
                        )
        ).thenReturn(
                List.of(
                        createSummary(
                                "EXEC-001",
                                AutomationExecutionStatus.PASSED,
                                true
                        ),
                        createSummary(
                                "EXEC-002",
                                AutomationExecutionStatus.FAILED,
                                false
                        )
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-results"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.length()"
                        ).value(
                                2
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].executionId"
                        ).value(
                                "EXEC-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].status"
                        ).value(
                                "PASSED"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].successful"
                        ).value(
                                true
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[1].executionId"
                        ).value(
                                "EXEC-002"
                        )
                );
    }

    @Test
    void shouldPassStatusFilterToService()
            throws Exception {

        when(
                automationResultService
                        .getAllResults(
                                AutomationExecutionStatus.FAILED
                        )
        ).thenReturn(
                List.of(
                        createSummary(
                                "EXEC-FAILED",
                                AutomationExecutionStatus.FAILED,
                                false
                        )
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-results"
                        )
                                .param(
                                        "status",
                                        "FAILED"
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$[0].status"
                        ).value(
                                "FAILED"
                        )
                );

        verify(
                automationResultService
        ).getAllResults(
                AutomationExecutionStatus.FAILED
        );
    }

    @Test
    void shouldGetResultDetails()
            throws Exception {

        AutomationResultResponse response =
                createDetail(
                        "EXEC-DETAIL",
                        AutomationExecutionStatus.PASSED,
                        true
                );

        when(
                automationResultService
                        .getResult(
                                "EXEC-DETAIL"
                        )
        ).thenReturn(
                response
        );

        mockMvc.perform(
                        get(
                                "/api/automation-results/EXEC-DETAIL"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.executionId"
                        ).value(
                                "EXEC-DETAIL"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.automationScriptBusinessId"
                        ).value(
                                "AUTOSCRIPT-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.testCaseBusinessId"
                        ).value(
                                "TC-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.status"
                        ).value(
                                "PASSED"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.logOutput"
                        ).value(
                                "BUILD SUCCESS"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.successful"
                        ).value(
                                true
                        )
                );
    }

    @Test
    void shouldReturn404ForUnknownResult()
            throws Exception {

        when(
                automationResultService
                        .getResult(
                                "EXEC-MISSING"
                        )
        ).thenThrow(
                new AutomationNotFoundException(
                        "Automation execution not found: EXEC-MISSING"
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-results/EXEC-MISSING"
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
                                "Automation execution not found: EXEC-MISSING"
                        )
                );
    }

    @Test
    void shouldReturn409ForRunningResult()
            throws Exception {

        when(
                automationResultService
                        .getResult(
                                "EXEC-RUNNING"
                        )
        ).thenThrow(
                new AutomationConflictException(
                        "Automation execution is still running and does not have a final result yet"
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-results/EXEC-RUNNING"
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
                );
    }

    @Test
    void shouldGetResultsByAutomationScript()
            throws Exception {

        when(
                automationResultService
                        .getResultsByAutomationScript(
                                15L
                        )
        ).thenReturn(
                List.of(
                        createSummary(
                                "EXEC-SCRIPT-001",
                                AutomationExecutionStatus.PASSED,
                                true
                        )
                )
        );

        mockMvc.perform(
                        get(
                                "/api/automation-scripts/15/results"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$[0].executionId"
                        ).value(
                                "EXEC-SCRIPT-001"
                        )
                );

        verify(
                automationResultService
        ).getResultsByAutomationScript(
                15L
        );
    }

    @Test
    void shouldGetResultsByTestCase()
            throws Exception {

        when(
                automationResultService
                        .getResultsByTestCase(
                                10L
                        )
        ).thenReturn(
                List.of(
                        createSummary(
                                "EXEC-TC-001",
                                AutomationExecutionStatus.FAILED,
                                false
                        )
                )
        );

        mockMvc.perform(
                        get(
                                "/api/test-cases/10/automation-results"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$[0].executionId"
                        ).value(
                                "EXEC-TC-001"
                        )
                )
                .andExpect(
                        jsonPath(
                                "$[0].status"
                        ).value(
                                "FAILED"
                        )
                );

        verify(
                automationResultService
        ).getResultsByTestCase(
                10L
        );
    }

    private AutomationResultSummaryResponse
    createSummary(
            String executionId,
            AutomationExecutionStatus status,
            boolean successful
    ) {

        LocalDateTime startedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        20,
                        0
                );

        LocalDateTime finishedAt =
                startedAt.plusSeconds(
                        5
                );

        return new AutomationResultSummaryResponse(

                1L,

                executionId,

                15L,

                "AUTOSCRIPT-001",

                10L,

                "TC-001",

                "Valid Login",

                status,

                "generated.testforge.ValidLoginTest",

                successful
                        ? 0
                        : 1,

                startedAt,

                finishedAt,

                5_000L,

                successful
        );
    }

    private AutomationResultResponse
    createDetail(
            String executionId,
            AutomationExecutionStatus status,
            boolean successful
    ) {

        LocalDateTime generatedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        19,
                        55
                );

        LocalDateTime startedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        20,
                        0
                );

        LocalDateTime finishedAt =
                startedAt.plusSeconds(
                        5
                );

        return new AutomationResultResponse(

                1L,

                executionId,

                15L,

                "AUTOSCRIPT-001",

                10L,

                "TC-001",

                "Valid Login",

                status,

                "generated.testforge.ValidLoginTest",

                generatedAt,

                successful
                        ? 0
                        : 1,

                "BUILD SUCCESS",

                successful
                        ? null
                        : "Assertion failed",

                successful
                        ? null
                        : 2,

                successful
                        ? null
                        : "AUTO-STEP-002",

                successful
                        ? null
                        : "ASSERT_TEXT",

                false,

                false,

                true,

                startedAt,

                finishedAt,

                5_000L,

                successful
        );
    }
}