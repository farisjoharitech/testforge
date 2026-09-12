package com.testforge.testforge_backend.automation.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NormalizedSelectorTest {

    @Test
    void shouldRepresentRoleSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.ROLE,
                        null,
                        UiElementRole.BUTTON,
                        "Login",
                        true
                );

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

        assertNull(
                selector.getValue()
        );

        assertTrue(
                selector.isExact()
        );
    }

    @Test
    void shouldRepresentLabelSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.LABEL,
                        "Username",
                        null,
                        null,
                        false
                );

        assertEquals(
                SelectorStrategy.LABEL,
                selector.getStrategy()
        );

        assertEquals(
                "Username",
                selector.getValue()
        );

        assertNull(
                selector.getRole()
        );

        assertNull(
                selector.getName()
        );

        assertFalse(
                selector.isExact()
        );
    }

    @Test
    void shouldRepresentTestIdSelector() {

        NormalizedSelector selector =
                new NormalizedSelector(
                        SelectorStrategy.TEST_ID,
                        "login-button",
                        null,
                        null,
                        true
                );

        assertEquals(
                SelectorStrategy.TEST_ID,
                selector.getStrategy()
        );

        assertEquals(
                "login-button",
                selector.getValue()
        );
    }
}