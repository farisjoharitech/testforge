package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.dto.CreateTestStepRequest;
import com.testforge.testforge_backend.dto.TestStepResponse;
import com.testforge.testforge_backend.dto.UpdateTestStepRequest;
import com.testforge.testforge_backend.service.TestStepService;
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
public class TestStepController {

    private final TestStepService
            testStepService;

    public TestStepController(
            TestStepService testStepService) {

        this.testStepService =
                testStepService;
    }

    @PostMapping(
            "/test-cases/{testCaseId}/steps"
    )
    public ResponseEntity<TestStepResponse>
    create(
            @PathVariable String testCaseId,
            @Valid @RequestBody
            CreateTestStepRequest request) {

        TestStep testStep =
                testStepService.create(
                        testCaseId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(testStep));
    }

    @GetMapping(
            "/test-cases/{testCaseId}/steps"
    )
    public ResponseEntity<List<TestStepResponse>>
    getByTestCase(
            @PathVariable String testCaseId) {

        List<TestStepResponse> response =
                testStepService
                        .getByTestCase(
                                testCaseId
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(
                response
        );
    }

    @GetMapping(
            "/test-steps/{id}"
    )
    public ResponseEntity<TestStepResponse>
    getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                toResponse(
                        testStepService
                                .getById(id)
                )
        );
    }

    @GetMapping(
            "/test-steps/business/{testStepId}"
    )
    public ResponseEntity<TestStepResponse>
    getByTestStepId(
            @PathVariable String testStepId) {

        return ResponseEntity.ok(
                toResponse(
                        testStepService
                                .getByTestStepId(
                                        testStepId
                                )
                )
        );
    }

    @PutMapping(
            "/test-steps/{id}"
    )
    public ResponseEntity<TestStepResponse>
    update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateTestStepRequest request) {

        return ResponseEntity.ok(
                toResponse(
                        testStepService.update(
                                id,
                                request
                        )
                )
        );
    }

    @DeleteMapping(
            "/test-steps/{id}"
    )
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        testStepService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private TestStepResponse toResponse(
            TestStep testStep) {

        TestStepResponse response =
                new TestStepResponse();

        response.setId(
                testStep.getId()
        );

        response.setTestStepId(
                testStep.getTestStepId()
        );

        response.setTestCaseId(
                testStep
                        .getTestCase()
                        .getId()
        );

        response.setTestCaseBusinessId(
                testStep
                        .getTestCase()
                        .getTestCaseId()
        );

        response.setStepOrder(
                testStep.getStepOrder()
        );

        response.setAction(
                testStep.getAction()
        );

        response.setTarget(
                testStep.getTarget()
        );

        response.setInputValue(
                testStep.getInputValue()
        );

        response.setExpectedResult(
                testStep.getExpectedResult()
        );

        response.setCreatedAt(
                testStep.getCreatedAt()
        );

        response.setUpdatedAt(
                testStep.getUpdatedAt()
        );

        return response;
    }
}