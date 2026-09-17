package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.automation.service.AutomationMultiRunService;
import com.testforge.testforge_backend.automation.service.AutomationRunService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AutomationRunControllerTest {

    private AutomationRunService automationRunService;
    private AutomationMultiRunService automationMultiRunService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        automationRunService = mock(AutomationRunService.class);
        automationMultiRunService = mock(AutomationMultiRunService.class);

        mockMvc = MockMvcBuilders
                .standaloneSetup(
                        new AutomationRunController(
                                automationRunService,
                                automationMultiRunService
                        )
                )
                .build();
    }

    @Test
    void shouldGetRun() throws Exception {
        LocalDateTime startedAt = LocalDateTime.now();

        when(automationRunService.getById(9L))
                .thenReturn(new AutomationRunResponse(
                        9L,
                        "RUN-TEST-001",
                        AutomationRunType.SINGLE_TEST_CASE,
                        AutomationRunStatus.RUNNING,
                        1,
                        0,
                        0,
                        0,
                        startedAt,
                        null,
                        null
                ));

        mockMvc.perform(get("/api/automation-runs/9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.runId").value("RUN-TEST-001"))
                .andExpect(jsonPath("$.runType").value("SINGLE_TEST_CASE"))
                .andExpect(jsonPath("$.status").value("RUNNING"));
    }

    @Test
    void shouldStartMultiTestCaseRun() throws Exception {
        LocalDateTime startedAt = LocalDateTime.now();

        when(automationMultiRunService.executeTestCases(anyList()))
                .thenReturn(new AutomationRunResponse(
                        12L,
                        "RUN-MULTI-001",
                        AutomationRunType.MULTI_TEST_CASE,
                        AutomationRunStatus.RUNNING,
                        3,
                        0,
                        0,
                        0,
                        startedAt,
                        null,
                        null
                ));

        mockMvc.perform(
                        post("/api/automation-runs/multi-test-case")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "testCaseIds": [11, 12, 13]
                                        }
                                        """)
                )
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.runType").value("MULTI_TEST_CASE"))
                .andExpect(jsonPath("$.status").value("RUNNING"))
                .andExpect(jsonPath("$.totalExecutions").value(3));
    }

    @Test
    void shouldRejectMultiRunWithOnlyOneTestCase() throws Exception {
        mockMvc.perform(
                        post("/api/automation-runs/multi-test-case")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "testCaseIds": [11]
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest());
    }
}
