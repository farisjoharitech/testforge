package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutomationExecutionRepository
        extends JpaRepository<AutomationExecution, Long> {

    Optional<AutomationExecution>
    findByExecutionId(
            String executionId
    );

    Optional<AutomationExecution>
    findTopByAutomationScript_IdOrderByStartedAtDesc(
            Long automationScriptId
    );

    List<AutomationExecution>
    findByAutomationScript_IdOrderByStartedAtDesc(
            Long automationScriptId
    );

    boolean existsByAutomationScript_IdAndStatus(
            Long automationScriptId,
            AutomationExecutionStatus status
    );
}