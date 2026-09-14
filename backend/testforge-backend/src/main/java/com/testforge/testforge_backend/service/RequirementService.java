package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.dto.CreateRequirementRequest;
import com.testforge.testforge_backend.dto.UpdateRequirementRequest;
import com.testforge.testforge_backend.exception.DuplicateRequirementException;
import com.testforge.testforge_backend.exception.RequirementNotFoundException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final TestPlanRepository testPlanRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;

    public RequirementService(
            RequirementRepository requirementRepository,
            TestPlanRepository testPlanRepository,
            BusinessIdGeneratorService businessIdGeneratorService) {

        this.requirementRepository =
                requirementRepository;

        this.testPlanRepository =
                testPlanRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;
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

        requirement.setTestPlan(
                testPlan
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
                .findByTestPlanOrderByIdAsc(
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

        if (!requirementRepository
                .existsById(id)) {

            throw new RequirementNotFoundException(
                    "Requirement not found with id: "
                            + id
            );
        }

        requirementRepository
                .deleteById(id);
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
