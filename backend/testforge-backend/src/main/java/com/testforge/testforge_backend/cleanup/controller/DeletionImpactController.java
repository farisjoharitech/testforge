package com.testforge.testforge_backend.cleanup.controller;

import com.testforge.testforge_backend.cleanup.dto.DeletionImpactResponse;
import com.testforge.testforge_backend.cleanup.service.DeletionImpactService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DeletionImpactController {
    private final DeletionImpactService service;
    public DeletionImpactController(DeletionImpactService service){this.service=service;}
    @GetMapping("/projects/{id}/deletion-impact") public DeletionImpactResponse project(@PathVariable Long id){return service.project(id);}
    @GetMapping("/test-plans/{id}/deletion-impact") public DeletionImpactResponse plan(@PathVariable Long id){return service.testPlan(id);}
    @GetMapping("/modules/{id}/deletion-impact") public DeletionImpactResponse module(@PathVariable Long id){return service.module(id);}
    @GetMapping("/requirements/{id}/deletion-impact") public DeletionImpactResponse requirement(@PathVariable Long id){return service.requirement(id);}
    @GetMapping("/scenarios/{id}/deletion-impact") public DeletionImpactResponse scenario(@PathVariable Long id){return service.scenario(id);}
    @GetMapping("/test-cases/{id}/deletion-impact") public DeletionImpactResponse testCase(@PathVariable Long id){return service.testCase(id);}
    @GetMapping("/test-steps/{id}/deletion-impact") public DeletionImpactResponse step(@PathVariable Long id){return service.testStep(id);}
    @GetMapping("/test-suites/{id}/deletion-impact") public DeletionImpactResponse suite(@PathVariable Long id){return service.testSuite(id);}
}
