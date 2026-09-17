package com.testforge.testforge_backend.testset.controller;

import com.testforge.testforge_backend.testset.dto.TestSetResponse;
import com.testforge.testforge_backend.testset.service.TestSetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TestSetControllerTest {

    private TestSetService testSetService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        testSetService = mock(TestSetService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestSetController(testSetService))
                .build();
    }

    @Test
    void shouldCreateTestSet() throws Exception {
        LocalDateTime now = LocalDateTime.now();

        when(testSetService.create(any()))
                .thenReturn(new TestSetResponse(
                        7L,
                        "TS-000007",
                        3L,
                        "TP-000003",
                        "Regression Plan",
                        "Smoke Pack",
                        "Critical smoke coverage",
                        2,
                        List.of(),
                        now,
                        now
                ));

        mockMvc.perform(
                        post("/api/test-sets")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "testPlanId": 3,
                                          "name": "Smoke Pack",
                                          "description": "Critical smoke coverage",
                                          "testCaseIds": [11, 12]
                                        }
                                        """)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.testSetId").value("TS-000007"))
                .andExpect(jsonPath("$.testPlanBusinessId").value("TP-000003"))
                .andExpect(jsonPath("$.name").value("Smoke Pack"));
    }

    @Test
    void shouldRejectEmptyMembership() throws Exception {
        mockMvc.perform(
                        post("/api/test-sets")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "testPlanId": 3,
                                          "name": "Empty Pack",
                                          "testCaseIds": []
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest());
    }
}
