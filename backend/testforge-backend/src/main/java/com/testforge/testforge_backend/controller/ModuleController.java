package com.testforge.testforge_backend.controller;

import com.testforge.testforge_backend.dto.*;
import com.testforge.testforge_backend.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ModuleController {
    private final ModuleService moduleService;
    public ModuleController(ModuleService moduleService) { this.moduleService = moduleService; }
    @PostMapping("/test-plans/{testPlanId}/modules")
    public ResponseEntity<ModuleResponse> create(@PathVariable String testPlanId, @Valid @RequestBody CreateModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.create(testPlanId, request));
    }
    @GetMapping("/test-plans/{testPlanId}/modules")
    public List<ModuleResponse> getByTestPlan(@PathVariable String testPlanId) {
        return moduleService.getByTestPlan(testPlanId);
    }
    @GetMapping("/modules/{id}")
    public ModuleResponse getById(@PathVariable Long id) { return moduleService.getById(id); }
    @GetMapping("/modules/business/{moduleId}")
    public ModuleResponse getByBusinessId(@PathVariable String moduleId) { return moduleService.getByModuleId(moduleId); }
    @PutMapping("/modules/{id}")
    public ModuleResponse update(@PathVariable Long id, @Valid @RequestBody UpdateModuleRequest request) {
        return moduleService.update(id, request);
    }
    @DeleteMapping("/modules/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { moduleService.delete(id); return ResponseEntity.noContent().build(); }
}
