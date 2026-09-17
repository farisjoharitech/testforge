package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AutomationScriptRepository
        extends JpaRepository<
        AutomationScript,
        Long
        > {

    Optional<AutomationScript>
    findByAutomationScriptId(
            String automationScriptId
    );

    Optional<AutomationScript>
    findByTestCaseId(
            Long testCaseId
    );

    boolean existsByAutomationScriptId(
            String automationScriptId
    );

    long countByTestCaseId(Long testCaseId);

    @Query("""
            select count(a)
            from AutomationScript a
            where a.testCase.testScenario.id = :scenarioId
            """)
    long countByScenarioId(@Param("scenarioId") Long scenarioId);

    @Query("""
            select count(a)
            from AutomationScript a
            where a.testCase.testScenario.requirement.id = :requirementId
            """)
    long countByRequirementId(@Param("requirementId") Long requirementId);

    boolean existsByTestCaseId(
            Long testCaseId
    );

    /*
     * =========================================================
     * TASK 36.13 — DASHBOARD
     * =========================================================
     */

    long countByGeneratedAtIsNotNull();
}