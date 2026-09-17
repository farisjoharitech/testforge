package com.testforge.testforge_backend.testset.controller;

import com.testforge.testforge_backend.testset.dto.CreateTestSetRequest;
import com.testforge.testforge_backend.testset.dto.TestSetCandidateResponse;
import com.testforge.testforge_backend.testset.dto.TestSetResponse;
import com.testforge.testforge_backend.testset.dto.UpdateTestSetRequest;
import com.testforge.testforge_backend.testset.service.TestSetService;
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
@RequestMapping("/api/test-sets")
public class TestSetController {

    private final TestSetService testSetService;

    public TestSetController(TestSetService testSetService) {
        this.testSetService = testSetService;
    }

    @PostMapping
    public ResponseEntity<TestSetResponse> create(
            @Valid @RequestBody CreateTestSetRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(testSetService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<TestSetResponse>> getAll() {
        return ResponseEntity.ok(testSetService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestSetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(testSetService.getById(id));
    }

    @GetMapping("/test-plan/{testPlanId}")
    public ResponseEntity<List<TestSetResponse>> getByTestPlan(
            @PathVariable Long testPlanId
    ) {
        return ResponseEntity.ok(testSetService.getByTestPlan(testPlanId));
    }

    @GetMapping("/test-plan/{testPlanId}/candidates")
    public ResponseEntity<List<TestSetCandidateResponse>> getCandidates(
            @PathVariable Long testPlanId
    ) {
        return ResponseEntity.ok(testSetService.getCandidates(testPlanId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestSetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTestSetRequest request
    ) {
        return ResponseEntity.ok(testSetService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        testSetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
