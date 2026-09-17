package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.dto.CreateMultiTestCaseRunRequest;
import com.testforge.testforge_backend.automation.service.AutomationMultiRunService;
import com.testforge.testforge_backend.automation.service.AutomationRunService;
import com.testforge.testforge_backend.automation.service.AutomationScenarioRunService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/automation-runs")
public class AutomationRunController {

    private final AutomationRunService automationRunService;
    private final AutomationMultiRunService automationMultiRunService;
    private final AutomationScenarioRunService automationScenarioRunService;

    public AutomationRunController(
            AutomationRunService automationRunService,
            AutomationMultiRunService automationMultiRunService,
            AutomationScenarioRunService automationScenarioRunService
    ) {
        this.automationRunService = automationRunService;
        this.automationMultiRunService = automationMultiRunService;
        this.automationScenarioRunService = automationScenarioRunService;
    }

    @PostMapping("/multi-test-case")
    public ResponseEntity<AutomationRunResponse> executeMultipleTestCases(
            @Valid @RequestBody CreateMultiTestCaseRunRequest request
    ) {
        return ResponseEntity.accepted().body(
                automationMultiRunService.executeTestCases(request.testCaseIds())
        );
    }

    @PostMapping("/scenario/{scenarioId}")
    public ResponseEntity<AutomationRunResponse> executeScenario(
            @PathVariable Long scenarioId
    ) {
        return ResponseEntity.accepted().body(
                automationScenarioRunService.executeScenario(scenarioId)
        );
    }

    @GetMapping("/{runId}")
    public ResponseEntity<AutomationRunResponse> getRun(@PathVariable Long runId) {
        return ResponseEntity.ok(automationRunService.getById(runId));
    }

    @GetMapping("/{runId}/executions")
    public ResponseEntity<List<AutomationExecutionResponse>> getRunExecutions(
            @PathVariable Long runId
    ) {
        return ResponseEntity.ok(automationRunService.getExecutions(runId));
    }
}
