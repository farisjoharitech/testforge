package com.testforge.testforge_backend.automation.selector;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.NormalizedAutomationAction;
import com.testforge.testforge_backend.automation.model.NormalizedSelector;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class SelectorResolver {

    public NormalizedSelector resolve(
            NormalizedAutomationAction action
    ) {

        if (action == null) {
            throw new IllegalArgumentException(
                    "Normalized automation action must not be null"
            );
        }

        if (action.getSelector() != null) {
            return action.getSelector();
        }

        if (!requiresSelector(
                action.getActionType()
        )) {
            return null;
        }

        String target =
                action.getTarget();

        if (target == null
                || target.isBlank()) {

            throw new SelectorResolutionException(
                    "Cannot resolve selector for "
                            + action.getSourceStepId()
                            + " because target is empty"
            );
        }

        String trimmedTarget =
                target.trim();

        String normalizedTarget =
                trimmedTarget.toLowerCase(
                        Locale.ROOT
                );

        /*
         * More specific selector rules must appear
         * before more generic rules.
         *
         * Example:
         * "Standard radio button"
         * also ends with "button",
         * so RADIO must be checked before BUTTON.
         */

        if (endsWithAny(
                normalizedTarget,
                " radio button",
                " radio"
        )) {
            return roleSelector(
                    UiElementRole.RADIO,
                    removeKnownSuffix(
                            trimmedTarget,
                            "radio button",
                            "radio"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " button"
        )) {
            return roleSelector(
                    UiElementRole.BUTTON,
                    removeSuffix(
                            trimmedTarget,
                            "button"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " link"
        )) {
            return roleSelector(
                    UiElementRole.LINK,
                    removeSuffix(
                            trimmedTarget,
                            "link"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " checkbox"
        )) {
            return roleSelector(
                    UiElementRole.CHECKBOX,
                    removeSuffix(
                            trimmedTarget,
                            "checkbox"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " dropdown",
                " combobox"
        )) {
            return roleSelector(
                    UiElementRole.COMBOBOX,
                    removeKnownSuffix(
                            trimmedTarget,
                            "dropdown",
                            "combobox"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " heading"
        )) {
            return roleSelector(
                    UiElementRole.HEADING,
                    removeSuffix(
                            trimmedTarget,
                            "heading"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " tab"
        )) {
            return roleSelector(
                    UiElementRole.TAB,
                    removeSuffix(
                            trimmedTarget,
                            "tab"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " dialog"
        )) {
            return roleSelector(
                    UiElementRole.DIALOG,
                    removeSuffix(
                            trimmedTarget,
                            "dialog"
                    )
            );
        }

        if (endsWithAny(
                normalizedTarget,
                " field",
                " input"
        )) {
            return labelSelector(
                    removeKnownSuffix(
                            trimmedTarget,
                            "field",
                            "input"
                    )
            );
        }

        return textSelector(
                trimmedTarget
        );
    }

    public void resolveAndAttach(
            NormalizedAutomationAction action
    ) {

        NormalizedSelector selector =
                resolve(action);

        action.setSelector(
                selector
        );
    }

    private boolean requiresSelector(
            AutomationActionType actionType
    ) {

        if (actionType == null) {
            throw new SelectorResolutionException(
                    "Cannot resolve selector because action type is empty"
            );
        }

        return switch (actionType) {

            case NAVIGATE,
                 ASSERT_URL,
                 ASSERT_TITLE,
                 WAIT ->
                    false;

            default ->
                    true;
        };
    }

    private NormalizedSelector roleSelector(
            UiElementRole role,
            String name
    ) {

        return new NormalizedSelector(
                SelectorStrategy.ROLE,
                null,
                role,
                name,
                true
        );
    }

    private NormalizedSelector labelSelector(
            String label
    ) {

        return new NormalizedSelector(
                SelectorStrategy.LABEL,
                label,
                null,
                null,
                true
        );
    }

    private NormalizedSelector textSelector(
            String text
    ) {

        return new NormalizedSelector(
                SelectorStrategy.TEXT,
                text,
                null,
                null,
                false
        );
    }

    private boolean endsWithAny(
            String text,
            String... suffixes
    ) {

        for (String suffix : suffixes) {
            if (text.endsWith(suffix)) {
                return true;
            }
        }

        return false;
    }

    private String removeSuffix(
            String original,
            String suffix
    ) {

        String trimmed =
                original.trim();

        int suffixStart =
                trimmed.length()
                        - suffix.length();

        if (suffixStart < 0) {
            return trimmed;
        }

        return trimmed
                .substring(
                        0,
                        suffixStart
                )
                .trim();
    }

    private String removeKnownSuffix(
            String original,
            String... suffixes
    ) {

        String normalized =
                original
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        for (String suffix : suffixes) {

            if (normalized.endsWith(
                    " " + suffix
            )) {
                return removeSuffix(
                        original,
                        suffix
                );
            }
        }

        return original.trim();
    }
}