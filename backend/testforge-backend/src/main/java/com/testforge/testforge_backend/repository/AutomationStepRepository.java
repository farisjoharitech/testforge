package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AutomationStepRepository
        extends JpaRepository<AutomationStep, Long> {

    Optional<AutomationStep> findByAutomationStepId(
            String automationStepId
    );

    boolean existsByAutomationStepId(
            String automationStepId
    );

    @Query("""
            select count(step)
            from AutomationStep step
            where step.automationScript.testCase.id = :testCaseId
            """)
    long countByTestCaseId(@Param("testCaseId") Long testCaseId);

    @Query("""
            select count(step)
            from AutomationStep step
            where step.automationScript.testCase.testScenario.id = :scenarioId
            """)
    long countByScenarioId(@Param("scenarioId") Long scenarioId);

    @Query("""
            select count(step)
            from AutomationStep step
            where step.automationScript.testCase.testScenario.requirement.id = :requirementId
            """)
    long countByRequirementId(@Param("requirementId") Long requirementId);

    boolean existsByAutomationScriptIdAndStepOrder(
            Long automationScriptId,
            Integer stepOrder
    );

    boolean existsByAutomationScriptIdAndTestStepId(
            Long automationScriptId,
            Long testStepId
    );

    List<AutomationStep> findByAutomationScriptIdOrderByStepOrderAsc(
            Long automationScriptId
    );

    List<AutomationStep> findByTestStepIdOrderByStepOrderAsc(
            Long testStepId
    );

    @Query("""
            select new com.testforge.testforge_backend.automation.dto.AutomationOverviewItem(
                scenario.scenarioId, scenario.description, c.testCaseId, c.name,
                s.testStepId, a.stepOrder, a.actionType, scenario.automatable)
            from AutomationStep a join a.testStep s join s.testCase c
            join c.testScenario scenario join scenario.requirement r join r.module m
            where m.project.projectId = :projectId
            order by scenario.id, c.id, a.stepOrder
            """)
    List<com.testforge.testforge_backend.automation.dto.AutomationOverviewItem> overview(@Param("projectId") String projectId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("delete from AutomationStep a where a.automationScript.testCase.id = :id")
    void deleteOwnedByTestCase(@Param("id") Long id);

    @Query("select count(a) from AutomationStep a where a.testStep.testCase.id = :id and a.automationScript.testCase.id <> :id")
    long countExternalMappings(@Param("id") Long id);

    boolean existsByTestStepId(Long testStepId);

    @Query("""
            select count(s) from TestStep s where s.testCase.id = :testCaseId
            and not exists (select a.id from AutomationStep a where a.testStep.id = s.id)
            """)
    long countUnmappedTestSteps(@Param("testCaseId") Long testCaseId);
}
