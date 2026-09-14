package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.dto.CreateProjectRequest;
import com.testforge.testforge_backend.dto.ProjectResponse;
import com.testforge.testforge_backend.dto.TestPlanResponse;
import com.testforge.testforge_backend.dto.UpdateProjectRequest;
import com.testforge.testforge_backend.service.ProjectService;
import com.testforge.testforge_backend.service.TestPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final TestPlanService testPlanService;

    public ProjectController(
            ProjectService projectService,
            TestPlanService testPlanService
    ) {
        this.projectService = projectService;
        this.testPlanService = testPlanService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @Valid
            @RequestBody
            CreateProjectRequest request
    ) {
        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        toResponse(
                                projectService.create(
                                        request
                                )
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(
                projectService
                        .getAll()
                        .stream()
                        .map(
                                this::toResponse
                        )
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(
            @PathVariable
            Long id
    ) {
        return ResponseEntity.ok(
                toResponse(
                        projectService
                                .getById(
                                        id
                                )
                )
        );
    }

    @GetMapping("/business/{projectId}")
    public ResponseEntity<ProjectResponse> getByProjectId(
            @PathVariable
            String projectId
    ) {
        return ResponseEntity.ok(
                toResponse(
                        projectService
                                .getByProjectId(
                                        projectId
                                )
                )
        );
    }

    @GetMapping("/{projectId}/test-plans")
    public ResponseEntity<List<TestPlanResponse>> getTestPlans(
            @PathVariable
            String projectId
    ) {
        return ResponseEntity.ok(
                testPlanService
                        .getByProjectBusinessId(
                                projectId
                        )
                        .stream()
                        .map(
                                TestPlanController::toResponse
                        )
                        .toList()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable
            Long id,
            @Valid
            @RequestBody
            UpdateProjectRequest request
    ) {
        return ResponseEntity.ok(
                toResponse(
                        projectService.update(
                                id,
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable
            Long id
    ) {
        projectService.delete(
                id
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    private ProjectResponse toResponse(
            Project project
    ) {
        ProjectResponse response =
                new ProjectResponse();

        response.setId(
                project.getId()
        );

        response.setProjectId(
                project.getProjectId()
        );

        response.setName(
                project.getName()
        );

        response.setDescription(
                project.getDescription()
        );

        response.setStatus(
                project.getStatus()
        );

        response.setCreatedAt(
                project.getCreatedAt()
        );

        response.setUpdatedAt(
                project.getUpdatedAt()
        );

        return response;
    }
}
