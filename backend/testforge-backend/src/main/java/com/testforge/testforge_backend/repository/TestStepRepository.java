package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestStepRepository
        extends JpaRepository<TestStep, Long> {

    @EntityGraph(attributePaths = "testCase")
    Optional<TestStep> findByTestStepId(
            String testStepId
    );

    boolean existsByTestStepId(
            String testStepId
    );

    long countByTestCase_Id(Long testCaseId);

    @Query("""
            select count(ts)
            from TestStep ts
            where ts.testCase.testScenario.id = :scenarioId
            """)
    long countByScenarioId(@Param("scenarioId") Long scenarioId);

    @Query("""
            select count(ts)
            from TestStep ts
            where ts.testCase.testScenario.requirement.id = :requirementId
            """)
    long countByRequirementId(@Param("requirementId") Long requirementId);

    boolean existsByTestCaseAndStepOrder(
            TestCase testCase,
            Integer stepOrder
    );

    boolean existsByTestCaseAndStepOrderAndIdNot(
            TestCase testCase,
            Integer stepOrder,
            Long id
    );

    @EntityGraph(attributePaths = "testCase")
    Optional<TestStep> findTopByTestCaseOrderByStepOrderDesc(
            TestCase testCase
    );

    @EntityGraph(attributePaths = "testCase")
    List<TestStep> findByTestCaseOrderByStepOrderAsc(
            TestCase testCase
    );

    @Override
    @EntityGraph(attributePaths = "testCase")
    Optional<TestStep> findById(Long id);
}