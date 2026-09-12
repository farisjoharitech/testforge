package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    @EntityGraph(attributePaths = "testPlan")
    Optional<Requirement> findByRequirementId(
            String requirementId
    );

    boolean existsByRequirementId(
            String requirementId
    );

    @EntityGraph(attributePaths = "testPlan")
    List<Requirement> findByTestPlanOrderByIdAsc(
            TestPlan testPlan
    );

    @Override
    @EntityGraph(attributePaths = "testPlan")
    Optional<Requirement> findById(Long id);
}