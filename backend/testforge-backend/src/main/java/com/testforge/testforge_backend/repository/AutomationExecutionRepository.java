package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutomationExecutionRepository
        extends JpaRepository<
        AutomationExecution,
        Long
        > {

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    Optional<AutomationExecution>
    findByExecutionId(
            String executionId
    );

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    Optional<AutomationExecution>
    findTopByAutomationScript_IdOrderByStartedAtDesc(
            Long automationScriptId
    );

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution>
    findByAutomationScript_IdOrderByStartedAtDesc(
            Long automationScriptId
    );

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution>
    findByTestCase_IdOrderByStartedAtDesc(
            Long testCaseId
    );

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution>
    findAllByOrderByStartedAtDesc();

    boolean existsByAutomationScript_IdAndStatus(
            Long automationScriptId,
            AutomationExecutionStatus status
    );

    /*
     * =========================================================
     * TASK 36.13 — DASHBOARD
     * =========================================================
     */

    long countByStatus(
            AutomationExecutionStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution>
    findTop5ByStatusNotOrderByStartedAtDesc(
            AutomationExecutionStatus status
    );
}