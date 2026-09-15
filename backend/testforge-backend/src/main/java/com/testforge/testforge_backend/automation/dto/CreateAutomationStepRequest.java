package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateAutomationStepRequest(

        @NotBlank(
                message =
                        "Automation step ID is required"
        )
        @Size(
                max = 50,
                message =
                        "Automation step ID must not exceed 50 characters"
        )
        String automationStepId,

        @NotNull(
                message =
                        "Source Test Step ID is required"
        )
        Long sourceTestStepId,

        @NotNull(
                message =
                        "Automation step order is required"
        )
        @Positive(
                message =
                        "Automation step order must be greater than zero"
        )
        Integer stepOrder,

        @NotNull(
                message =
                        "Automation action type is required"
        )
        AutomationActionType actionType,

        @Size(
                max = 500,
                message =
                        "Target must not exceed 500 characters"
        )
        String target,

        SelectorStrategy selectorStrategy,

        @Size(
                max = 2000,
                message =
                        "Selector value must not exceed 2000 characters"
        )
        String selectorValue,

        UiElementRole selectorRole,

        @Size(
                max = 500,
                message =
                        "Selector name must not exceed 500 characters"
        )
        String selectorName,

        boolean selectorExact,

        @Size(
                max = 4000,
                message =
                        "Input value must not exceed 4000 characters"
        )
        String inputValue,

        @Size(
                max = 4000,
                message =
                        "Expected value must not exceed 4000 characters"
        )
        String expectedValue,

        @Size(
                max = 16000,
                message =
                        "API configuration must not exceed 16000 characters"
        )
        String apiConfig
)  {
        public CreateAutomationStepRequest(
                String automationStepId, Long sourceTestStepId, Integer stepOrder,
                AutomationActionType actionType, String target, SelectorStrategy selectorStrategy,
                String selectorValue, UiElementRole selectorRole, String selectorName,
                boolean selectorExact, String inputValue, String expectedValue
        ) {
                this(automationStepId, sourceTestStepId, stepOrder, actionType, target,
                        selectorStrategy, selectorValue, selectorRole, selectorName, selectorExact,
                        inputValue, expectedValue, null);
        }
}
