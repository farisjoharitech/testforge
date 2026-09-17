package com.testforge.testforge_backend.automation.entity;

import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AutomationRunTest {

    @Test
    void shouldPassWhenEveryExecutionPasses() {
        LocalDateTime startedAt = LocalDateTime.now();

        AutomationRun run = new AutomationRun(
                "RUN-MULTI-PASS",
                AutomationRunType.MULTI_TEST_CASE,
                AutomationRunStatus.RUNNING,
                2,
                startedAt
        );

        run.recordExecutionFinished(true, startedAt.plusSeconds(1));
        assertEquals(AutomationRunStatus.RUNNING, run.getStatus());

        run.recordExecutionFinished(true, startedAt.plusSeconds(2));

        assertEquals(AutomationRunStatus.PASSED, run.getStatus());
        assertEquals(2, run.getCompletedExecutions());
        assertEquals(2, run.getPassedExecutions());
        assertEquals(0, run.getFailedExecutions());
        assertNotNull(run.getFinishedAt());
        assertNotNull(run.getDurationMs());
    }

    @Test
    void shouldBecomePartialWhenPassAndFailureAreMixed() {
        LocalDateTime startedAt = LocalDateTime.now();

        AutomationRun run = new AutomationRun(
                "RUN-MULTI-PARTIAL",
                AutomationRunType.MULTI_TEST_CASE,
                AutomationRunStatus.RUNNING,
                3,
                startedAt
        );

        run.recordExecutionFinished(true, startedAt.plusSeconds(1));
        run.recordExecutionFinished(false, startedAt.plusSeconds(2));
        run.recordExecutionFinished(true, startedAt.plusSeconds(3));

        assertEquals(AutomationRunStatus.PARTIAL, run.getStatus());
        assertEquals(3, run.getCompletedExecutions());
        assertEquals(2, run.getPassedExecutions());
        assertEquals(1, run.getFailedExecutions());
    }

    @Test
    void shouldFailWhenEveryExecutionFails() {
        LocalDateTime startedAt = LocalDateTime.now();

        AutomationRun run = new AutomationRun(
                "RUN-MULTI-FAIL",
                AutomationRunType.MULTI_TEST_CASE,
                AutomationRunStatus.RUNNING,
                2,
                startedAt
        );

        run.recordExecutionFinished(false, startedAt.plusSeconds(1));
        run.recordExecutionFinished(false, startedAt.plusSeconds(2));

        assertEquals(AutomationRunStatus.FAILED, run.getStatus());
        assertEquals(2, run.getFailedExecutions());
    }
}
