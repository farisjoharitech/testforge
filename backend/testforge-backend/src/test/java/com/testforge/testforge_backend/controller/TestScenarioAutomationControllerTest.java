package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.dto.TestScenarioResponse;
import com.testforge.testforge_backend.service.TestScenarioService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TestScenarioAutomationControllerTest {

    @Test
    void shouldIncludeAutomatableInScenarioResponse() {
        Requirement requirement = new Requirement();
        requirement.setId(2L);
        requirement.setRequirementId("REQ-000002");
        TestScenario scenario = new TestScenario();
        scenario.setId(3L);
        scenario.setScenarioId("SCN-000003");
        scenario.setRequirement(requirement);
        scenario.setAutomatable(true);

        TestScenarioService service = mock(TestScenarioService.class);
        when(service.getById(3L)).thenReturn(scenario);

        TestScenarioResponse response = new TestScenarioController(service)
                .getById(3L)
                .getBody();

        assertTrue(response.isAutomatable());
    }
}
