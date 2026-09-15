package com.testforge.testforge_backend.monitoringdrilldown.controller;

import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownResponse;
import com.testforge.testforge_backend.monitoringdrilldown.dto.MonitoringDrilldownStatus;
import com.testforge.testforge_backend.monitoringdrilldown.service.MonitoringDrilldownService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MonitoringDrilldownController {

    private final MonitoringDrilldownService monitoringDrilldownService;

    public MonitoringDrilldownController(
            MonitoringDrilldownService monitoringDrilldownService
    ) {
        this.monitoringDrilldownService = monitoringDrilldownService;
    }

    @GetMapping("/projects/{projectId}/monitoring/test-cases")
    public ResponseEntity<MonitoringDrilldownResponse> getProjectDrilldown(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "ALL") MonitoringDrilldownStatus status
    ) {
        return ResponseEntity.ok(
                monitoringDrilldownService.getProjectDrilldown(projectId, status)
        );
    }

    @GetMapping("/test-plans/{testPlanId}/monitoring/test-cases")
    public ResponseEntity<MonitoringDrilldownResponse> getTestPlanDrilldown(
            @PathVariable String testPlanId,
            @RequestParam(defaultValue = "ALL") MonitoringDrilldownStatus status
    ) {
        return ResponseEntity.ok(
                monitoringDrilldownService.getTestPlanDrilldown(testPlanId, status)
        );
    }

    @GetMapping("/requirements/{requirementId}/monitoring/test-cases")
    public ResponseEntity<MonitoringDrilldownResponse> getRequirementDrilldown(
            @PathVariable String requirementId,
            @RequestParam(defaultValue = "ALL") MonitoringDrilldownStatus status
    ) {
        return ResponseEntity.ok(
                monitoringDrilldownService.getRequirementDrilldown(requirementId, status)
        );
    }
}
