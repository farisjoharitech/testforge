package com.testforge.testforge_backend.automation.controller;

import com.testforge.testforge_backend.automation.dto.AutomationResultResponse;
import com.testforge.testforge_backend.automation.dto.AutomationResultSummaryResponse;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.automation.service.AutomationArtifactService;
import com.testforge.testforge_backend.automation.service.AutomationResultService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AutomationResultController {

    private final AutomationResultService
            automationResultService;

    private final AutomationArtifactService
            automationArtifactService;

    public AutomationResultController(
            AutomationResultService automationResultService,
            AutomationArtifactService automationArtifactService
    ) {

        this.automationResultService =
                automationResultService;

        this.automationArtifactService =
                automationArtifactService;
    }

    /*
     * GET
     * /api/automation-results
     *
     * Optional:
     * ?status=PASSED
     * ?status=FAILED
     * ?status=TIMED_OUT
     * ?status=ERROR
     */
    @GetMapping("/automation-results")
    public ResponseEntity<
            List<AutomationResultSummaryResponse>
            > getAllResults(
            @RequestParam(
                    required = false
            )
            AutomationExecutionStatus status
    ) {

        return ResponseEntity.ok(
                automationResultService
                        .getAllResults(
                                status
                        )
        );
    }

    /*
     * GET
     * /api/automation-results/{executionId}
     */
    @GetMapping(
            "/automation-results/{executionId}"
    )
    public ResponseEntity<AutomationResultResponse>
    getResult(
            @PathVariable
            String executionId
    ) {

        return ResponseEntity.ok(
                automationResultService
                        .getResult(
                                executionId
                        )
        );
    }

    /*
     * GET
     * /api/automation-results/{executionId}/artifacts/{artifactType}
     *
     * artifactType:
     * screenshot | trace | log
     */
    @GetMapping(
            "/automation-results/{executionId}/artifacts/{artifactType}"
    )
    public ResponseEntity<Resource> getArtifact(
            @PathVariable String executionId,
            @PathVariable String artifactType
    ) {

        AutomationArtifactService.ArtifactDownload artifact =
                automationArtifactService.getArtifact(
                        executionId,
                        artifactType
                );

        ContentDisposition disposition =
                artifact.inline()
                        ? ContentDisposition.inline()
                                .filename(artifact.filename())
                                .build()
                        : ContentDisposition.attachment()
                                .filename(artifact.filename())
                                .build();

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                artifact.contentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .body(
                        artifact.resource()
                );
    }

    /*
     * GET
     * /api/automation-scripts/{scriptId}/results
     */
    @GetMapping(
            "/automation-scripts/{scriptId}/results"
    )
    public ResponseEntity<
            List<AutomationResultSummaryResponse>
            > getResultsByAutomationScript(
            @PathVariable
            Long scriptId
    ) {

        return ResponseEntity.ok(
                automationResultService
                        .getResultsByAutomationScript(
                                scriptId
                        )
        );
    }

    /*
     * GET
     * /api/test-cases/{testCaseId}/automation-results
     */
    @GetMapping(
            "/test-cases/{testCaseId}/automation-results"
    )
    public ResponseEntity<
            List<AutomationResultSummaryResponse>
            > getResultsByTestCase(
            @PathVariable
            Long testCaseId
    ) {

        return ResponseEntity.ok(
                automationResultService
                        .getResultsByTestCase(
                                testCaseId
                        )
        );
    }
}