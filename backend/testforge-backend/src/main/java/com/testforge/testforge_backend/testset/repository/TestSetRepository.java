package com.testforge.testforge_backend.testset.repository;

import com.testforge.testforge_backend.testset.entity.TestSet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestSetRepository extends JpaRepository<TestSet, Long> {

    @Query("""
            select count(item)
            from TestSetItem item
            where item.testCase.id = :testCaseId
            """)
    long countMembershipsByTestCaseId(@Param("testCaseId") Long testCaseId);

    @Query("""
            select count(item)
            from TestSetItem item
            where item.testCase.testScenario.id = :scenarioId
            """)
    long countMembershipsByScenarioId(@Param("scenarioId") Long scenarioId);

    @Query("""
            select count(item)
            from TestSetItem item
            where item.testCase.testScenario.requirement.id = :requirementId
            """)
    long countMembershipsByRequirementId(@Param("requirementId") Long requirementId);

    @Override
    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    Optional<TestSet> findById(Long id);

    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    List<TestSet> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    List<TestSet> findByTestPlanIdOrderByIdAsc(Long testPlanId);
}
