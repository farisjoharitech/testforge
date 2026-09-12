package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.service.TestPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<TestPlan> create(@RequestBody TestPlan testPlan) {
        TestPlan createdTestPlan = testPlanService.create(testPlan);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTestPlan);
    }

    @GetMapping
    public ResponseEntity<List<TestPlan>> getAll() {
        return ResponseEntity.ok(testPlanService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestPlan> getById(@PathVariable Long id) {
        return ResponseEntity.ok(testPlanService.getById(id));
    }

    @GetMapping("/business/{testPlanId}")
    public ResponseEntity<TestPlan> getByTestPlanId(
            @PathVariable String testPlanId) {

        return ResponseEntity.ok(
                testPlanService.getByTestPlanId(testPlanId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        testPlanService.delete(id);

        return ResponseEntity.noContent().build();
    }
}