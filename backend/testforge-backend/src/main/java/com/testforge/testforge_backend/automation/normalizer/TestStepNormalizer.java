package com.testforge.testforge_backend.automation.normalizer;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.domain.TestStep;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class TestStepNormalizer {

    public NormalizedAutomationAction normalize(
            TestStep testStep
    ) {

        if (testStep == null) {
            throw new IllegalArgumentException(
                    "Test Step must not be null"
            );
        }

        String rawAction =
                testStep.getAction();

        if (rawAction == null
                || rawAction.isBlank()) {

            throw new UnsupportedTestStepActionException(
                    "Test Step action is empty for: "
                            + testStep.getTestStepId()
            );
        }

        AutomationActionType actionType =
                determineActionType(
                        testStep
                );

        return new NormalizedAutomationAction(
                testStep.getTestStepId(),
                testStep.getStepOrder(),
                actionType,
                testStep.getTarget(),
                null,
                determineValue(
                        actionType,
                        testStep
                ),
                determineExpectedValue(
                        actionType,
                        testStep
                )
        );
    }

    private AutomationActionType determineActionType(
            TestStep testStep
    ) {

        String action =
                normalizeText(
                        testStep.getAction()
                );

        if (isUrlAssertion(action)) {
            return AutomationActionType.ASSERT_URL;
        }

        if (isTitleAssertion(action)) {
            return AutomationActionType.ASSERT_TITLE;
        }

        if (isHiddenAssertion(action)) {
            return AutomationActionType.ASSERT_HIDDEN;
        }

        if (isVisibleAssertion(action)) {
            return AutomationActionType.ASSERT_VISIBLE;
        }

        if (isValueAssertion(action)) {
            return AutomationActionType.ASSERT_VALUE;
        }

        if (isTextAssertion(action)) {
            return AutomationActionType.ASSERT_TEXT;
        }

        if (startsWithAny(
                action,
                "navigate ",
                "navigate to ",
                "open ",
                "go to ",
                "visit "
        )) {
            return AutomationActionType.NAVIGATE;
        }

        if (startsWithAny(
                action,
                "uncheck ",
                "untick "
        )) {
            return AutomationActionType.UNCHECK;
        }

        if (startsWithAny(
                action,
                "check ",
                "tick "
        )) {
            return AutomationActionType.CHECK;
        }

        if (startsWithAny(
                action,
                "select ",
                "choose "
        )) {
            return AutomationActionType.SELECT;
        }

        if (startsWithAny(
                action,
                "enter ",
                "type ",
                "fill ",
                "input "
        )) {
            return AutomationActionType.FILL;
        }

        if (startsWithAny(
                action,
                "click ",
                "click on "
        )) {
            return AutomationActionType.CLICK;
        }

        if (startsWithAny(
                action,
                "press ",
                "hit "
        )) {

            if (looksLikeButtonClick(
                    action,
                    testStep.getTarget()
            )) {
                return AutomationActionType.CLICK;
            }

            return AutomationActionType.PRESS;
        }

        if (startsWithAny(
                action,
                "wait ",
                "wait for ",
                "wait until "
        )) {
            return AutomationActionType.WAIT;
        }

        throw new UnsupportedTestStepActionException(
                "Unsupported Test Step action for "
                        + testStep.getTestStepId()
                        + ": "
                        + testStep.getAction()
        );
    }

    private String determineValue(
            AutomationActionType actionType,
            TestStep testStep
    ) {

        return switch (actionType) {

            case NAVIGATE,
                 FILL,
                 SELECT,
                 PRESS,
                 WAIT ->
                    testStep.getInputValue();

            default ->
                    null;
        };
    }

    private String determineExpectedValue(
            AutomationActionType actionType,
            TestStep testStep
    ) {

        return switch (actionType) {

            case ASSERT_VISIBLE,
                 ASSERT_HIDDEN,
                 ASSERT_TEXT,
                 ASSERT_VALUE,
                 ASSERT_URL,
                 ASSERT_TITLE ->
                    testStep.getExpectedResult();

            default ->
                    null;
        };
    }

    private boolean isUrlAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "url",
                "address"
        );
    }

    private boolean isTitleAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "page title",
                "title"
        );
    }

    private boolean isHiddenAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "hidden",
                "not visible",
                "not displayed",
                "disappears",
                "disappeared"
        );
    }

    private boolean isVisibleAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "visible",
                "displayed",
                "appears",
                "shown",
                "present"
        );
    }

    private boolean isValueAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "field value",
                "input value",
                "value is",
                "value equals"
        );
    }

    private boolean isTextAssertion(
            String action
    ) {

        return isAssertion(action)
                && containsAny(
                action,
                "text",
                "message",
                "label"
        );
    }

    private boolean isAssertion(
            String action
    ) {

        return startsWithAny(
                action,
                "verify ",
                "assert ",
                "validate ",
                "confirm ",
                "check "
        );
    }

    private boolean looksLikeButtonClick(
            String action,
            String target
    ) {

        String normalizedTarget =
                target == null
                        ? ""
                        : normalizeText(target);

        return action.contains("button")
                || normalizedTarget.contains("button");
    }

    private boolean startsWithAny(
            String text,
            String... prefixes
    ) {

        for (String prefix : prefixes) {
            if (text.startsWith(prefix)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsAny(
            String text,
            String... fragments
    ) {

        for (String fragment : fragments) {
            if (text.contains(fragment)) {
                return true;
            }
        }

        return false;
    }

    private String normalizeText(
            String text
    ) {

        return text
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}