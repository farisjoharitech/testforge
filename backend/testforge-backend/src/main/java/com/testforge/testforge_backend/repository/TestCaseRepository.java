package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestCaseRepository
        extends JpaRepository<TestCase, Long> {

    @EntityGraph(attributePaths = "testScenario")
    Optional<TestCase> findByTestCaseId(
            String testCaseId
    );

    boolean existsByTestCaseId(
            String testCaseId
    );

    @EntityGraph(attributePaths = "testScenario")
    List<TestCase> findByTestScenarioOrderByIdAsc(
            TestScenario testScenario
    );

    @Override
    @EntityGraph(attributePaths = "testScenario")
    Optional<TestCase> findById(Long id);

    @EntityGraph(attributePaths = "testScenario")
    List<TestCase> findByAutomatableTrueOrderByIdAsc();
}