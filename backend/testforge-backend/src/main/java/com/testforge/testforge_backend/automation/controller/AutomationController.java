package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationScriptResponse;
import com.testforge.testforge_backend.automation.dto.AutomationStepResponse;
import com.testforge.testforge_backend.automation.dto.CreateAutomationScriptRequest;
import com.testforge.testforge_backend.automation.dto.CreateAutomationStepRequest;
import com.testforge.testforge_backend.automation.dto.UpdateAutomationStepRequest;
import com.testforge.testforge_backend.automation.service.AutomationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AutomationController {

    private final AutomationService automationService;

    public AutomationController(
            AutomationService automationService
    ) {
        this.automationService =
                automationService;
    }

    @PostMapping(
            "/test-cases/{testCaseId}/automation-script"
    )
    public ResponseEntity<AutomationScriptResponse>
    createAutomationScript(
            @PathVariable Long testCaseId,
            @Valid
            @RequestBody
            CreateAutomationScriptRequest request
    ) {

        AutomationScriptResponse response =
                automationService.createScript(
                        testCaseId,
                        request
                );

        URI location =
                URI.create(
                        "/api/automation-scripts/"
                                + response.id()
                );

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping(
            "/test-cases/{testCaseId}/automation-script"
    )
    public ResponseEntity<AutomationScriptResponse>
    getAutomationScriptByTestCase(
            @PathVariable Long testCaseId
    ) {

        AutomationScriptResponse response =
                automationService.getScriptByTestCase(
                        testCaseId
                );

        return ResponseEntity.ok(
                response
        );
    }

    @GetMapping(
            "/automation-scripts/{scriptId}"
    )
    public ResponseEntity<AutomationScriptResponse>
    getAutomationScript(
            @PathVariable Long scriptId
    ) {

        AutomationScriptResponse response =
                automationService.getScript(
                        scriptId
                );

        return ResponseEntity.ok(
                response
        );
    }

    @PostMapping(
            "/automation-scripts/{scriptId}/steps"
    )
    public ResponseEntity<AutomationStepResponse>
    createAutomationStep(
            @PathVariable Long scriptId,
            @Valid
            @RequestBody
            CreateAutomationStepRequest request
    ) {

        AutomationStepResponse response =
                automationService.createStep(
                        scriptId,
                        request
                );

        URI location =
                URI.create(
                        "/api/automation-steps/"
                                + response.id()
                );

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping(
            "/automation-scripts/{scriptId}/steps"
    )
    public ResponseEntity<List<AutomationStepResponse>>
    getAutomationSteps(
            @PathVariable Long scriptId
    ) {

        List<AutomationStepResponse> response =
                automationService.getSteps(
                        scriptId
                );

        return ResponseEntity.ok(
                response
        );
    }

    @GetMapping(
            "/automation-steps/{stepId}"
    )
    public ResponseEntity<AutomationStepResponse>
    getAutomationStep(
            @PathVariable Long stepId
    ) {

        AutomationStepResponse response =
                automationService.getStep(
                        stepId
                );

        return ResponseEntity.ok(
                response
        );
    }

    @PutMapping(
            "/automation-steps/{stepId}"
    )
    public ResponseEntity<AutomationStepResponse>
    updateAutomationStep(
            @PathVariable Long stepId,
            @Valid
            @RequestBody
            UpdateAutomationStepRequest request
    ) {

        AutomationStepResponse response =
                automationService.updateStep(
                        stepId,
                        request
                );

        return ResponseEntity.ok(
                response
        );
    }

    @DeleteMapping(
            "/automation-steps/{stepId}"
    )
    public ResponseEntity<Void>
    deleteAutomationStep(
            @PathVariable Long stepId
    ) {

        automationService.deleteStep(
                stepId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}