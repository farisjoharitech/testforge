package com.testforge.testforge_backend.testset.repository;

import com.testforge.testforge_backend.testset.entity.TestSet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestSetRepository extends JpaRepository<TestSet, Long> {

    @Override
    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    Optional<TestSet> findById(Long id);

    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    List<TestSet> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"testPlan", "items", "items.testCase", "items.testCase.testScenario"})
    List<TestSet> findByTestPlanIdOrderByIdAsc(Long testPlanId);
}
