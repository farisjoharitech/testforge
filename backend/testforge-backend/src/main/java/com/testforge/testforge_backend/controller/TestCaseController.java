package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.dto.CreateTestCaseRequest;
import com.testforge.testforge_backend.dto.TestCaseResponse;
import com.testforge.testforge_backend.dto.UpdateTestCaseRequest;
import com.testforge.testforge_backend.service.TestCaseService;
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
public class TestCaseController {

    private final TestCaseService
            testCaseService;

    public TestCaseController(
            TestCaseService testCaseService) {

        this.testCaseService =
                testCaseService;
    }

    @PostMapping(
            "/scenarios/{scenarioId}/test-cases"
    )
    public ResponseEntity<TestCaseResponse>
    create(
            @PathVariable String scenarioId,
            @Valid @RequestBody
            CreateTestCaseRequest request) {

        TestCase testCase =
                testCaseService.create(
                        scenarioId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(testCase));
    }

    @GetMapping(
            "/scenarios/{scenarioId}/test-cases"
    )
    public ResponseEntity<List<TestCaseResponse>>
    getByScenario(
            @PathVariable String scenarioId) {

        List<TestCaseResponse> response =
                testCaseService
                        .getByScenario(
                                scenarioId
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    /*
     * Task 36.8
     *
     * Return only Test Cases that are eligible
     * for automation.
     *
     * Eligibility is determined by:
     *
     * automatable = true
     *
     * Repository already loads testScenario
     * using @EntityGraph so toResponse() can
     * safely access scenario information.
     */
    @GetMapping(
            "/test-cases/automation-eligible"
    )
    public ResponseEntity<List<TestCaseResponse>>
    getAutomationEligible() {

        List<TestCaseResponse> response =
                testCaseService
                        .getAutomationEligible()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-cases/{id}")
    public ResponseEntity<TestCaseResponse>
    getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                toResponse(
                        testCaseService
                                .getById(id)
                )
        );
    }

    @GetMapping(
            "/test-cases/business/{testCaseId}"
    )
    public ResponseEntity<TestCaseResponse>
    getByTestCaseId(
            @PathVariable String testCaseId) {

        return ResponseEntity.ok(
                toResponse(
                        testCaseService
                                .getByTestCaseId(
                                        testCaseId
                                )
                )
        );
    }

    @PutMapping("/test-cases/{id}")
    public ResponseEntity<TestCaseResponse>
    update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateTestCaseRequest request) {

        return ResponseEntity.ok(
                toResponse(
                        testCaseService.update(
                                id,
                                request
                        )
                )
        );
    }

    @DeleteMapping("/test-cases/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        testCaseService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private TestCaseResponse toResponse(
            TestCase testCase) {

        TestCaseResponse response =
                new TestCaseResponse();

        response.setId(
                testCase.getId()
        );

        response.setTestCaseId(
                testCase.getTestCaseId()
        );

        response.setScenarioId(
                testCase
                        .getTestScenario()
                        .getId()
        );

        response.setScenarioBusinessId(
                testCase
                        .getTestScenario()
                        .getScenarioId()
        );

        response.setName(
                testCase.getName()
        );

        response.setPreconditions(
                testCase.getPreconditions()
        );

        response.setTestData(
                testCase.getTestData()
        );

        response.setExpectedResult(
                testCase.getExpectedResult()
        );

        response.setPriority(
                testCase.getPriority()
        );

        response.setTestType(
                testCase.getTestType()
        );

        response.setAutomatable(
                testCase.isAutomatable()
        );

        response.setAutomationType(
                testCase.getAutomationType()
        );

        response.setAutomationStatus(
                testCase.getAutomationStatus()
        );

        response.setStatus(
                testCase.getStatus()
        );

        response.setCreatedAt(
                testCase.getCreatedAt()
        );

        response.setUpdatedAt(
                testCase.getUpdatedAt()
        );

        return response;
    }
}