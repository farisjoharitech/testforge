package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.Module;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    @EntityGraph(attributePaths = {"module", "module.project", "module.testPlan"})
    Optional<Requirement> findByRequirementId(
            String requirementId
    );

    boolean existsByRequirementId(
            String requirementId
    );

    @EntityGraph(attributePaths = {"module", "module.project", "module.testPlan"})
    List<Requirement> findByModuleTestPlanOrderByIdAsc(
            TestPlan testPlan
    );

    @EntityGraph(attributePaths = {"module", "module.project", "module.testPlan"})
    List<Requirement> findByModuleOrderByIdAsc(Module module);

    boolean existsByModule(Module module);

    @Override
    @EntityGraph(attributePaths = {"module", "module.project", "module.testPlan"})
    Optional<Requirement> findById(Long id);
}
