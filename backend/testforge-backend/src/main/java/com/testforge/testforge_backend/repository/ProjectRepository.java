package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository
        extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectId(
            String projectId
    );

    Optional<Project> findByNameIgnoreCase(
            String name
    );

    boolean existsByProjectId(
            String projectId
    );

    boolean existsByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long id
    );

    List<Project> findAllByOrderByIdAsc();
}
