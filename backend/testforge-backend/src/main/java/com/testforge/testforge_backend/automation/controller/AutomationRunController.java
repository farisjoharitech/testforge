package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.dto.CreateMultiTestCaseRunRequest;
import com.testforge.testforge_backend.automation.service.AutomationMultiRunService;
import com.testforge.testforge_backend.automation.service.AutomationRunService;
import com.testforge.testforge_backend.automation.service.AutomationRunEventStreamService;
import com.testforge.testforge_backend.automation.service.AutomationScenarioRunService;
import com.testforge.testforge_backend.automation.service.AutomationTestPlanRunService;
import com.testforge.testforge_backend.automation.service.AutomationTestSetRunService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/automation-runs")
public class AutomationRunController {

    private final AutomationRunService automationRunService;
    private final AutomationMultiRunService automationMultiRunService;
    private final AutomationScenarioRunService automationScenarioRunService;
    private final AutomationTestPlanRunService automationTestPlanRunService;
    private final AutomationTestSetRunService automationTestSetRunService;
    private final AutomationRunEventStreamService automationRunEventStreamService;

    public AutomationRunController(
            AutomationRunService automationRunService,
            AutomationMultiRunService automationMultiRunService,
            AutomationScenarioRunService automationScenarioRunService,
            AutomationTestPlanRunService automationTestPlanRunService,
            AutomationTestSetRunService automationTestSetRunService,
            AutomationRunEventStreamService automationRunEventStreamService
    ) {
        this.automationRunService = automationRunService;
        this.automationMultiRunService = automationMultiRunService;
        this.automationScenarioRunService = automationScenarioRunService;
        this.automationTestPlanRunService = automationTestPlanRunService;
        this.automationTestSetRunService = automationTestSetRunService;
        this.automationRunEventStreamService = automationRunEventStreamService;
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

    @PostMapping("/test-plan/{testPlanId}")
    public ResponseEntity<AutomationRunResponse> executeTestPlan(
            @PathVariable Long testPlanId
    ) {
        return ResponseEntity.accepted().body(
                automationTestPlanRunService.executeTestPlan(testPlanId)
        );
    }

    @PostMapping("/test-set/{testSetId}")
    public ResponseEntity<AutomationRunResponse> executeTestSet(
            @PathVariable Long testSetId
    ) {
        return ResponseEntity.accepted().body(
                automationTestSetRunService.executeTestSet(testSetId)
        );
    }

    @GetMapping("/{runId}")
    public ResponseEntity<AutomationRunResponse> getRun(@PathVariable Long runId) {
        return ResponseEntity.ok(automationRunService.getById(runId));
    }

    @GetMapping(value = "/{runId}/events", produces = "text/event-stream")
    public SseEmitter streamRunEvents(@PathVariable Long runId) {
        automationRunService.getById(runId);
        return automationRunEventStreamService.open(runId);
    }

    @GetMapping("/{runId}/executions")
    public ResponseEntity<List<AutomationExecutionResponse>> getRunExecutions(
            @PathVariable Long runId
    ) {
        return ResponseEntity.ok(automationRunService.getExecutions(runId));
    }
}
