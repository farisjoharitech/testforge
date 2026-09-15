package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;

import java.time.LocalDateTime;

public record AutomationStepResponse(

        Long id,

        String automationStepId,

        Long automationScriptId,

        Long sourceTestStepId,

        Integer stepOrder,

        AutomationActionType actionType,

        String target,

        SelectorStrategy selectorStrategy,

        String selectorValue,

        UiElementRole selectorRole,

        String selectorName,

        boolean selectorExact,

        String inputValue,

        String expectedValue,

        String apiConfig,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
)  {
    public AutomationStepResponse(
            Long id, String automationStepId, Long automationScriptId, Long sourceTestStepId,
            Integer stepOrder, AutomationActionType actionType, String target,
            SelectorStrategy selectorStrategy, String selectorValue, UiElementRole selectorRole,
            String selectorName, boolean selectorExact, String inputValue, String expectedValue,
            LocalDateTime createdAt, LocalDateTime updatedAt
    ) {
        this(id, automationStepId, automationScriptId, sourceTestStepId, stepOrder, actionType,
                target, selectorStrategy, selectorValue, selectorRole, selectorName, selectorExact,
                inputValue, expectedValue, null, createdAt, updatedAt);
    }
}
