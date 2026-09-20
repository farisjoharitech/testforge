package com.testforge.testforge_backend.gitintegration.controller;

import com.testforge.testforge_backend.gitintegration.dto.*;
import com.testforge.testforge_backend.gitintegration.service.GitIntegrationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/projects/{projectId}/git-integration")
public class GitIntegrationController {
    private final GitIntegrationService service; public GitIntegrationController(GitIntegrationService service){this.service=service;}
    @GetMapping public GitConfigurationResponse get(@PathVariable String projectId){return service.get(projectId);}
    @PutMapping public GitConfigurationResponse save(@PathVariable String projectId,@Valid @RequestBody GitConfigurationRequest request){return service.save(projectId,request);}
    @PostMapping("/test-connection") public GitConnectionResponse test(@PathVariable String projectId){return service.testConnection(projectId);}
    @GetMapping("/changes") public GitChangeResponse changes(@PathVariable String projectId){return service.changes(projectId);}
    @PostMapping("/sync") public GitSyncResponse sync(@PathVariable String projectId,@Valid @RequestBody GitSyncRequest request){return service.sync(projectId,request);}
}
