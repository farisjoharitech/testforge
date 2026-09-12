package com.testforge.testforge_backend.automation.validation;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.automation.model.NormalizedSelector;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import org.springframework.stereotype.Component;

@Component
public class AutomationActionValidator {

    public void validate(
            NormalizedAutomationAction action
    ) {

        if (action == null) {
            throw new IllegalArgumentException(
                    "Automation action must not be null"
            );
        }

        validateStepOrder(action);

        AutomationActionType actionType =
                action.getActionType();

        if (actionType == null) {
            throw new AutomationValidationException(
                    "Automation action type is required"
            );
        }

        validateActionRequirements(
                action
        );

        if (action.getSelector() != null) {
            validateSelector(
                    action.getSelector()
            );
        }
    }

    private void validateStepOrder(
            NormalizedAutomationAction action
    ) {

        if (action.getStepOrder() == null) {
            throw new AutomationValidationException(
                    "Automation step order is required"
            );
        }

        if (action.getStepOrder() < 1) {
            throw new AutomationValidationException(
                    "Automation step order must be greater than zero"
            );
        }
    }

    private void validateActionRequirements(
            NormalizedAutomationAction action
    ) {

        switch (action.getActionType()) {

            case NAVIGATE -> {
                requireNoSelector(action);
                requireValue(
                        action,
                        "NAVIGATE requires a URL or navigation value"
                );
            }

            case CLICK -> {
                requireSelector(action);
            }

            case FILL -> {
                requireSelector(action);

                requireValue(
                        action,
                        "FILL requires an input value"
                );
            }

            case SELECT -> {
                requireSelector(action);

                requireValue(
                        action,
                        "SELECT requires an option value"
                );
            }

            case CHECK -> {
                requireSelector(action);
            }

            case UNCHECK -> {
                requireSelector(action);
            }

            case PRESS -> {
                requireSelector(action);

                requireValue(
                        action,
                        "PRESS requires a keyboard key value"
                );
            }

            case WAIT -> {
                requireNoSelector(action);

                requireValue(
                        action,
                        "WAIT requires a wait value or condition"
                );
            }

            case ASSERT_VISIBLE -> {
                requireSelector(action);
            }

            case ASSERT_HIDDEN -> {
                requireSelector(action);
            }

            case ASSERT_TEXT -> {
                requireSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_TEXT requires an expected value"
                );
            }

            case ASSERT_VALUE -> {
                requireSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_VALUE requires an expected value"
                );
            }

            case ASSERT_URL -> {
                requireNoSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_URL requires an expected URL"
                );
            }

            case ASSERT_TITLE -> {
                requireNoSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_TITLE requires an expected title"
                );
            }
        }
    }

    private void validateSelector(
            NormalizedSelector selector
    ) {

        SelectorStrategy strategy =
                selector.getStrategy();

        if (strategy == null) {
            throw new AutomationValidationException(
                    "Selector strategy is required"
            );
        }

        switch (strategy) {

            case ROLE -> validateRoleSelector(
                    selector
            );

            case LABEL,
                 PLACEHOLDER,
                 TEXT,
                 TEST_ID,
                 CSS,
                 XPATH ->
                    validateValueSelector(
                            selector
                    );
        }
    }

    private void validateRoleSelector(
            NormalizedSelector selector
    ) {

        if (selector.getRole() == null) {
            throw new AutomationValidationException(
                    "ROLE selector requires an element role"
            );
        }

        if (isBlank(
                selector.getName()
        )) {
            throw new AutomationValidationException(
                    "ROLE selector requires an accessible name"
            );
        }

        if (!isBlank(
                selector.getValue()
        )) {
            throw new AutomationValidationException(
                    "ROLE selector must use role and name instead of selector value"
            );
        }
    }

    private void validateValueSelector(
            NormalizedSelector selector
    ) {

        if (isBlank(
                selector.getValue()
        )) {
            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector requires a selector value"
            );
        }

        if (selector.getRole() != null) {
            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector must not define an element role"
            );
        }

        if (!isBlank(
                selector.getName()
        )) {
            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector must not define a role name"
            );
        }
    }

    private void requireSelector(
            NormalizedAutomationAction action
    ) {

        if (action.getSelector() == null) {
            throw new AutomationValidationException(
                    action.getActionType()
                            + " requires a selector"
            );
        }
    }

    private void requireNoSelector(
            NormalizedAutomationAction action
    ) {

        if (action.getSelector() != null) {
            throw new AutomationValidationException(
                    action.getActionType()
                            + " must not have a selector"
            );
        }
    }

    private void requireValue(
            NormalizedAutomationAction action,
            String message
    ) {

        if (isBlank(
                action.getValue()
        )) {
            throw new AutomationValidationException(
                    message
            );
        }
    }

    private void requireExpectedValue(
            NormalizedAutomationAction action,
            String message
    ) {

        if (isBlank(
                action.getExpectedValue()
        )) {
            throw new AutomationValidationException(
                    message
            );
        }
    }

    private boolean isBlank(
            String value
    ) {

        return value == null
                || value.isBlank();
    }
}