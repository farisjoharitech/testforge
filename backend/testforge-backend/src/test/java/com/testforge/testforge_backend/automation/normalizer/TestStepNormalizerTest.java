package com.testforge.testforge_backend.automation.normalizer;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.domain.TestStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TestStepNormalizerTest {

    private TestStepNormalizer normalizer;

    @BeforeEach
    void setUp() {
        normalizer =
                new TestStepNormalizer();
    }

    @Test
    void shouldNormalizeNavigateAction() {

        TestStep step =
                createStep(
                        "STEP-001",
                        1,
                        "Navigate to the login page",
                        "Login page",
                        "${BASE_URL}/login",
                        "Login page is displayed"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.NAVIGATE,
                result.getActionType()
        );

        assertEquals(
                "STEP-001",
                result.getSourceStepId()
        );

        assertEquals(
                1,
                result.getStepOrder()
        );

        assertEquals(
                "Login page",
                result.getTarget()
        );

        assertEquals(
                "${BASE_URL}/login",
                result.getValue()
        );

        assertNull(
                result.getSelector()
        );

        assertNull(
                result.getExpectedValue()
        );
    }

    @Test
    void shouldNormalizeClickAction() {

        TestStep step =
                createStep(
                        "STEP-002",
                        2,
                        "Click Login button",
                        "Login button",
                        null,
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.CLICK,
                result.getActionType()
        );

        assertEquals(
                "Login button",
                result.getTarget()
        );

        assertNull(
                result.getValue()
        );
    }

    @Test
    void shouldNormalizeFillAction() {

        TestStep step =
                createStep(
                        "STEP-003",
                        3,
                        "Enter valid username",
                        "Username field",
                        "${TEST_USERNAME}",
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.FILL,
                result.getActionType()
        );

        assertEquals(
                "${TEST_USERNAME}",
                result.getValue()
        );
    }

    @Test
    void shouldNormalizeSelectAction() {

        TestStep step =
                createStep(
                        "STEP-004",
                        4,
                        "Select Malaysia",
                        "Country dropdown",
                        "Malaysia",
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.SELECT,
                result.getActionType()
        );

        assertEquals(
                "Malaysia",
                result.getValue()
        );
    }

    @Test
    void shouldNormalizeCheckAction() {

        TestStep step =
                createStep(
                        "STEP-005",
                        5,
                        "Check Remember Me",
                        "Remember Me checkbox",
                        null,
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.CHECK,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizeUncheckAction() {

        TestStep step =
                createStep(
                        "STEP-006",
                        6,
                        "Uncheck Remember Me",
                        "Remember Me checkbox",
                        null,
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.UNCHECK,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizePressKeyboardAction() {

        TestStep step =
                createStep(
                        "STEP-007",
                        7,
                        "Press Enter",
                        "Search field",
                        "ENTER",
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.PRESS,
                result.getActionType()
        );

        assertEquals(
                "ENTER",
                result.getValue()
        );
    }

    @Test
    void shouldNormalizePressButtonAsClick() {

        TestStep step =
                createStep(
                        "STEP-008",
                        8,
                        "Press Login button",
                        "Login button",
                        null,
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.CLICK,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizeWaitAction() {

        TestStep step =
                createStep(
                        "STEP-009",
                        9,
                        "Wait for dashboard to load",
                        "Dashboard",
                        "dashboard-ready",
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.WAIT,
                result.getActionType()
        );

        assertEquals(
                "dashboard-ready",
                result.getValue()
        );
    }

    @Test
    void shouldNormalizeVisibleAssertion() {

        TestStep step =
                createStep(
                        "STEP-010",
                        10,
                        "Verify Dashboard is visible",
                        "Dashboard",
                        null,
                        "Dashboard is displayed"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_VISIBLE,
                result.getActionType()
        );

        assertEquals(
                "Dashboard is displayed",
                result.getExpectedValue()
        );
    }

    @Test
    void shouldNormalizeCheckVisibleAsAssertionNotCheckbox() {

        TestStep step =
                createStep(
                        "STEP-011",
                        11,
                        "Check Dashboard is visible",
                        "Dashboard",
                        null,
                        "Dashboard is displayed"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_VISIBLE,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizeHiddenAssertion() {

        TestStep step =
                createStep(
                        "STEP-012",
                        12,
                        "Verify error message is hidden",
                        "Error message",
                        null,
                        "Error message is hidden"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_HIDDEN,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizeTextAssertion() {

        TestStep step =
                createStep(
                        "STEP-013",
                        13,
                        "Verify message text",
                        "Success message",
                        null,
                        "Login successful"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_TEXT,
                result.getActionType()
        );

        assertEquals(
                "Login successful",
                result.getExpectedValue()
        );
    }

    @Test
    void shouldNormalizeValueAssertion() {

        TestStep step =
                createStep(
                        "STEP-014",
                        14,
                        "Verify field value is correct",
                        "Username field",
                        null,
                        "qa.user@example.com"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_VALUE,
                result.getActionType()
        );
    }

    @Test
    void shouldNormalizeUrlAssertion() {

        TestStep step =
                createStep(
                        "STEP-015",
                        15,
                        "Verify URL contains dashboard",
                        null,
                        null,
                        "/dashboard"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_URL,
                result.getActionType()
        );

        assertEquals(
                "/dashboard",
                result.getExpectedValue()
        );
    }

    @Test
    void shouldNormalizeTitleAssertion() {

        TestStep step =
                createStep(
                        "STEP-016",
                        16,
                        "Verify page title",
                        null,
                        null,
                        "Dashboard"
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.ASSERT_TITLE,
                result.getActionType()
        );

        assertEquals(
                "Dashboard",
                result.getExpectedValue()
        );
    }

    @Test
    void shouldIgnoreCaseAndOuterWhitespace() {

        TestStep step =
                createStep(
                        "STEP-017",
                        17,
                        "   CLICK LOGIN BUTTON   ",
                        "Login button",
                        null,
                        null
                );

        NormalizedAutomationAction result =
                normalizer.normalize(step);

        assertEquals(
                AutomationActionType.CLICK,
                result.getActionType()
        );
    }

    @Test
    void shouldRejectUnsupportedAction() {

        TestStep step =
                createStep(
                        "STEP-018",
                        18,
                        "Perform special reconciliation",
                        "Reconciliation",
                        null,
                        null
                );

        assertThrows(
                UnsupportedTestStepActionException.class,
                () -> normalizer.normalize(step)
        );
    }

    @Test
    void shouldRejectBlankAction() {

        TestStep step =
                createStep(
                        "STEP-019",
                        19,
                        "   ",
                        null,
                        null,
                        null
                );

        assertThrows(
                UnsupportedTestStepActionException.class,
                () -> normalizer.normalize(step)
        );
    }

    @Test
    void shouldRejectNullStep() {

        assertThrows(
                IllegalArgumentException.class,
                () -> normalizer.normalize(null)
        );
    }

    private TestStep createStep(
            String testStepId,
            Integer stepOrder,
            String action,
            String target,
            String inputValue,
            String expectedResult
    ) {

        TestStep step =
                new TestStep();

        step.setTestStepId(
                testStepId
        );

        step.setStepOrder(
                stepOrder
        );

        step.setAction(
                action
        );

        step.setTarget(
                target
        );

        step.setInputValue(
                inputValue
        );

        step.setExpectedResult(
                expectedResult
        );

        return step;
    }
}