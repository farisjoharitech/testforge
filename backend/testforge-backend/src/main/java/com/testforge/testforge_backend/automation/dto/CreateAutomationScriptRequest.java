package com.testforge.testforge_backend.automation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAutomationScriptRequest(

        @NotBlank(
                message =
                        "Automation script ID is required"
        )
        @Size(
                max = 50,
                message =
                        "Automation script ID must not exceed 50 characters"
        )
        String automationScriptId,

        @NotBlank(
                message =
                        "Automation script name is required"
        )
        @Size(
                max = 255,
                message =
                        "Automation script name must not exceed 255 characters"
        )
        String name
) {
}