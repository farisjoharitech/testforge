package com.testforge.testforge_backend.testset.dto;

import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;

public record TestSetMemberResponse(
        Long id,
        Long testCaseId,
        String testCaseBusinessId,
        String testCaseName,
        Long scenarioId,
        String scenarioBusinessId,
        AutomationType automationType,
        AutomationStatus automationStatus,
        Integer itemOrder
) {
}
