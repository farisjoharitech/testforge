package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.exception.ResourceInUseException;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.dto.CreateRequirementRequest;
import com.testforge.testforge_backend.dto.UpdateRequirementRequest;
import com.testforge.testforge_backend.exception.DuplicateRequirementException;
import com.testforge.testforge_backend.exception.RequirementNotFoundException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.exception.ModuleNotFoundException;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.repository.ModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final TestPlanRepository testPlanRepository;
    private final ModuleRepository moduleRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final TestScenarioRepository children;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public RequirementService(
            RequirementRepository requirementRepository,
            TestPlanRepository testPlanRepository,
            ModuleRepository moduleRepository,
            BusinessIdGeneratorService businessIdGeneratorService,
            TestScenarioRepository children,
            com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService) {

        this.requirementRepository =
                requirementRepository;

        this.testPlanRepository =
                testPlanRepository;

        this.moduleRepository = moduleRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;

        this.children = children;
        this.deletionService = deletionService;
    }

    public Requirement create(
            String testPlanBusinessId,
            CreateRequirementRequest request) {

        TestPlan testPlan =
                testPlanRepository
                        .findByTestPlanId(
                                testPlanBusinessId
                        )
                        .orElseThrow(() ->
                                new TestPlanNotFoundException(
                                        "Test Plan not found with testPlanId: "
                                                + testPlanBusinessId
                                )
                        );

        String requirementId = resolveRequirementId(
                request.getRequirementId()
        );

        if (requirementRepository
                .existsByRequirementId(
                        requirementId
                )) {

            throw new DuplicateRequirementException(
                    "Requirement ID already exists: "
                            + requirementId
            );
        }

        Requirement requirement =
                new Requirement();

        requirement.setRequirementId(
                requirementId
        );

        Module module = moduleRepository.findByTestPlanOrderByIdAsc(testPlan)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ModuleNotFoundException(
                        "No Module exists for Project: " + testPlan.getProject().getProjectId()));
        requirement.setModule(module);

        requirement.setDescription(
                request.getDescription()
        );

        requirement.setPriority(
                request.getPriority()
        );

        requirement.setStatus(
                request.getStatus()
        );


        LocalDateTime now =
                LocalDateTime.now();

        requirement.setCreatedAt(
                now
        );

        requirement.setUpdatedAt(
                now
        );

        return requirementRepository.save(
                requirement
        );
    }

    public Requirement createForModule(
            String moduleBusinessId,
            CreateRequirementRequest request) {
        Module module = moduleRepository.findByModuleId(moduleBusinessId)
                .orElseThrow(() -> new ModuleNotFoundException(
                        "Module not found with moduleId: " + moduleBusinessId));
        String requirementId = resolveRequirementId(request.getRequirementId());
        if (requirementRepository.existsByRequirementId(requirementId)) {
            throw new DuplicateRequirementException("Requirement ID already exists: " + requirementId);
        }
        Requirement requirement = new Requirement();
        requirement.setRequirementId(requirementId);
        requirement.setModule(module);
        requirement.setDescription(request.getDescription());
        requirement.setPriority(request.getPriority());
        requirement.setStatus(request.getStatus());
        LocalDateTime now = LocalDateTime.now();
        requirement.setCreatedAt(now);
        requirement.setUpdatedAt(now);
        return requirementRepository.save(requirement);
    }

    @Transactional(readOnly = true)
    public List<Requirement> getByModule(String moduleBusinessId) {
        Module module = moduleRepository.findByModuleId(moduleBusinessId)
                .orElseThrow(() -> new ModuleNotFoundException(
                        "Module not found with moduleId: " + moduleBusinessId));
        return requirementRepository.findByModuleOrderByIdAsc(module);
    }

    @Transactional(readOnly = true)
    public List<Requirement> getByTestPlan(
            String testPlanBusinessId) {

        TestPlan testPlan =
                testPlanRepository
                        .findByTestPlanId(
                                testPlanBusinessId
                        )
                        .orElseThrow(() ->
                                new TestPlanNotFoundException(
                                        "Test Plan not found with testPlanId: "
                                                + testPlanBusinessId
                                )
                        );

        return requirementRepository
                .findByModuleTestPlanOrderByIdAsc(
                        testPlan
                );
    }

    @Transactional(readOnly = true)
    public Requirement getById(
            Long id) {

        return requirementRepository
                .findById(id)
                .orElseThrow(() ->
                        new RequirementNotFoundException(
                                "Requirement not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public Requirement getByRequirementId(
            String requirementId) {

        return requirementRepository
                .findByRequirementId(
                        requirementId
                )
                .orElseThrow(() ->
                        new RequirementNotFoundException(
                                "Requirement not found with requirementId: "
                                        + requirementId
                        )
                );
    }

    public Requirement update(
            Long id,
            UpdateRequirementRequest request) {

        Requirement requirement =
                requirementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RequirementNotFoundException(
                                        "Requirement not found with id: "
                                                + id
                                )
                        );

        requirement.setDescription(
                request.getDescription()
        );

        requirement.setPriority(
                request.getPriority()
        );

        requirement.setStatus(
                request.getStatus()
        );


        requirement.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * No repository.save() required here.
         *
         * Because this method is @Transactional,
         * requirement is still a managed JPA entity.
         *
         * Hibernate dirty checking automatically
         * persists the changed fields when the
         * transaction commits.
         *
         * Returning the same entity also preserves
         * the TestPlan loaded by the EntityGraph.
         */
        return requirement;
    }

    public void delete(
            Long id) {

        deletionService.deleteRequirement(id);
    }

    private String resolveRequirementId(
            String requestedRequirementId) {

        if (
                requestedRequirementId != null
                        && !requestedRequirementId.isBlank()
        ) {
            return requestedRequirementId.trim();
        }

        String generatedId = businessIdGeneratorService.generateRequirementId();

        while (requirementRepository.existsByRequirementId(generatedId)) {
            generatedId = businessIdGeneratorService.generateRequirementId();
        }

        return generatedId;
    }
}
