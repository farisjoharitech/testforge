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

    long deleteByTestStepId(
            Long testStepId
    );
}
