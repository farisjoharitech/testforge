package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.dto.CreateTestPlanRequest;
import com.testforge.testforge_backend.dto.TestPlanResponse;
import com.testforge.testforge_backend.dto.UpdateTestPlanRequest;
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
@RequestMapping("/api/test-plans")
public class TestPlanController {

    private final TestPlanService testPlanService;

    public TestPlanController(TestPlanService testPlanService) {
        this.testPlanService = testPlanService;
    }

    @PostMapping
    public ResponseEntity<TestPlanResponse> create(
            @Valid @RequestBody CreateTestPlanRequest request) {

        TestPlan createdTestPlan = testPlanService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(createdTestPlan));
    }

    @GetMapping
    public ResponseEntity<List<TestPlanResponse>> getAll() {

        List<TestPlanResponse> response = testPlanService.getAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestPlanResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                toResponse(testPlanService.getById(id))
        );
    }

    @GetMapping("/business/{testPlanId}")
    public ResponseEntity<TestPlanResponse> getByTestPlanId(
            @PathVariable String testPlanId) {

        return ResponseEntity.ok(
                toResponse(
                        testPlanService.getByTestPlanId(testPlanId)
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestPlanResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTestPlanRequest request) {

        TestPlan updatedTestPlan =
                testPlanService.update(id, request);

        return ResponseEntity.ok(
                toResponse(updatedTestPlan)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        testPlanService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private TestPlanResponse toResponse(TestPlan testPlan) {

        TestPlanResponse response = new TestPlanResponse();

        response.setId(testPlan.getId());
        response.setTestPlanId(testPlan.getTestPlanId());
        response.setName(testPlan.getName());
        response.setVersion(testPlan.getVersion());
        response.setProject(testPlan.getProject());
        response.setApplication(testPlan.getApplication());
        response.setEnvironment(testPlan.getEnvironment());
        response.setPreparedBy(testPlan.getPreparedBy());
        response.setStatus(testPlan.getStatus());
        response.setApprovalStatus(testPlan.getApprovalStatus());
        response.setCreatedAt(testPlan.getCreatedAt());
        response.setUpdatedAt(testPlan.getUpdatedAt());

        return response;
    }
}