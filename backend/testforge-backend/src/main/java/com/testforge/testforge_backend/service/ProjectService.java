package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.dto.CreateProjectRequest;
import com.testforge.testforge_backend.dto.UpdateProjectRequest;
import com.testforge.testforge_backend.exception.DuplicateProjectException;
import com.testforge.testforge_backend.exception.ProjectInUseException;
import com.testforge.testforge_backend.exception.ProjectNotFoundException;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.testsuite.repository.TestSuiteRepository;
import com.testforge.testforge_backend.gitintegration.repository.GitIntegrationConfigurationRepository;
import com.testforge.testforge_backend.gitintegration.service.GitCredentialVault;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TestPlanRepository testPlanRepository;
    private final ModuleRepository moduleRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final com.testforge.testforge_backend.testsuite.repository.SuiteRunRepository suiteRunRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final GitIntegrationConfigurationRepository gitConfigurations;
    private final GitCredentialVault gitCredentials;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public ProjectService(
            ProjectRepository projectRepository,
            TestPlanRepository testPlanRepository,
            ModuleRepository moduleRepository,
            TestSuiteRepository testSuiteRepository,
            com.testforge.testforge_backend.testsuite.repository.SuiteRunRepository suiteRunRepository,
            BusinessIdGeneratorService businessIdGeneratorService,
            GitIntegrationConfigurationRepository gitConfigurations,
            GitCredentialVault gitCredentials,
            com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService
    ) {
        this.projectRepository = projectRepository;
        this.testPlanRepository = testPlanRepository;
        this.moduleRepository = moduleRepository;
        this.testSuiteRepository = testSuiteRepository;
        this.suiteRunRepository = suiteRunRepository;
        this.businessIdGeneratorService = businessIdGeneratorService;
        this.gitConfigurations = gitConfigurations;
        this.gitCredentials = gitCredentials;
        this.deletionService = deletionService;
    }

    public Project create(
            CreateProjectRequest request
    ) {
        String projectId = resolveProjectId(
                request.getProjectId()
        );

        if (
                projectRepository.existsByProjectId(
                        projectId
                )
        ) {
            throw new DuplicateProjectException(
                    "Project ID already exists: "
                            + projectId
            );
        }

        String normalizedName =
                request.getName().trim();

        if (
                projectRepository.existsByNameIgnoreCase(
                        normalizedName
                )
        ) {
            throw new DuplicateProjectException(
                    "Project name already exists: "
                            + normalizedName
            );
        }

        Project project =
                new Project();

        project.setProjectId(
                projectId
        );

        project.setName(
                normalizedName
        );

        project.setDescription(
                normalizeOptional(
                        request.getDescription()
                )
        );

        project.setStatus(
                request.getStatus()
        );

        LocalDateTime now =
                LocalDateTime.now();

        project.setCreatedAt(
                now
        );

        project.setUpdatedAt(
                now
        );

        return projectRepository.save(
                project
        );
    }

    @Transactional(readOnly = true)
    public List<Project> getAll() {
        return projectRepository
                .findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Project getById(
            Long id
    ) {
        return projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ProjectNotFoundException(
                                "Project not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public Project getByProjectId(
            String projectId
    ) {
        return projectRepository
                .findByProjectId(
                        projectId
                )
                .orElseThrow(() ->
                        new ProjectNotFoundException(
                                "Project not found with projectId: "
                                        + projectId
                        )
                );
    }

    public Project update(
            Long id,
            UpdateProjectRequest request
    ) {
        Project project =
                getById(id);

        String normalizedName =
                request.getName().trim();

        if (
                projectRepository
                        .existsByNameIgnoreCaseAndIdNot(
                                normalizedName,
                                id
                        )
        ) {
            throw new DuplicateProjectException(
                    "Project name already exists: "
                            + normalizedName
            );
        }

        project.setName(
                normalizedName
        );

        project.setDescription(
                normalizeOptional(
                        request.getDescription()
                )
        );

        project.setStatus(
                request.getStatus()
        );

        project.setUpdatedAt(
                LocalDateTime.now()
        );

        return project;
    }

    public void delete(
            Long id
    ) {
        Project project =
                getById(id);

        String projectBusinessId = project.getProjectId();
        deletionService.deleteProject(id);
        gitCredentials.remove(projectBusinessId);
    }

    private String resolveProjectId(
            String requestedProjectId
    ) {
        if (
                requestedProjectId != null
                        && !requestedProjectId.isBlank()
        ) {
            return requestedProjectId.trim();
        }

        String generatedId =
                businessIdGeneratorService
                        .generateProjectId();

        while (
                projectRepository.existsByProjectId(
                        generatedId
                )
        ) {
            generatedId =
                    businessIdGeneratorService
                            .generateProjectId();
        }

        return generatedId;
    }

    private String normalizeOptional(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}
