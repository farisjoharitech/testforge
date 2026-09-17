package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationRun;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AutomationRunService {

    private final AutomationRunRepository automationRunRepository;
    private final AutomationExecutionRepository automationExecutionRepository;

    public AutomationRunService(
            AutomationRunRepository automationRunRepository,
            AutomationExecutionRepository automationExecutionRepository
    ) {
        this.automationRunRepository = automationRunRepository;
        this.automationExecutionRepository = automationExecutionRepository;
    }

    @Transactional(readOnly = true)
    public AutomationRunResponse getById(Long runId) {
        return toResponse(findRun(runId));
    }

    @Transactional(readOnly = true)
    public List<AutomationExecutionResponse> getExecutions(Long runId) {
        findRun(runId);
        return automationExecutionRepository.findByAutomationRun_IdOrderByStartedAtAsc(runId)
                .stream()
                .map(this::toExecutionResponse)
                .toList();
    }

    private AutomationRun findRun(Long runId) {
        return automationRunRepository.findById(runId)
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation Run not found: " + runId));
    }

    private AutomationRunResponse toResponse(AutomationRun run) {
        return new AutomationRunResponse(
                run.getId(),
                run.getRunId(),
                run.getRunType(),
                run.getStatus(),
                run.getTotalExecutions(),
                run.getCompletedExecutions(),
                run.getPassedExecutions(),
                run.getFailedExecutions(),
                run.getStartedAt(),
                run.getFinishedAt(),
                run.getDurationMs()
        );
    }

    private AutomationExecutionResponse toExecutionResponse(AutomationExecution execution) {
        return new AutomationExecutionResponse(
                execution.getId(),
                execution.getExecutionId(),
                execution.getAutomationRun().getId(),
                execution.getAutomationRun().getRunId(),
                execution.getAutomationScript().getId(),
                execution.getAutomationScript().getAutomationScriptId(),
                execution.getTestCase().getId(),
                execution.getTestCase().getTestCaseId(),
                execution.getStatus(),
                execution.getGeneratedClassName(),
                execution.getGeneratedAt(),
                execution.getExitCode(),
                execution.getLogOutput(),
                execution.getErrorMessage(),
                execution.getStartedAt(),
                execution.getFinishedAt(),
                execution.getDurationMs()
        );
    }
}
