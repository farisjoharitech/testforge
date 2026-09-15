package com.testforge.testforge_backend.automation.dto;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateAutomationStepRequest(

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
        public UpdateAutomationStepRequest(
                Integer stepOrder, AutomationActionType actionType, String target,
                SelectorStrategy selectorStrategy, String selectorValue, UiElementRole selectorRole,
                String selectorName, boolean selectorExact, String inputValue, String expectedValue
        ) {
                this(stepOrder, actionType, target, selectorStrategy, selectorValue, selectorRole,
                        selectorName, selectorExact, inputValue, expectedValue, null);
        }
}
