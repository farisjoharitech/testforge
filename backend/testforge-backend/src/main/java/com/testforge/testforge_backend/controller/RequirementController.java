package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.dto.CreateRequirementRequest;
import com.testforge.testforge_backend.dto.RequirementResponse;
import com.testforge.testforge_backend.dto.UpdateRequirementRequest;
import com.testforge.testforge_backend.service.RequirementService;
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
@RequestMapping("/api")
public class RequirementController {

    private final RequirementService requirementService;

    public RequirementController(
            RequirementService requirementService) {

        this.requirementService = requirementService;
    }

    @PostMapping(
            "/test-plans/{testPlanId}/requirements"
    )
    public ResponseEntity<RequirementResponse> create(
            @PathVariable String testPlanId,
            @Valid @RequestBody
            CreateRequirementRequest request) {

        Requirement requirement =
                requirementService.create(
                        testPlanId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(requirement));
    }

    @GetMapping(
            "/test-plans/{testPlanId}/requirements"
    )
    public ResponseEntity<List<RequirementResponse>>
    getByTestPlan(
            @PathVariable String testPlanId) {

        List<RequirementResponse> response =
                requirementService
                        .getByTestPlan(testPlanId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/requirements/{id}")
    public ResponseEntity<RequirementResponse>
    getById(
            @PathVariable Long id) {

        Requirement requirement =
                requirementService.getById(id);

        return ResponseEntity.ok(
                toResponse(requirement)
        );
    }

    @GetMapping(
            "/requirements/business/{requirementId}"
    )
    public ResponseEntity<RequirementResponse>
    getByRequirementId(
            @PathVariable String requirementId) {

        Requirement requirement =
                requirementService
                        .getByRequirementId(
                                requirementId
                        );

        return ResponseEntity.ok(
                toResponse(requirement)
        );
    }

    @PutMapping("/requirements/{id}")
    public ResponseEntity<RequirementResponse>
    update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateRequirementRequest request) {

        Requirement requirement =
                requirementService.update(
                        id,
                        request
                );

        return ResponseEntity.ok(
                toResponse(requirement)
        );
    }

    @DeleteMapping("/requirements/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        requirementService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private RequirementResponse toResponse(
            Requirement requirement) {

        RequirementResponse response =
                new RequirementResponse();

        response.setId(
                requirement.getId()
        );

        response.setRequirementId(
                requirement.getRequirementId()
        );

        response.setTestPlanId(
                requirement
                        .getTestPlan()
                        .getId()
        );

        response.setTestPlanBusinessId(
                requirement
                        .getTestPlan()
                        .getTestPlanId()
        );

        response.setDescription(
                requirement.getDescription()
        );

        response.setPriority(
                requirement.getPriority()
        );

        response.setStatus(
                requirement.getStatus()
        );


        response.setCreatedAt(
                requirement.getCreatedAt()
        );

        response.setUpdatedAt(
                requirement.getUpdatedAt()
        );

        return response;
    }
}