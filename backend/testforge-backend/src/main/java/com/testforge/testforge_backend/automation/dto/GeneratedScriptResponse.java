package com.testforge.testforge_backend.automation.dto;

import java.time.LocalDateTime;

public record GeneratedScriptResponse(

        Long automationScriptId,

        String automationScriptBusinessId,

        Long testCaseId,

        String className,

        String language,

        String framework,

        String source,

        Integer generatedStepCount,

        LocalDateTime generatedAt,

        boolean stale
) {
}