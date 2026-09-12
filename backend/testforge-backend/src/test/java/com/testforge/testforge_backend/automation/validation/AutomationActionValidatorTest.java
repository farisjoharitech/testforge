package com.testforge.testforge_backend.automation.validation;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.automation.model.NormalizedSelector;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AutomationActionValidatorTest {

    private AutomationActionValidator validator;

    @BeforeEach
    void setUp() {
        validator =
                new AutomationActionValidator();
    }

    @Test
    void shouldAcceptValidNavigateAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.NAVIGATE,
                        null,
                        "${BASE_URL}/login",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectNavigateWithoutValue() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.NAVIGATE,
                        null,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectNavigateWithSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.NAVIGATE,
                        roleButtonSelector(),
                        "${BASE_URL}/login",
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValidClickAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        roleButtonSelector(),
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectClickWithoutSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        null,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValidFillAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        labelSelector(
                                "Username"
                        ),
                        "${TEST_USERNAME}",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectFillWithoutValue() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        labelSelector(
                                "Username"
                        ),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectFillWithoutSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        null,
                        "${TEST_USERNAME}",
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValidSelectAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.SELECT,
                        labelSelector(
                                "Country"
                        ),
                        "Malaysia",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectSelectWithoutValue() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.SELECT,
                        labelSelector(
                                "Country"
                        ),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValidCheckAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CHECK,
                        new NormalizedSelector(
                                SelectorStrategy.ROLE,
                                null,
                                UiElementRole.CHECKBOX,
                                "Remember Me",
                                true
                        ),
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValidPressAction() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.PRESS,
                        labelSelector(
                                "Search"
                        ),
                        "ENTER",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectPressWithoutKey() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.PRESS,
                        labelSelector(
                                "Search"
                        ),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptVisibleAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_VISIBLE,
                        textSelector(
                                "Dashboard"
                        ),
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectVisibleAssertionWithoutSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_VISIBLE,
                        null,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptTextAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_TEXT,
                        textSelector(
                                "Welcome message"
                        ),
                        null,
                        "Welcome"
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectTextAssertionWithoutExpectedValue() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_TEXT,
                        textSelector(
                                "Welcome message"
                        ),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptValueAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_VALUE,
                        labelSelector(
                                "Username"
                        ),
                        null,
                        "faris"
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptUrlAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_URL,
                        null,
                        null,
                        "${BASE_URL}/dashboard"
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectUrlAssertionWithSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_URL,
                        textSelector(
                                "Dashboard"
                        ),
                        null,
                        "${BASE_URL}/dashboard"
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectUrlAssertionWithoutExpectedValue() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_URL,
                        null,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptTitleAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.ASSERT_TITLE,
                        null,
                        null,
                        "Dashboard"
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptRoleSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        roleButtonSelector(),
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectRoleSelectorWithoutRole() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.ROLE,
                        null,
                        null,
                        "Login",
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectRoleSelectorWithoutName() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.ROLE,
                        null,
                        UiElementRole.BUTTON,
                        null,
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectRoleSelectorWithValue() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.ROLE,
                        "login-button",
                        UiElementRole.BUTTON,
                        "Login",
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptLabelSelector() {

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        labelSelector(
                                "Username"
                        ),
                        "faris",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptPlaceholderSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.PLACEHOLDER,
                        "Enter username",
                        null,
                        null,
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        selector,
                        "faris",
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptTestIdSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.TEST_ID,
                        "login-submit",
                        null,
                        null,
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptCssSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.CSS,
                        "button.login-submit",
                        null,
                        null,
                        false
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldAcceptXpathSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.XPATH,
                        "//button[@id='login-submit']",
                        null,
                        null,
                        false
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.CLICK,
                        selector,
                        null,
                        null
                );

        assertDoesNotThrow(
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectValueSelectorWithoutValue() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.LABEL,
                        null,
                        null,
                        null,
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        selector,
                        "faris",
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectSelectorWithoutStrategy() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        null,
                        "Username",
                        null,
                        null,
                        true
                );

        NormalizedAutomationAction action =
                createAction(
                        AutomationActionType.FILL,
                        selector,
                        "faris",
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectMissingActionType() {

        NormalizedAutomationAction action =
                createAction(
                        null,
                        roleButtonSelector(),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectMissingStepOrder() {

        NormalizedAutomationAction action =
                new NormalizedAutomationAction(
                        null,
                        null,
                        AutomationActionType.CLICK,
                        "Login button",
                        roleButtonSelector(),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectZeroStepOrder() {

        NormalizedAutomationAction action =
                new NormalizedAutomationAction(
                        null,
                        0,
                        AutomationActionType.CLICK,
                        "Login button",
                        roleButtonSelector(),
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () -> validator.validate(action)
        );
    }

    @Test
    void shouldRejectNullAction() {

        assertThrows(
                IllegalArgumentException.class,
                () -> validator.validate(null)
        );
    }

    private NormalizedAutomationAction createAction(
            AutomationActionType actionType,
            NormalizedSelector selector,
            String value,
            String expectedValue
    ) {

        return new NormalizedAutomationAction(
                null,
                1,
                actionType,
                null,
                selector,
                value,
                expectedValue
        );
    }

    private NormalizedSelector roleButtonSelector() {

        return new NormalizedSelector(
                SelectorStrategy.ROLE,
                null,
                UiElementRole.BUTTON,
                "Login",
                true
        );
    }

    private NormalizedSelector labelSelector(
            String value
    ) {

        return new NormalizedSelector(
                SelectorStrategy.LABEL,
                value,
                null,
                null,
                true
        );
    }

    private NormalizedSelector textSelector(
            String value
    ) {

        return new NormalizedSelector(
                SelectorStrategy.TEXT,
                value,
                null,
                null,
                false
        );
    }
}