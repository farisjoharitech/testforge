package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunEventResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.execution.AutomationRunEventType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AutomationRunEventStreamService {

    private static final long EMITTER_TIMEOUT_MS = 10 * 60 * 1000L;
    private static final int MAX_HISTORY_PER_RUN = 500;

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters =
            new ConcurrentHashMap<>();

    private final Map<Long, CopyOnWriteArrayList<AutomationRunEventResponse>> history =
            new ConcurrentHashMap<>();

    private final Map<Long, AtomicLong> sequences =
            new ConcurrentHashMap<>();

    public SseEmitter open(Long runId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);

        emitters.computeIfAbsent(
                runId,
                ignored -> new CopyOnWriteArrayList<>()
        ).add(emitter);

        emitter.onCompletion(() -> remove(runId, emitter));
        emitter.onTimeout(() -> remove(runId, emitter));
        emitter.onError(ignored -> remove(runId, emitter));

        try {
            List<AutomationRunEventResponse> previous = history.get(runId);

            if (previous != null) {
                for (AutomationRunEventResponse event : previous) {
                    send(emitter, event);
                }
            }
        } catch (IOException exception) {
            remove(runId, emitter);
            emitter.completeWithError(exception);
        }

        return emitter;
    }

    public AutomationRunEventResponse publishTestCaseStarted(
            AutomationExecutionResponse execution
    ) {
        return publish(
                execution.automationRunId(),
                AutomationRunEventType.TEST_CASE_STARTED,
                execution.automationRunBusinessId(),
                execution.id(),
                execution.executionId(),
                execution.testCaseId(),
                execution.testCaseBusinessId(),
                null,
                null,
                null,
                "Test Case started"
        );
    }

    public AutomationRunEventResponse publishStepStarted(
            AutomationExecutionResponse execution,
            int stepOrder,
            String automationStepId,
            String actionType
    ) {
        return publish(
                execution.automationRunId(),
                AutomationRunEventType.STEP_STARTED,
                execution.automationRunBusinessId(),
                execution.id(),
                execution.executionId(),
                execution.testCaseId(),
                execution.testCaseBusinessId(),
                stepOrder,
                automationStepId,
                actionType,
                "Step started"
        );
    }

    public AutomationRunEventResponse publishStepPassed(
            AutomationExecutionResponse execution,
            int stepOrder,
            String automationStepId,
            String actionType
    ) {
        return publish(
                execution.automationRunId(),
                AutomationRunEventType.STEP_PASSED,
                execution.automationRunBusinessId(),
                execution.id(),
                execution.executionId(),
                execution.testCaseId(),
                execution.testCaseBusinessId(),
                stepOrder,
                automationStepId,
                actionType,
                "Step passed"
        );
    }

    public AutomationRunEventResponse publishStepFailed(
            AutomationExecutionResponse execution,
            int stepOrder,
            String automationStepId,
            String actionType,
            String message
    ) {
        return publish(
                execution.automationRunId(),
                AutomationRunEventType.STEP_FAILED,
                execution.automationRunBusinessId(),
                execution.id(),
                execution.executionId(),
                execution.testCaseId(),
                execution.testCaseBusinessId(),
                stepOrder,
                automationStepId,
                actionType,
                message == null || message.isBlank() ? "Step failed" : message
        );
    }

    public AutomationRunEventResponse publishRunCompleted(
            AutomationRunResponse run
    ) {
        return publish(
                run.id(),
                AutomationRunEventType.RUN_COMPLETED,
                run.runId(),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Run completed with status " + run.status().name()
        );
    }

    private AutomationRunEventResponse publish(
            Long runId,
            AutomationRunEventType eventType,
            String runBusinessId,
            Long executionId,
            String executionBusinessId,
            Long testCaseId,
            String testCaseBusinessId,
            Integer stepOrder,
            String automationStepId,
            String actionType,
            String message
    ) {
        long sequence = sequences
                .computeIfAbsent(runId, ignored -> new AtomicLong())
                .incrementAndGet();

        AutomationRunEventResponse event = new AutomationRunEventResponse(
                sequence,
                eventType,
                runId,
                runBusinessId,
                executionId,
                executionBusinessId,
                testCaseId,
                testCaseBusinessId,
                stepOrder,
                automationStepId,
                actionType,
                message,
                LocalDateTime.now()
        );

        CopyOnWriteArrayList<AutomationRunEventResponse> runHistory =
                history.computeIfAbsent(
                        runId,
                        ignored -> new CopyOnWriteArrayList<>()
                );

        runHistory.add(event);

        while (runHistory.size() > MAX_HISTORY_PER_RUN) {
            runHistory.remove(0);
        }

        CopyOnWriteArrayList<SseEmitter> current = emitters.get(runId);

        if (current != null) {
            for (SseEmitter emitter : current) {
                try {
                    send(emitter, event);
                } catch (IOException | IllegalStateException exception) {
                    remove(runId, emitter);
                }
            }
        }

        return event;
    }

    private void send(
            SseEmitter emitter,
            AutomationRunEventResponse event
    ) throws IOException {
        emitter.send(
                SseEmitter.event()
                        .id(Long.toString(event.sequence()))
                        .name("run-event")
                        .data(event)
        );
    }

    private void remove(Long runId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> current = emitters.get(runId);

        if (current == null) {
            return;
        }

        current.remove(emitter);

        if (current.isEmpty()) {
            emitters.remove(runId, current);
        }
    }
}
