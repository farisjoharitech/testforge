package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.dto.CreateTestScenarioRequest;
import com.testforge.testforge_backend.dto.TestScenarioResponse;
import com.testforge.testforge_backend.dto.UpdateTestScenarioRequest;
import com.testforge.testforge_backend.service.TestScenarioService;
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
public class TestScenarioController {

    private final TestScenarioService
            testScenarioService;

    public TestScenarioController(
            TestScenarioService testScenarioService) {

        this.testScenarioService =
                testScenarioService;
    }

    @PostMapping(
            "/requirements/{requirementId}/scenarios"
    )
    public ResponseEntity<TestScenarioResponse>
    create(
            @PathVariable String requirementId,
            @Valid @RequestBody
            CreateTestScenarioRequest request) {

        TestScenario scenario =
                testScenarioService.create(
                        requirementId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(scenario));
    }

    @GetMapping(
            "/requirements/{requirementId}/scenarios"
    )
    public ResponseEntity<List<TestScenarioResponse>>
    getByRequirement(
            @PathVariable String requirementId) {

        List<TestScenarioResponse> response =
                testScenarioService
                        .getByRequirement(
                                requirementId
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/scenarios/{id}")
    public ResponseEntity<TestScenarioResponse>
    getById(
            @PathVariable Long id) {

        TestScenario scenario =
                testScenarioService
                        .getById(id);

        return ResponseEntity.ok(
                toResponse(scenario)
        );
    }

    @GetMapping(
            "/scenarios/business/{scenarioId}"
    )
    public ResponseEntity<TestScenarioResponse>
    getByScenarioId(
            @PathVariable String scenarioId) {

        TestScenario scenario =
                testScenarioService
                        .getByScenarioId(
                                scenarioId
                        );

        return ResponseEntity.ok(
                toResponse(scenario)
        );
    }

    @PutMapping("/scenarios/{id}")
    public ResponseEntity<TestScenarioResponse>
    update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateTestScenarioRequest request) {

        TestScenario scenario =
                testScenarioService.update(
                        id,
                        request
                );

        return ResponseEntity.ok(
                toResponse(scenario)
        );
    }

    @DeleteMapping("/scenarios/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        testScenarioService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private TestScenarioResponse toResponse(
            TestScenario scenario) {

        TestScenarioResponse response =
                new TestScenarioResponse();

        response.setId(
                scenario.getId()
        );

        response.setScenarioId(
                scenario.getScenarioId()
        );

        response.setRequirementId(
                scenario
                        .getRequirement()
                        .getId()
        );

        response.setRequirementBusinessId(
                scenario
                        .getRequirement()
                        .getRequirementId()
        );

        response.setDescription(
                scenario.getDescription()
        );

        response.setTestType(
                scenario.getTestType()
        );

        response.setAutomatable(
                scenario.isAutomatable()
        );

        response.setPriority(
                scenario.getPriority()
        );

        response.setStatus(
                scenario.getStatus()
        );

        response.setCreatedAt(
                scenario.getCreatedAt()
        );

        response.setUpdatedAt(
                scenario.getUpdatedAt()
        );

        return response;
    }
}