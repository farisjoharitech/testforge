package com.testforge.testforge_backend.projectmonitoring.controller;

import com.testforge.testforge_backend.projectmonitoring.dto.ProjectMonitoringResponse;
import com.testforge.testforge_backend.projectmonitoring.service.ProjectMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectMonitoringController {

    private final ProjectMonitoringService projectMonitoringService;

    public ProjectMonitoringController(
            ProjectMonitoringService projectMonitoringService
    ) {
        this.projectMonitoringService = projectMonitoringService;
    }

    @GetMapping("/{projectId}/monitoring")
    public ResponseEntity<ProjectMonitoringResponse> getMonitoring(
            @PathVariable
            String projectId
    ) {
        return ResponseEntity.ok(
                projectMonitoringService.getMonitoring(
                        projectId
                )
        );
    }
}
