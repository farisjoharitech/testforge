package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestCaseRepository
        extends JpaRepository<TestCase, Long> {

    @EntityGraph(
            attributePaths = "testScenario"
    )
    Optional<TestCase> findByTestCaseId(
            String testCaseId
    );

    boolean existsByTestCaseId(
            String testCaseId
    );

    @EntityGraph(
            attributePaths = "testScenario"
    )
    List<TestCase> findByTestScenarioOrderByIdAsc(
            TestScenario testScenario
    );

    @Override
    @EntityGraph(
            attributePaths = "testScenario"
    )
    Optional<TestCase> findById(
            Long id
    );

    @EntityGraph(
            attributePaths = "testScenario"
    )
    List<TestCase>
    findByAutomatableTrueOrderByIdAsc();

    /*
     * =========================================================
     * TASK 36.22 — PROJECT MONITORING
     * =========================================================
     */

    @Query("""
            select tc
            from TestCase tc
            join fetch tc.testScenario ts
            join fetch ts.requirement r
            join fetch r.testPlan tp
            join fetch tp.project p
            where p.id = :projectId
            order by tc.id asc
            """)
    List<TestCase> findByProjectIdOrderByIdAsc(
            @Param("projectId")
            Long projectId
    );

    /*
     * =========================================================
     * TASK 36.13 — DASHBOARD
     * =========================================================
     */

    long countByAutomatableTrue();

    long countByAutomatableTrueAndAutomationStatus(
            AutomationStatus automationStatus
    );

    long countByAutomatableTrueAndAutomationType(
            AutomationType automationType
    );
}