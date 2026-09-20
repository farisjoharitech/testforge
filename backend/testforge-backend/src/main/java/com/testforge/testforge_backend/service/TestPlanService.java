package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.dto.CreateTestPlanRequest;
import com.testforge.testforge_backend.dto.UpdateTestPlanRequest;
import com.testforge.testforge_backend.domain.enums.ProjectStatus;
import com.testforge.testforge_backend.exception.DuplicateTestPlanException;
import com.testforge.testforge_backend.exception.ProjectNotFoundException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.exception.TestPlanInUseException;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TestPlanService {

    private final TestPlanRepository testPlanRepository;
    private final ProjectRepository projectRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final ModuleRepository moduleRepository;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public TestPlanService(
            TestPlanRepository testPlanRepository,
            ProjectRepository projectRepository,
            ModuleRepository moduleRepository,
            BusinessIdGeneratorService businessIdGeneratorService,
            com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService
    ) {
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
        this.moduleRepository = moduleRepository;
        this.businessIdGeneratorService = businessIdGeneratorService;
        this.deletionService = deletionService;
    }

    public TestPlan create(
            CreateTestPlanRequest request
    ) {
        Project project =
                resolveProjectForCreate(
                        request.getProjectId(),
                        request.getProject()
                );

        String testPlanId =
                resolveTestPlanId(
                        request.getTestPlanId()
                );

        if (
                testPlanRepository.existsByTestPlanId(
                        testPlanId
                )
        ) {
            throw new DuplicateTestPlanException(
                    "Test Plan ID already exists: "
                            + testPlanId
            );
        }

        TestPlan testPlan =
                new TestPlan();

        testPlan.setTestPlanId(
                testPlanId
        );

        testPlan.setProject(
                project
        );

        applyFields(
                testPlan,
                request.getName(),
                request.getVersion(),
                request.getApplication(),
                request.getEnvironment(),
                request.getPreparedBy(),
                request.getStatus(),
                request.getApprovalStatus()
        );

        LocalDateTime now =
                LocalDateTime.now();

        testPlan.setCreatedAt(
                now
        );

        testPlan.setUpdatedAt(
                now
        );

        return testPlanRepository.save(
                testPlan
        );
    }

    @Transactional(readOnly = true)
    public TestPlan getById(
            Long id
    ) {
        return testPlanRepository
                .findById(id)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public TestPlan getByTestPlanId(
            String testPlanId
    ) {
        return testPlanRepository
                .findByTestPlanId(
                        testPlanId
                )
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with testPlanId: "
                                        + testPlanId
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<TestPlan> getAll() {
        return testPlanRepository
                .findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public List<TestPlan> getByProjectBusinessId(
            String projectBusinessId
    ) {
        Project project =
                getProjectByBusinessId(
                        projectBusinessId
                );

        return testPlanRepository
                .findByProjectOrderByIdAsc(
                        project
                );
    }

    public TestPlan update(
            Long id,
            UpdateTestPlanRequest request
    ) {
        TestPlan testPlan =
                getById(id);

        Project project =
                resolveProjectForCreate(
                        request.getProjectId(),
                        request.getProject()
                );

        testPlan.setProject(
                project
        );

        applyFields(
                testPlan,
                request.getName(),
                request.getVersion(),
                request.getApplication(),
                request.getEnvironment(),
                request.getPreparedBy(),
                request.getStatus(),
                request.getApprovalStatus()
        );

        testPlan.setUpdatedAt(
                LocalDateTime.now()
        );

        return testPlan;
    }

    public void delete(
            Long id
    ) {
        deletionService.deleteTestPlan(id);
    }

    private Project resolveProjectForCreate(
            String projectBusinessId,
            String legacyProjectName
    ) {
        if (
                projectBusinessId != null
                        && !projectBusinessId.isBlank()
        ) {
            return getProjectByBusinessId(
                    projectBusinessId
            );
        }

        if (
                legacyProjectName == null
                        || legacyProjectName.isBlank()
        ) {
            throw new ProjectNotFoundException(
                    "Project ID is required"
            );
        }

        String normalizedLegacyName =
                legacyProjectName.trim();

        return projectRepository
                .findByNameIgnoreCase(
                        normalizedLegacyName
                )
                .orElseGet(() -> {
                    Project project =
                            new Project();

                    String generatedProjectId =
                            businessIdGeneratorService
                                    .generateProjectId();

                    while (
                            projectRepository
                                    .existsByProjectId(
                                            generatedProjectId
                                    )
                    ) {
                        generatedProjectId =
                                businessIdGeneratorService
                                        .generateProjectId();
                    }

                    project.setProjectId(
                            generatedProjectId
                    );

                    project.setName(
                            normalizedLegacyName
                    );

                    project.setDescription(
                            "Created automatically from a legacy Test Plan project name."
                    );

                    project.setStatus(
                            ProjectStatus.ACTIVE
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
                });
    }

    private Project getProjectByBusinessId(
            String projectBusinessId
    ) {
        return projectRepository
                .findByProjectId(
                        projectBusinessId
                )
                .orElseThrow(() ->
                        new ProjectNotFoundException(
                                "Project not found with projectId: "
                                        + projectBusinessId
                        )
                );
    }

    private void applyFields(
            TestPlan testPlan,
            String name,
            String version,
            String application,
            String environment,
            String preparedBy,
            com.testforge.testforge_backend.domain.enums.TestPlanStatus status,
            com.testforge.testforge_backend.domain.enums.ApprovalStatus approvalStatus
    ) {
        testPlan.setName(
                name.trim()
        );

        testPlan.setVersion(
                normalizeOptional(
                        version
                )
        );

        testPlan.setApplication(
                normalizeOptional(
                        application
                )
        );

        testPlan.setEnvironment(
                normalizeOptional(
                        environment
                )
        );

        testPlan.setPreparedBy(
                normalizeOptional(
                        preparedBy
                )
        );

        testPlan.setStatus(
                status
        );

        testPlan.setApprovalStatus(
                approvalStatus
        );
    }

    private String resolveTestPlanId(
            String requestedTestPlanId
    ) {
        if (
                requestedTestPlanId != null
                        && !requestedTestPlanId.isBlank()
        ) {
            return requestedTestPlanId.trim();
        }

        String generatedId =
                businessIdGeneratorService
                        .generateTestPlanId();

        while (
                testPlanRepository.existsByTestPlanId(
                        generatedId
                )
        ) {
            generatedId =
                    businessIdGeneratorService
                            .generateTestPlanId();
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
