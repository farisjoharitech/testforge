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

        /*
         * Selector structure is validated
         * only when a selector exists.
         *
         * Actions that require selectors
         * are checked inside
         * validateActionRequirements().
         */
        if (
                action.getSelector()
                        != null
        ) {

            validateSelector(
                    action.getSelector()
            );
        }
    }

    /*
     * =========================================================
     * STEP ORDER
     * =========================================================
     */

    private void validateStepOrder(
            NormalizedAutomationAction action
    ) {

        if (
                action.getStepOrder()
                        == null
        ) {

            throw new AutomationValidationException(
                    "Automation step order is required"
            );
        }

        if (
                action.getStepOrder()
                        < 1
        ) {

            throw new AutomationValidationException(
                    "Automation step order must be greater than zero"
            );
        }
    }

    /*
     * =========================================================
     * ACTION VALIDATION
     * =========================================================
     */

    private void validateActionRequirements(
            NormalizedAutomationAction action
    ) {

        switch (
                action.getActionType()
        ) {

            /*
             * =================================================
             * UI ACTIONS
             * =================================================
             */

            case NAVIGATE -> {

                requireNoSelector(
                        action
                );

                requireValue(
                        action,
                        "NAVIGATE requires a URL or navigation value"
                );
            }

            case CLICK -> {

                requireSelector(
                        action
                );
            }

            case FILL -> {

                requireSelector(
                        action
                );

                requireValue(
                        action,
                        "FILL requires an input value"
                );
            }

            case SELECT -> {

                requireSelector(
                        action
                );

                requireValue(
                        action,
                        "SELECT requires an option value"
                );
            }

            case CHECK -> {

                requireSelector(
                        action
                );
            }

            case UNCHECK -> {

                requireSelector(
                        action
                );
            }

            case PRESS -> {

                requireSelector(
                        action
                );

                requireValue(
                        action,
                        "PRESS requires a keyboard key value"
                );
            }

            case WAIT -> {

                requireNoSelector(
                        action
                );

                requireValue(
                        action,
                        "WAIT requires a wait value or condition"
                );

                validateWaitValue(
                        action
                );
            }

            /*
             * =================================================
             * UI ASSERTIONS
             * =================================================
             */

            case ASSERT_VISIBLE -> {

                requireSelector(
                        action
                );
            }

            case ASSERT_HIDDEN -> {

                requireSelector(
                        action
                );
            }

            case ASSERT_TEXT -> {

                requireSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_TEXT requires an expected value"
                );
            }

            case ASSERT_VALUE -> {

                requireSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_VALUE requires an expected value"
                );
            }

            case ASSERT_URL -> {

                requireNoSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_URL requires an expected URL"
                );
            }

            case ASSERT_TITLE -> {

                requireNoSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_TITLE requires an expected title"
                );
            }

            /*
             * =================================================
             * API REQUEST ACTIONS
             * =================================================
             */

            case API_GET -> {

                requireNoSelector(
                        action
                );

                requireTarget(
                        action,
                        "API_GET requires a request URL"
                );
            }

            case API_POST -> {

                requireNoSelector(
                        action
                );

                requireTarget(
                        action,
                        "API_POST requires a request URL"
                );

                /*
                 * Request body is optional.
                 *
                 * If value exists it will be used
                 * as the request body.
                 */
            }

            case API_PUT -> {

                requireNoSelector(
                        action
                );

                requireTarget(
                        action,
                        "API_PUT requires a request URL"
                );

                /*
                 * Request body is optional.
                 */
            }

            case API_PATCH -> {

                requireNoSelector(
                        action
                );

                requireTarget(
                        action,
                        "API_PATCH requires a request URL"
                );

                /*
                 * Request body is optional.
                 */
            }

            case API_DELETE -> {

                requireNoSelector(
                        action
                );

                requireTarget(
                        action,
                        "API_DELETE requires a request URL"
                );
            }

            /*
             * =================================================
             * API ASSERTIONS
             * =================================================
             */

            case ASSERT_API_STATUS -> {

                requireNoSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_API_STATUS requires an expected HTTP status"
                );

                validateHttpStatus(
                        action
                );
            }

            case ASSERT_API_BODY_CONTAINS -> {

                requireNoSelector(
                        action
                );

                requireExpectedValue(
                        action,
                        "ASSERT_API_BODY_CONTAINS requires expected body text"
                );
            }
        }
    }

    /*
     * =========================================================
     * SELECTOR VALIDATION
     * =========================================================
     */

    private void validateSelector(
            NormalizedSelector selector
    ) {

        SelectorStrategy strategy =
                selector.getStrategy();

        if (
                strategy == null
        ) {

            throw new AutomationValidationException(
                    "Selector strategy is required"
            );
        }

        switch (
                strategy
        ) {

            case ROLE ->
                    validateRoleSelector(
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

    /*
     * ROLE selector rules:
     *
     * role          REQUIRED
     * name          REQUIRED
     * value         FORBIDDEN
     *
     * Example:
     *
     * ROLE
     * BUTTON
     * Login
     *
     * NOT:
     *
     * ROLE
     * BUTTON
     * Login
     * #login-button
     */
    private void validateRoleSelector(
            NormalizedSelector selector
    ) {

        if (
                selector.getRole()
                        == null
        ) {

            throw new AutomationValidationException(
                    "ROLE selector requires an element role"
            );
        }

        if (
                isBlank(
                        selector.getName()
                )
        ) {

            throw new AutomationValidationException(
                    "ROLE selector requires an accessible name"
            );
        }

        /*
         * Important regression protection.
         *
         * ROLE uses:
         *
         * role + accessible name
         *
         * It must NOT also use
         * selectorValue.
         *
         * This is what your failing tests:
         *
         * shouldRejectRoleSelectorWithValue
         * shouldRejectInvalidRoleSelector
         *
         * expect.
         */
        if (
                !isBlank(
                        selector.getValue()
                )
        ) {

            throw new AutomationValidationException(
                    "ROLE selector must use role and name instead of selector value"
            );
        }
    }

    /*
     * Non-ROLE selector rules:
     *
     * value         REQUIRED
     * role          FORBIDDEN
     * role name     FORBIDDEN
     */
    private void validateValueSelector(
            NormalizedSelector selector
    ) {

        if (
                isBlank(
                        selector.getValue()
                )
        ) {

            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector requires a selector value"
            );
        }

        if (
                selector.getRole()
                        != null
        ) {

            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector must not define an element role"
            );
        }

        if (
                !isBlank(
                        selector.getName()
                )
        ) {

            throw new AutomationValidationException(
                    selector.getStrategy()
                            + " selector must not define a role name"
            );
        }
    }

    /*
     * =========================================================
     * SELECTOR REQUIREMENTS
     * =========================================================
     */

    private void requireSelector(
            NormalizedAutomationAction action
    ) {

        if (
                action.getSelector()
                        == null
        ) {

            throw new AutomationValidationException(
                    action.getActionType()
                            + " requires a selector"
            );
        }
    }

    private void requireNoSelector(
            NormalizedAutomationAction action
    ) {

        if (
                action.getSelector()
                        != null
        ) {

            throw new AutomationValidationException(
                    action.getActionType()
                            + " must not have a selector"
            );
        }
    }

    /*
     * =========================================================
     * VALUE REQUIREMENTS
     * =========================================================
     */

    private void requireValue(
            NormalizedAutomationAction action,
            String message
    ) {

        if (
                isBlank(
                        action.getValue()
                )
        ) {

            throw new AutomationValidationException(
                    message
            );
        }
    }

    private void requireExpectedValue(
            NormalizedAutomationAction action,
            String message
    ) {

        if (
                isBlank(
                        action.getExpectedValue()
                )
        ) {

            throw new AutomationValidationException(
                    message
            );
        }
    }

    private void requireTarget(
            NormalizedAutomationAction action,
            String message
    ) {

        if (
                isBlank(
                        action.getTarget()
                )
        ) {

            throw new AutomationValidationException(
                    message
            );
        }
    }

    /*
     * =========================================================
     * WAIT VALIDATION
     * =========================================================
     */

    private void validateWaitValue(
            NormalizedAutomationAction action
    ) {

        String value =
                action.getValue();

        if (
                isBlank(
                        value
                )
        ) {

            return;
        }

        try {

            double milliseconds =
                    Double.parseDouble(
                            value.trim()
                    );

            if (
                    milliseconds < 0
            ) {

                throw new AutomationValidationException(
                        "WAIT value must be a non-negative number of milliseconds"
                );
            }

            if (
                    Double.isNaN(
                            milliseconds
                    )
                            || Double.isInfinite(
                            milliseconds
                    )
            ) {

                throw new AutomationValidationException(
                        "WAIT value must be a valid number of milliseconds"
                );
            }

        } catch (
                NumberFormatException exception
        ) {

            throw new AutomationValidationException(
                    "WAIT value must be a valid number of milliseconds"
            );
        }
    }

    /*
     * =========================================================
     * HTTP STATUS VALIDATION
     * =========================================================
     */

    private void validateHttpStatus(
            NormalizedAutomationAction action
    ) {

        String expectedValue =
                action.getExpectedValue();

        if (
                isBlank(
                        expectedValue
                )
        ) {

            return;
        }

        final int status;

        try {

            status =
                    Integer.parseInt(
                            expectedValue.trim()
                    );

        } catch (
                NumberFormatException exception
        ) {

            throw new AutomationValidationException(
                    "ASSERT_API_STATUS expected value must be a valid HTTP status code"
            );
        }

        if (
                status < 100
                        || status > 599
        ) {

            throw new AutomationValidationException(
                    "ASSERT_API_STATUS expected value must be between 100 and 599"
            );
        }
    }

    /*
     * =========================================================
     * COMMON
     * =========================================================
     */

    private boolean isBlank(
            String value
    ) {

        return value == null
                || value.isBlank();
    }
}