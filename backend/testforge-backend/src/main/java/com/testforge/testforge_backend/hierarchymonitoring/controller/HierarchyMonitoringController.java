package com.testforge.testforge_backend.hierarchymonitoring.controller;

import com.testforge.testforge_backend.hierarchymonitoring.dto.RequirementMonitoringResponse;
import com.testforge.testforge_backend.hierarchymonitoring.dto.TestPlanMonitoringResponse;
import com.testforge.testforge_backend.hierarchymonitoring.service.HierarchyMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HierarchyMonitoringController {

    private final HierarchyMonitoringService hierarchyMonitoringService;

    public HierarchyMonitoringController(
            HierarchyMonitoringService hierarchyMonitoringService
    ) {
        this.hierarchyMonitoringService = hierarchyMonitoringService;
    }

    @GetMapping("/test-plans/{testPlanId}/monitoring")
    public ResponseEntity<TestPlanMonitoringResponse> getTestPlanMonitoring(
            @PathVariable String testPlanId
    ) {
        return ResponseEntity.ok(
                hierarchyMonitoringService.getTestPlanMonitoring(testPlanId)
        );
    }

    @GetMapping("/requirements/{requirementId}/monitoring")
    public ResponseEntity<RequirementMonitoringResponse> getRequirementMonitoring(
            @PathVariable String requirementId
    ) {
        return ResponseEntity.ok(
                hierarchyMonitoringService.getRequirementMonitoring(requirementId)
        );
    }
}
