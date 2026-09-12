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
                        "https://example.test/login",
                        null
                )
        );

        testCase.addAction(
                new NormalizedAutomationAction(
                        "STEP-002",
                        2,
                        AutomationActionType.FILL,
                        "Username field",
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

        assertEquals(
                "STEP-001",
                navigate.getSourceStepId()
        );

        assertEquals(
                "https://example.test/login",
                navigate.getValue()
        );

        NormalizedAutomationAction click =
                testCase.getActions().get(2);

        assertEquals(
                AutomationActionType.CLICK,
                click.getActionType()
        );

        assertEquals(
                "Login button",
                click.getTarget()
        );

        assertNull(
                click.getValue()
        );
    }
}