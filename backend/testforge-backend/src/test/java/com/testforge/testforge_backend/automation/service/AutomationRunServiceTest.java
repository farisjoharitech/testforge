package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.entity.AutomationRun;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationRunRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AutomationRunServiceTest {

    private AutomationRunRepository automationRunRepository;
    private AutomationExecutionRepository automationExecutionRepository;
    private AutomationRunService service;

    @BeforeEach
    void setUp() {
        automationRunRepository = mock(AutomationRunRepository.class);
        automationExecutionRepository = mock(AutomationExecutionRepository.class);
        service = new AutomationRunService(automationRunRepository, automationExecutionRepository);
    }

    @Test
    void shouldReturnRun() {
        LocalDateTime startedAt = LocalDateTime.of(2026, 9, 17, 11, 0);
        AutomationRun run = new AutomationRun(
                "RUN-20260917110000-ABCDEF12",
                AutomationRunType.SINGLE_TEST_CASE,
                AutomationRunStatus.RUNNING,
                1,
                startedAt
        );
        when(automationRunRepository.findById(10L)).thenReturn(Optional.of(run));

        var response = service.getById(10L);

        assertEquals("RUN-20260917110000-ABCDEF12", response.runId());
        assertEquals(AutomationRunType.SINGLE_TEST_CASE, response.runType());
        assertEquals(AutomationRunStatus.RUNNING, response.status());
        assertEquals(1, response.totalExecutions());
    }

    @Test
    void shouldReturn404StyleExceptionWhenRunDoesNotExist() {
        when(automationRunRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(AutomationNotFoundException.class, () -> service.getById(999L));
    }
}
