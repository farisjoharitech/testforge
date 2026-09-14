package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestPlanRepository
        extends JpaRepository<TestPlan, Long> {

    @EntityGraph(
            attributePaths = "project"
    )
    Optional<TestPlan> findByTestPlanId(
            String testPlanId
    );

    boolean existsByTestPlanId(
            String testPlanId
    );

    boolean existsByProject(
            Project project
    );

    @EntityGraph(
            attributePaths = "project"
    )
    List<TestPlan> findAllByOrderByIdAsc();

    @EntityGraph(
            attributePaths = "project"
    )
    List<TestPlan> findByProjectOrderByIdAsc(
            Project project
    );

    @Override
    @EntityGraph(
            attributePaths = "project"
    )
    Optional<TestPlan> findById(
            Long id
    );
}
