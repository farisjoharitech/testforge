package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.dto.ModuleResponse;
import com.testforge.testforge_backend.service.ModuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ModuleControllerTest {

    private ModuleService moduleService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        moduleService = mock(ModuleService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ModuleController(moduleService)).build();
    }

    @Test
    void getByIdUsesServiceMappedResponseWithoutAccessingDetachedRelationships() throws Exception {
        LocalDateTime now = LocalDateTime.now();
        when(moduleService.getById(7L)).thenReturn(new ModuleResponse(
                7L, "MOD-007", 2L, "PRJ-002", "Project",
                3L, "TP-003", "Plan", "Module", "Description", now, now));

        mockMvc.perform(get("/api/modules/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moduleId").value("MOD-007"))
                .andExpect(jsonPath("$.testPlanId").value(3L))
                .andExpect(jsonPath("$.testPlanBusinessId").value("TP-003"));

        verify(moduleService).getById(7L);
    }
}
