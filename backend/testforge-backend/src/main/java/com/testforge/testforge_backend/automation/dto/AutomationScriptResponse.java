package com.testforge.testforge_backend.automation.dto;

import java.time.LocalDateTime;

public record AutomationScriptResponse(

        Long id,

        String automationScriptId,

        Long testCaseId,

        String name,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}