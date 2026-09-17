package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

class AutomationStructuredEventServiceTest {

    private AutomationRunEventStreamService runEventStreamService;
    private AutomationStructuredEventService service;

    @BeforeEach
    void setUp() {
        runEventStreamService = mock(AutomationRunEventStreamService.class);
        service = new AutomationStructuredEventService(runEventStreamService);
    }

    @Test
    void shouldPublishStartedAndPassedStepEvents() {
        AutomationExecutionResponse execution = execution(AutomationExecutionStatus.RUNNING, null);

        service.testCaseStarted(execution);
        service.acceptOutput(
                execution,
                "TF_EVENT|STEP_STARTED|2|AUTO-STEP-002|CLICK\n"
        );
        service.acceptOutput(
                execution,
                "TF_EVENT|STEP_PASSED|2|AUTO-STEP-002|CLICK\n"
        );

        verify(runEventStreamService).publishTestCaseStarted(execution);
        verify(runEventStreamService).publishStepStarted(
                execution,
                2,
                "AUTO-STEP-002",
                "CLICK"
        );
        verify(runEventStreamService).publishStepPassed(
                execution,
                2,
                "AUTO-STEP-002",
                "CLICK"
        );
    }

    @Test
    void shouldPublishFailedForActiveStepWhenExecutionFails() {
        AutomationExecutionResponse running = execution(AutomationExecutionStatus.RUNNING, null);
        AutomationExecutionResponse failed = execution(
                AutomationExecutionStatus.FAILED,
                "Generated automation test failed."
        );

        service.acceptOutput(
                running,
                "[INFO] TF_EVENT|STEP_STARTED|3|AUTO-STEP-003|ASSERT_TEXT\n"
        );
        service.executionFinished(failed);

        verify(runEventStreamService).publishStepStarted(
                running,
                3,
                "AUTO-STEP-003",
                "ASSERT_TEXT"
        );
        verify(runEventStreamService).publishStepFailed(
                failed,
                3,
                "AUTO-STEP-003",
                "ASSERT_TEXT",
                "Generated automation test failed."
        );
    }

    @Test
    void shouldIgnoreNormalConsoleLines() {
        AutomationExecutionResponse execution = execution(AutomationExecutionStatus.RUNNING, null);

        service.acceptOutput(execution, "[INFO] Running generated test\n");

        verifyNoMoreInteractions(runEventStreamService);
    }

    private AutomationExecutionResponse execution(
            AutomationExecutionStatus status,
            String errorMessage
    ) {
        LocalDateTime startedAt = LocalDateTime.now();

        return new AutomationExecutionResponse(
                21L,
                "EXEC-TEST-001",
                9L,
                "RUN-TEST-001",
                5L,
                "AUTOSCRIPT-001",
                7L,
                "TC-001",
                status,
                "GeneratedTest",
                startedAt,
                status == AutomationExecutionStatus.PASSED ? 0 : null,
                null,
                errorMessage,
                startedAt,
                status == AutomationExecutionStatus.RUNNING ? null : startedAt.plusSeconds(1),
                status == AutomationExecutionStatus.RUNNING ? null : 1000L
        );
    }
}
