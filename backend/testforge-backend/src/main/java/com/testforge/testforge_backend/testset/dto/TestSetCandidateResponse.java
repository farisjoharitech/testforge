package com.testforge.testforge_backend.testset.dto;

import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;

public record TestSetCandidateResponse(
        Long id,
        String testCaseId,
        String name,
        Long scenarioId,
        String scenarioBusinessId,
        AutomationType automationType,
        AutomationStatus automationStatus
) {
}
