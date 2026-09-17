package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AutomationExecutionRepository
        extends JpaRepository<
        AutomationExecution,
        Long
        > {

    @EntityGraph(
            attributePaths = {
                    "automationRun",
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
                    "automationRun",
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
                    "automationRun",
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
                    "automationRun",
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
                    "automationRun",
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

    long countByTestCase_Id(Long testCaseId);

    @Query("""
            select count(execution)
            from AutomationExecution execution
            where execution.testCase.testScenario.id = :scenarioId
            """)
    long countByScenarioId(@Param("scenarioId") Long scenarioId);

    @Query("""
            select count(execution)
            from AutomationExecution execution
            where execution.testCase.testScenario.requirement.id = :requirementId
            """)
    long countByRequirementId(@Param("requirementId") Long requirementId);

    @EntityGraph(
            attributePaths = {
                    "automationRun",
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution> findByAutomationRun_IdOrderByStartedAtAsc(
            Long automationRunId
    );

    /*
     * =========================================================
     * TASK 36.22 — PROJECT MONITORING
     * =========================================================
     */

    @Query("""
            select execution
            from AutomationExecution execution
            join fetch execution.automationScript automationScript
            join fetch execution.testCase testCase
            join fetch testCase.testScenario testScenario
            join fetch testScenario.requirement requirement
            join fetch requirement.testPlan testPlan
            join fetch testPlan.project project
            where project.id = :projectId
              and execution.status <> :excludedStatus
            order by execution.startedAt desc, execution.id desc
            """)
    List<AutomationExecution>
    findCompletedByProjectIdOrderByStartedAtDesc(
            @Param("projectId")
            Long projectId,
            @Param("excludedStatus")
            AutomationExecutionStatus excludedStatus
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
                    "automationRun",
                    "automationScript",
                    "testCase"
            }
    )
    List<AutomationExecution>
    findTop5ByStatusNotOrderByStartedAtDesc(
            AutomationExecutionStatus status
    );

    /*
     * =========================================================
     * TASK 36.23 — TEST PLAN / REQUIREMENT MONITORING
     * =========================================================
     */

    @Query("""
            select execution
            from AutomationExecution execution
            join fetch execution.automationScript automationScript
            join fetch execution.testCase testCase
            join fetch testCase.testScenario testScenario
            join fetch testScenario.requirement requirement
            join fetch requirement.testPlan testPlan
            where testPlan.id = :testPlanId
              and execution.status <> :excludedStatus
            order by execution.startedAt desc, execution.id desc
            """)
    List<AutomationExecution> findCompletedByTestPlanIdOrderByStartedAtDesc(
            @Param("testPlanId") Long testPlanId,
            @Param("excludedStatus") AutomationExecutionStatus excludedStatus
    );

    @Query("""
            select execution
            from AutomationExecution execution
            join fetch execution.automationScript automationScript
            join fetch execution.testCase testCase
            join fetch testCase.testScenario testScenario
            join fetch testScenario.requirement requirement
            where requirement.id = :requirementId
              and execution.status <> :excludedStatus
            order by execution.startedAt desc, execution.id desc
            """)
    List<AutomationExecution> findCompletedByRequirementIdOrderByStartedAtDesc(
            @Param("requirementId") Long requirementId,
            @Param("excludedStatus") AutomationExecutionStatus excludedStatus
    );
}
