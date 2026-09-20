package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.automation.dto.UpdateAutomationStepRequest;
import jakarta.validation.Valid;

/** Null change means preserve configuration; removal must be explicitly confirmed. */
public record TestStepAutomationChange(
        @Valid UpdateAutomationStepRequest configuration,
        boolean removeExisting,
        Long expectedAutomationStepId) {}
