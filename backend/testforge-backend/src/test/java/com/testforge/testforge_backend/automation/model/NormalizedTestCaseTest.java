package com.testforge.testforge_backend.automation.model;

import com.testforge.testforge_backend.domain.enums.AutomationType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class NormalizedTestCaseTest {

    @Test
    void shouldBuildNormalizedUiTestCase() {

        NormalizedTestCase testCase =
                new NormalizedTestCase();

        testCase.setTestCaseId("TC-001");

        testCase.setName(
                "Successful login"
        );

        testCase.setAutomationType(
                AutomationType.UI
        );

        testCase.addAction(
                new NormalizedAutomationAction(
                        "STEP-001",
                        1,
                        AutomationActionType.NAVIGATE,
                        "Login page",
                        null,
                        "${BASE_URL}/login",
                        null
                )
        );

        testCase.addAction(
                new NormalizedAutomationAction(
                        "STEP-002",
                        2,
                        AutomationActionType.FILL,
                        "Username field",
                        new NormalizedSelector(
                                SelectorStrategy.LABEL,
                                "Username",
                                null,
                                null,
                                true
                        ),
                        "${TEST_USERNAME}",
                        null
                )
        );

        testCase.addAction(
                new NormalizedAutomationAction(
                        "STEP-003",
                        3,
                        AutomationActionType.CLICK,
                        "Login button",
                        new NormalizedSelector(
                                SelectorStrategy.ROLE,
                                null,
                                UiElementRole.BUTTON,
                                "Login",
                                true
                        ),
                        null,
                        null
                )
        );

        testCase.addAction(
                new NormalizedAutomationAction(
                        "STEP-004",
                        4,
                        AutomationActionType.ASSERT_VISIBLE,
                        "Dashboard",
                        new NormalizedSelector(
                                SelectorStrategy.TEXT,
                                "Dashboard",
                                null,
                                null,
                                false
                        ),
                        null,
                        "Dashboard is displayed"
                )
        );

        assertEquals(
                "TC-001",
                testCase.getTestCaseId()
        );

        assertEquals(
                AutomationType.UI,
                testCase.getAutomationType()
        );

        assertEquals(
                4,
                testCase.getActions().size()
        );

        NormalizedAutomationAction navigate =
                testCase.getActions().get(0);

        assertEquals(
                AutomationActionType.NAVIGATE,
                navigate.getActionType()
        );

        assertNull(
                navigate.getSelector()
        );

        assertEquals(
                "${BASE_URL}/login",
                navigate.getValue()
        );

        NormalizedAutomationAction fill =
                testCase.getActions().get(1);

        assertEquals(
                SelectorStrategy.LABEL,
                fill.getSelector().getStrategy()
        );

        assertEquals(
                "Username",
                fill.getSelector().getValue()
        );

        NormalizedAutomationAction click =
                testCase.getActions().get(2);

        assertEquals(
                AutomationActionType.CLICK,
                click.getActionType()
        );

        assertEquals(
                SelectorStrategy.ROLE,
                click.getSelector().getStrategy()
        );

        assertEquals(
                UiElementRole.BUTTON,
                click.getSelector().getRole()
        );

        assertEquals(
                "Login",
                click.getSelector().getName()
        );

        assertNull(
                click.getValue()
        );
    }
}