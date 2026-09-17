package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AutomationStructuredEventService {

    private static final String PREFIX = "TF_EVENT|";

    private final AutomationRunEventStreamService runEventStreamService;

    private final Map<Long, StepContext> activeSteps =
            new ConcurrentHashMap<>();

    public AutomationStructuredEventService(
            AutomationRunEventStreamService runEventStreamService
    ) {
        this.runEventStreamService = runEventStreamService;
    }

    public void testCaseStarted(AutomationExecutionResponse execution) {
        activeSteps.remove(execution.id());
        runEventStreamService.publishTestCaseStarted(execution);
    }

    public void acceptOutput(
            AutomationExecutionResponse execution,
            String chunk
    ) {
        if (chunk == null || chunk.isBlank()) {
            return;
        }

        String[] lines = chunk.split("\\R");

        for (String rawLine : lines) {
            String line = rawLine.trim();
            int markerIndex = line.indexOf(PREFIX);

            if (markerIndex < 0) {
                continue;
            }

            parseMarker(
                    execution,
                    line.substring(markerIndex)
            );
        }
    }

    public void executionFinished(
            AutomationExecutionResponse execution
    ) {
        StepContext activeStep = activeSteps.remove(execution.id());

        if (
                activeStep != null
                        && execution.status() != AutomationExecutionStatus.PASSED
        ) {
            runEventStreamService.publishStepFailed(
                    execution,
                    activeStep.stepOrder(),
                    activeStep.automationStepId(),
                    activeStep.actionType(),
                    execution.errorMessage()
            );
        }
    }

    private void parseMarker(
            AutomationExecutionResponse execution,
            String marker
    ) {
        String[] parts = marker.split("\\|", -1);

        if (parts.length < 5 || !"TF_EVENT".equals(parts[0])) {
            return;
        }

        Integer stepOrder;

        try {
            stepOrder = Integer.valueOf(parts[2]);
        } catch (NumberFormatException exception) {
            return;
        }

        String automationStepId = parts[3];
        String actionType = parts[4];

        if ("STEP_STARTED".equals(parts[1])) {
            StepContext context = new StepContext(
                    stepOrder,
                    automationStepId,
                    actionType
            );

            activeSteps.put(execution.id(), context);

            runEventStreamService.publishStepStarted(
                    execution,
                    stepOrder,
                    automationStepId,
                    actionType
            );
            return;
        }

        if ("STEP_PASSED".equals(parts[1])) {
            activeSteps.remove(execution.id());

            runEventStreamService.publishStepPassed(
                    execution,
                    stepOrder,
                    automationStepId,
                    actionType
            );
        }
    }

    private record StepContext(
            int stepOrder,
            String automationStepId,
            String actionType
    ) {
    }
}
