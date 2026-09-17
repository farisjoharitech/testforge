package com.testforge.testforge_backend.cleanup.controller;

import com.testforge.testforge_backend.cleanup.dto.AuthoringDeleteImpactResponse;
import com.testforge.testforge_backend.cleanup.service.AuthoringDeleteImpactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthoringDeleteImpactController {

    private final AuthoringDeleteImpactService service;

    public AuthoringDeleteImpactController(AuthoringDeleteImpactService service) {
        this.service = service;
    }

    @GetMapping("/requirements/{id}/delete-impact")
    public ResponseEntity<AuthoringDeleteImpactResponse> requirementImpact(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequirementImpact(id));
    }

    @GetMapping("/scenarios/{id}/delete-impact")
    public ResponseEntity<AuthoringDeleteImpactResponse> scenarioImpact(@PathVariable Long id) {
        return ResponseEntity.ok(service.getScenarioImpact(id));
    }

    @GetMapping("/test-cases/{id}/delete-impact")
    public ResponseEntity<AuthoringDeleteImpactResponse> testCaseImpact(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTestCaseImpact(id));
    }
}
