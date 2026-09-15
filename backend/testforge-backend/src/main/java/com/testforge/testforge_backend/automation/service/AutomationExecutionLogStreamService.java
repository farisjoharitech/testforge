package com.testforge.testforge_backend.automation.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class AutomationExecutionLogStreamService {

    private static final long EMITTER_TIMEOUT_MS = 10 * 60 * 1000L;

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters =
            new ConcurrentHashMap<>();

    public SseEmitter open(
            Long executionDatabaseId,
            String currentLog,
            String currentStatus
    ) {
        SseEmitter emitter =
                new SseEmitter(EMITTER_TIMEOUT_MS);

        emitters
                .computeIfAbsent(
                        executionDatabaseId,
                        ignored -> new CopyOnWriteArrayList<>()
                )
                .add(emitter);

        emitter.onCompletion(
                () -> remove(executionDatabaseId, emitter)
        );

        emitter.onTimeout(
                () -> remove(executionDatabaseId, emitter)
        );

        emitter.onError(
                ignored -> remove(executionDatabaseId, emitter)
        );

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("snapshot")
                            .data(currentLog == null ? "" : currentLog)
            );

            emitter.send(
                    SseEmitter.event()
                            .name("status")
                            .data(currentStatus == null ? "RUNNING" : currentStatus)
            );
        } catch (IOException exception) {
            remove(executionDatabaseId, emitter);
            emitter.completeWithError(exception);
        }

        return emitter;
    }

    public void publishLog(
            Long executionDatabaseId,
            String chunk
    ) {
        if (chunk == null || chunk.isEmpty()) {
            return;
        }

        publish(
                executionDatabaseId,
                "log",
                chunk,
                false
        );
    }

    public void publishCompleted(
            Long executionDatabaseId,
            String finalStatus
    ) {
        publish(
                executionDatabaseId,
                "complete",
                finalStatus == null ? "UNKNOWN" : finalStatus,
                true
        );
    }

    private void publish(
            Long executionDatabaseId,
            String eventName,
            String data,
            boolean completeAfterSend
    ) {
        List<SseEmitter> current =
                emitters.get(executionDatabaseId);

        if (current == null || current.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : current) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name(eventName)
                                .data(data)
                );

                if (completeAfterSend) {
                    emitter.complete();
                }

            } catch (IOException | IllegalStateException exception) {
                remove(executionDatabaseId, emitter);
            }
        }

        if (completeAfterSend) {
            emitters.remove(executionDatabaseId);
        }
    }

    private void remove(
            Long executionDatabaseId,
            SseEmitter emitter
    ) {
        CopyOnWriteArrayList<SseEmitter> current =
                emitters.get(executionDatabaseId);

        if (current == null) {
            return;
        }

        current.remove(emitter);

        if (current.isEmpty()) {
            emitters.remove(executionDatabaseId, current);
        }
    }
}
