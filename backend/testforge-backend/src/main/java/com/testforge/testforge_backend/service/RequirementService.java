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

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final TestPlanRepository testPlanRepository;

    public RequirementService(
            RequirementRepository requirementRepository,
            TestPlanRepository testPlanRepository) {

        this.requirementRepository = requirementRepository;
        this.testPlanRepository = testPlanRepository;
    }

    public Requirement create(
            String testPlanBusinessId,
            CreateRequirementRequest request) {

        TestPlan testPlan = testPlanRepository
                .findByTestPlanId(testPlanBusinessId)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with testPlanId: "
                                        + testPlanBusinessId
                        )
                );

        if (requirementRepository.existsByRequirementId(
                request.getRequirementId())) {

            throw new DuplicateRequirementException(
                    "Requirement ID already exists: "
                            + request.getRequirementId()
            );
        }

        Requirement requirement = new Requirement();

        requirement.setRequirementId(
                request.getRequirementId()
        );

        requirement.setTestPlan(testPlan);

        requirement.setDescription(
                request.getDescription()
        );

        requirement.setPriority(
                request.getPriority()
        );

        requirement.setStatus(
                request.getStatus()
        );

        requirement.setAutomatable(
                request.getAutomatable()
        );

        LocalDateTime now = LocalDateTime.now();

        requirement.setCreatedAt(now);
        requirement.setUpdatedAt(now);

        return requirementRepository.save(requirement);
    }

    public List<Requirement> getByTestPlan(
            String testPlanBusinessId) {

        TestPlan testPlan = testPlanRepository
                .findByTestPlanId(testPlanBusinessId)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with testPlanId: "
                                        + testPlanBusinessId
                        )
                );

        return requirementRepository
                .findByTestPlanOrderByIdAsc(testPlan);
    }

    public Requirement getById(Long id) {

        return requirementRepository
                .findById(id)
                .orElseThrow(() ->
                        new RequirementNotFoundException(
                                "Requirement not found with id: "
                                        + id
                        )
                );
    }

    public Requirement getByRequirementId(
            String requirementId) {

        return requirementRepository
                .findByRequirementId(requirementId)
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

        Requirement requirement = requirementRepository
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

        requirement.setAutomatable(
                request.getAutomatable()
        );

        requirement.setUpdatedAt(
                LocalDateTime.now()
        );

        return requirementRepository.save(requirement);
    }

    public void delete(Long id) {

        if (!requirementRepository.existsById(id)) {

            throw new RequirementNotFoundException(
                    "Requirement not found with id: "
                            + id
            );
        }

        requirementRepository.deleteById(id);
    }
}