package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionRunner;
import org.springframework.stereotype.Service;

@Service
public class AutomationExecutionService {

    private final AutomationGenerationService
            automationGenerationService;

    private final AutomationExecutionPersistenceService
            persistenceService;

    private final AutomationExecutionRunner
            automationExecutionRunner;

    public AutomationExecutionService(
            AutomationGenerationService automationGenerationService,
            AutomationExecutionPersistenceService persistenceService,
            AutomationExecutionRunner automationExecutionRunner
    ) {

        this.automationGenerationService =
                automationGenerationService;

        this.persistenceService =
                persistenceService;

        this.automationExecutionRunner =
                automationExecutionRunner;
    }

    public AutomationExecutionResponse execute(
            Long scriptId
    ) {

        /*
         * Reuse Task 36.10 generated source.
         *
         * This also fails if no generated source exists.
         */
        GeneratedScriptResponse generatedScript =
                automationGenerationService
                        .getGenerated(
                                scriptId
                        );

        if (
                generatedScript.stale()
        ) {

            throw new AutomationConflictException(
                    "Generated script is stale. Regenerate the script before execution."
            );
        }

        AutomationExecutionResponse runningExecution =
                persistenceService
                        .startExecution(
                                scriptId,
                                generatedScript
                        );

        AutomationExecutionRunner.RunnerResult result =
                automationExecutionRunner
                        .execute(
                                runningExecution.executionId(),
                                generatedScript.className(),
                                generatedScript.source()
                        );

        return persistenceService
                .finishExecution(
                        runningExecution.id(),
                        result
                );
    }

    public AutomationExecutionResponse getLatest(
            Long scriptId
    ) {

        return persistenceService
                .getLatest(
                        scriptId
                );
    }

    public AutomationExecutionResponse getById(
            Long executionId
    ) {

        return persistenceService
                .getById(
                        executionId
                );
    }
}