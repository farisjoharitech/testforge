package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestScenario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestScenarioRepository
        extends JpaRepository<TestScenario, Long> {

    @org.springframework.data.jpa.repository.Query("""
            select scenario from TestScenario scenario
            join fetch scenario.requirement requirement
            join fetch requirement.module module
            where module.project.id = :projectId and scenario.automatable = true
            order by scenario.id
            """)
    java.util.List<TestScenario> findAutomatableByProjectId(Long projectId);

    @EntityGraph(attributePaths = "requirement")
    Optional<TestScenario> findByScenarioId(
            String scenarioId
    );

    boolean existsByScenarioId(
            String scenarioId
    );

    long countByRequirement_Id(Long requirementId);

    @EntityGraph(attributePaths = "requirement")
    List<TestScenario> findByRequirementOrderByIdAsc(
            Requirement requirement
    );

    @Override
    @EntityGraph(attributePaths = "requirement")
    Optional<TestScenario> findById(Long id);
}
