package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionRunner;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AutomationExecutionService {

    private final AutomationGenerationService automationGenerationService;
    private final AutomationExecutionPersistenceService persistenceService;
    private final AutomationExecutionRunner automationExecutionRunner;
    private final AutomationExecutionLogStreamService logStreamService;
    private final AutomationStructuredEventService structuredEventService;
    private final AutomationRunService automationRunService;
    private final AutomationRunEventStreamService runEventStreamService;

    public AutomationExecutionService(
            AutomationGenerationService automationGenerationService,
            AutomationExecutionPersistenceService persistenceService,
            AutomationExecutionRunner automationExecutionRunner,
            AutomationExecutionLogStreamService logStreamService,
            AutomationStructuredEventService structuredEventService,
            AutomationRunService automationRunService,
            AutomationRunEventStreamService runEventStreamService
    ) {
        this.automationGenerationService = automationGenerationService;
        this.persistenceService = persistenceService;
        this.automationExecutionRunner = automationExecutionRunner;
        this.logStreamService = logStreamService;
        this.structuredEventService = structuredEventService;
        this.automationRunService = automationRunService;
        this.runEventStreamService = runEventStreamService;
    }

    public AutomationExecutionResponse execute(Long scriptId) {
        GeneratedScriptResponse generatedScript =
                automationGenerationService.getGenerated(scriptId);

        if (generatedScript.stale()) {
            throw new AutomationConflictException(
                    "Generated script is stale. Regenerate the script before execution."
            );
        }

        AutomationExecutionResponse runningExecution =
                persistenceService.startExecution(
                        scriptId,
                        generatedScript
                );

        structuredEventService.testCaseStarted(runningExecution);

        CompletableFuture.runAsync(() -> {
            AutomationExecutionRunner.RunnerResult result =
                    automationExecutionRunner.execute(
                            runningExecution.executionId(),
                            generatedScript.className(),
                            generatedScript.source(),
                            chunk -> {
                                persistenceService.appendLiveLog(
                                        runningExecution.id(),
                                        chunk
                                );

                                logStreamService.publishLog(
                                        runningExecution.id(),
                                        chunk
                                );

                                structuredEventService.acceptOutput(
                                        runningExecution,
                                        chunk
                                );
                            }
                    );

            AutomationExecutionResponse finishedExecution =
                    persistenceService.finishExecution(
                            runningExecution.id(),
                            result
                    );

            structuredEventService.executionFinished(finishedExecution);

            logStreamService.publishCompleted(
                    runningExecution.id(),
                    finishedExecution.status().name()
            );

            AutomationRunResponse finishedRun =
                    automationRunService.getById(
                            finishedExecution.automationRunId()
                    );

            if (finishedRun.status() != AutomationRunStatus.RUNNING) {
                runEventStreamService.publishRunCompleted(finishedRun);
            }
        });

        return runningExecution;
    }

    public AutomationExecutionResponse getLatest(Long scriptId) {
        return persistenceService.getLatest(scriptId);
    }

    public AutomationExecutionResponse getById(Long executionId) {
        return persistenceService.getById(executionId);
    }
}
