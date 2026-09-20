package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    boolean existsByModuleId(String moduleId);
    boolean existsByProjectAndNameIgnoreCase(Project project, String name);
    boolean existsByProjectAndNameIgnoreCaseAndIdNot(Project project, String name, Long id);
    boolean existsByProject(Project project);
    boolean existsByTestPlan(TestPlan testPlan);
    boolean existsByTestPlanAndNameIgnoreCase(TestPlan testPlan, String name);
    boolean existsByTestPlanAndNameIgnoreCaseAndIdNot(TestPlan testPlan, String name, Long id);

    @EntityGraph(attributePaths = "project")
    Optional<Module> findByModuleId(String moduleId);

    @EntityGraph(attributePaths = "project")
    List<Module> findByProjectOrderByIdAsc(Project project);

    @EntityGraph(attributePaths = {"project", "testPlan"})
    List<Module> findByTestPlanOrderByIdAsc(TestPlan testPlan);

    @Override
    @EntityGraph(attributePaths = "project")
    Optional<Module> findById(Long id);
}
