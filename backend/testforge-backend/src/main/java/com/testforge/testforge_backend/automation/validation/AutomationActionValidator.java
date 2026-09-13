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

        validateStepOrder(
                action
        );

        if (action.getActionType() == null) {
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
                        "WAIT requires a wait value in milliseconds"
                );
            }

            case ASSERT_VISIBLE,
                 ASSERT_HIDDEN -> {
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

            case API_GET,
                 API_POST,
                 API_PUT,
                 API_PATCH,
                 API_DELETE -> {

                requireNoSelector(action);

                requireTarget(
                        action,
                        action.getActionType()
                                + " requires a request URL"
                );
            }

            case ASSERT_API_STATUS -> {

                requireNoSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_API_STATUS requires an expected HTTP status"
                );
            }

            case ASSERT_API_BODY_CONTAINS -> {

                requireNoSelector(action);

                requireExpectedValue(
                        action,
                        "ASSERT_API_BODY_CONTAINS requires an expected body value"
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

        if (strategy == SelectorStrategy.ROLE) {

            if (selector.getRole() == null) {
                throw new AutomationValidationException(
                        "ROLE selector requires a UI element role"
                );
            }

            if (isBlank(selector.getName())) {
                throw new AutomationValidationException(
                        "ROLE selector requires an accessible name"
                );
            }

            return;
        }

        if (isBlank(selector.getValue())) {
            throw new AutomationValidationException(
                    strategy
                            + " selector requires a selector value"
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

        if (isBlank(action.getValue())) {
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

    private void requireTarget(
            NormalizedAutomationAction action,
            String message
    ) {

        if (isBlank(
                action.getTarget()
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