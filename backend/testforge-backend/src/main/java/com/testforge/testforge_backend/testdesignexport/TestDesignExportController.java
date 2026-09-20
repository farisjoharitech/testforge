package com.testforge.testforge_backend.testdesignexport;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/test-design")
public class TestDesignExportController {
    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private final TestDesignExportService service;

    public TestDesignExportController(TestDesignExportService service) {
        this.service = service;
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "PROJECT") TestDesignExportScope scope,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) String moduleId) {
        TestDesignExportService.ExportedWorkbook exported = service.export(projectId, scope, testPlanId, moduleId);
        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(exported.fileName()).build().toString())
                .body(exported.content());
    }
}
