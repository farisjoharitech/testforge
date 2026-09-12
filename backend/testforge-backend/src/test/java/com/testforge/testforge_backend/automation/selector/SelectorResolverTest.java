package com.testforge.testforge_backend.automation.selector;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.automation.model.NormalizedSelector;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SelectorResolverTest {

    private SelectorResolver resolver;

    @BeforeEach
    void setUp() {
        resolver =
                new SelectorResolver();
    }

    @Test
    void shouldResolveButtonUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-001",
                        AutomationActionType.CLICK,
                        "Login button"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.ROLE,
                selector.getStrategy()
        );

        assertEquals(
                UiElementRole.BUTTON,
                selector.getRole()
        );

        assertEquals(
                "Login",
                selector.getName()
        );

        assertTrue(
                selector.isExact()
        );
    }

    @Test
    void shouldResolveLinkUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-002",
                        AutomationActionType.CLICK,
                        "Forgot Password link"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.ROLE,
                selector.getStrategy()
        );

        assertEquals(
                UiElementRole.LINK,
                selector.getRole()
        );

        assertEquals(
                "Forgot Password",
                selector.getName()
        );
    }

    @Test
    void shouldResolveFieldUsingLabel() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-003",
                        AutomationActionType.FILL,
                        "Username field"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.LABEL,
                selector.getStrategy()
        );

        assertEquals(
                "Username",
                selector.getValue()
        );

        assertTrue(
                selector.isExact()
        );
    }

    @Test
    void shouldResolveCheckboxUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-004",
                        AutomationActionType.CHECK,
                        "Remember Me checkbox"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.ROLE,
                selector.getStrategy()
        );

        assertEquals(
                UiElementRole.CHECKBOX,
                selector.getRole()
        );

        assertEquals(
                "Remember Me",
                selector.getName()
        );
    }

    @Test
    void shouldResolveRadioUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-005",
                        AutomationActionType.CLICK,
                        "Standard radio button"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                UiElementRole.RADIO,
                selector.getRole()
        );

        assertEquals(
                "Standard",
                selector.getName()
        );
    }

    @Test
    void shouldResolveDropdownUsingComboboxRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-006",
                        AutomationActionType.SELECT,
                        "Country dropdown"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.ROLE,
                selector.getStrategy()
        );

        assertEquals(
                UiElementRole.COMBOBOX,
                selector.getRole()
        );

        assertEquals(
                "Country",
                selector.getName()
        );
    }

    @Test
    void shouldResolveHeadingUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-007",
                        AutomationActionType.ASSERT_VISIBLE,
                        "Dashboard heading"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                UiElementRole.HEADING,
                selector.getRole()
        );

        assertEquals(
                "Dashboard",
                selector.getName()
        );
    }

    @Test
    void shouldResolveTabUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-008",
                        AutomationActionType.CLICK,
                        "Settings tab"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                UiElementRole.TAB,
                selector.getRole()
        );

        assertEquals(
                "Settings",
                selector.getName()
        );
    }

    @Test
    void shouldResolveDialogUsingRole() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-009",
                        AutomationActionType.ASSERT_VISIBLE,
                        "Delete Confirmation dialog"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                UiElementRole.DIALOG,
                selector.getRole()
        );

        assertEquals(
                "Delete Confirmation",
                selector.getName()
        );
    }

    @Test
    void shouldUseTextAsFallback() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-010",
                        AutomationActionType.ASSERT_VISIBLE,
                        "Dashboard"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.TEXT,
                selector.getStrategy()
        );

        assertEquals(
                "Dashboard",
                selector.getValue()
        );
    }

    @Test
    void shouldIgnoreTargetCaseForTypeDetection() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-011",
                        AutomationActionType.CLICK,
                        "LOGIN BUTTON"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                UiElementRole.BUTTON,
                selector.getRole()
        );

        assertEquals(
                "LOGIN",
                selector.getName()
        );
    }

    @Test
    void shouldTrimTargetWhitespace() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-012",
                        AutomationActionType.FILL,
                        "   Email field   "
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertEquals(
                SelectorStrategy.LABEL,
                selector.getStrategy()
        );

        assertEquals(
                "Email",
                selector.getValue()
        );
    }

    @Test
    void shouldReturnExistingSelectorWithoutReplacingIt() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-013",
                        AutomationActionType.CLICK,
                        "Login button"
                );

        NormalizedSelector existing =
                new NormalizedSelector(
                        SelectorStrategy.TEST_ID,
                        "login-button",
                        null,
                        null,
                        true
                );

        action.setSelector(
                existing
        );

        NormalizedSelector resolved =
                resolver.resolve(action);

        assertSame(
                existing,
                resolved
        );

        assertEquals(
                SelectorStrategy.TEST_ID,
                resolved.getStrategy()
        );
    }

    @Test
    void shouldAttachResolvedSelectorToAction() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-014",
                        AutomationActionType.CLICK,
                        "Save button"
                );

        resolver.resolveAndAttach(
                action
        );

        assertEquals(
                SelectorStrategy.ROLE,
                action.getSelector().getStrategy()
        );

        assertEquals(
                UiElementRole.BUTTON,
                action.getSelector().getRole()
        );

        assertEquals(
                "Save",
                action.getSelector().getName()
        );
    }

    @Test
    void shouldNotResolveSelectorForNavigate() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-015",
                        AutomationActionType.NAVIGATE,
                        "Login page"
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertNull(
                selector
        );
    }

    @Test
    void shouldNotResolveSelectorForUrlAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-016",
                        AutomationActionType.ASSERT_URL,
                        null
                );

        NormalizedSelector selector =
                resolver.resolve(action);

        assertNull(
                selector
        );
    }

    @Test
    void shouldNotResolveSelectorForTitleAssertion() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-017",
                        AutomationActionType.ASSERT_TITLE,
                        null
                );

        assertNull(
                resolver.resolve(action)
        );
    }

    @Test
    void shouldNotResolveSelectorForWait() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-018",
                        AutomationActionType.WAIT,
                        null
                );

        assertNull(
                resolver.resolve(action)
        );
    }

    @Test
    void shouldRejectMissingTargetForElementAction() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-019",
                        AutomationActionType.CLICK,
                        null
                );

        assertThrows(
                SelectorResolutionException.class,
                () -> resolver.resolve(action)
        );
    }

    @Test
    void shouldRejectBlankTargetForElementAction() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-020",
                        AutomationActionType.FILL,
                        "   "
                );

        assertThrows(
                SelectorResolutionException.class,
                () -> resolver.resolve(action)
        );
    }

    @Test
    void shouldRejectMissingActionType() {

        NormalizedAutomationAction action =
                createAction(
                        "STEP-021",
                        null,
                        "Login button"
                );

        assertThrows(
                SelectorResolutionException.class,
                () -> resolver.resolve(action)
        );
    }

    @Test
    void shouldRejectNullAction() {

        assertThrows(
                IllegalArgumentException.class,
                () -> resolver.resolve(null)
        );
    }

    private NormalizedAutomationAction createAction(
            String sourceStepId,
            AutomationActionType actionType,
            String target
    ) {

        return new NormalizedAutomationAction(
                sourceStepId,
                1,
                actionType,
                target,
                null,
                null,
                null
        );
    }
}