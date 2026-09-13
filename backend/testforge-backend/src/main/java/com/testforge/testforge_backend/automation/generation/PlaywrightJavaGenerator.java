package com.testforge.testforge_backend.automation.generation;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class PlaywrightJavaGenerator {

    public GeneratedCode generate(
            AutomationScript script,
            List<AutomationStep> steps
    ) {

        if (script == null) {
            throw new IllegalArgumentException(
                    "Automation Script must not be null"
            );
        }

        if (steps == null || steps.isEmpty()) {
            throw new AutomationValidationException(
                    "Automation Script must contain at least one Automation Step before generation"
            );
        }

        String className =
                buildClassName(
                        script.getAutomationScriptId()
                );

        boolean needsUi =
                steps.stream()
                        .anyMatch(
                                step ->
                                        isUiAction(
                                                step.getActionType()
                                        )
                        );

        boolean needsApi =
                steps.stream()
                        .anyMatch(
                                step ->
                                        isApiAction(
                                                step.getActionType()
                                        )
                        );

        StringBuilder source =
                new StringBuilder();

        source.append(
                "package generated.testforge;\n\n"
        );

        source.append(
                "import com.microsoft.playwright.*;\n"
        );

        source.append(
                "import com.microsoft.playwright.options.AriaRole;\n"
        );

        source.append(
                "import com.microsoft.playwright.options.RequestOptions;\n"
        );

        source.append(
                "import org.junit.jupiter.api.Test;\n\n"
        );

        source.append(
                "import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;\n"
        );

        source.append(
                "import static org.junit.jupiter.api.Assertions.*;\n\n"
        );

        source.append(
                "public class "
                        + className
                        + " {\n\n"
        );

        source.append(
                "    @Test\n"
        );

        source.append(
                "    void execute() {\n"
        );

        source.append(
                "        try (Playwright playwright = Playwright.create()) {\n"
        );

        if (needsUi) {

            source.append(
                    "            Browser browser = playwright.chromium().launch(\n"
            );

            source.append(
                    "                    new BrowserType.LaunchOptions()\n"
            );

            source.append(
                    "                            .setHeadless(true)\n"
            );

            source.append(
                    "            );\n\n"
            );

            source.append(
                    "            BrowserContext context = browser.newContext();\n"
            );

            source.append(
                    "            Page page = context.newPage();\n\n"
            );
        }

        if (needsApi) {

            source.append(
                    "            APIRequestContext apiRequest = playwright.request().newContext();\n"
            );

            source.append(
                    "            APIResponse apiResponse = null;\n\n"
            );
        }

        for (AutomationStep step : steps) {

            source.append(
                    "            // "
                            + escapeComment(
                            step.getAutomationStepId()
                    )
                            + " | "
                            + step.getActionType()
                            + "\n"
            );

            source.append(
                    generateStep(
                            step
                    )
            );

            source.append(
                    "\n"
            );
        }

        if (needsUi) {
            source.append(
                    "            context.close();\n"
            );

            source.append(
                    "            browser.close();\n"
            );
        }

        if (needsApi) {
            source.append(
                    "            apiRequest.dispose();\n"
            );
        }

        source.append(
                "        }\n"
        );

        source.append(
                "    }\n"
        );

        source.append(
                "}\n"
        );

        return new GeneratedCode(
                className,
                source.toString()
        );
    }

    public String buildClassName(
            String automationScriptId
    ) {

        if (
                automationScriptId == null
                        || automationScriptId.isBlank()
        ) {
            return "GeneratedAutomationTest";
        }

        String[] parts =
                automationScriptId
                        .replaceAll(
                                "[^A-Za-z0-9]+",
                                " "
                        )
                        .trim()
                        .split("\\s+");

        String className =
                java.util.Arrays
                        .stream(parts)
                        .filter(
                                part ->
                                        !part.isBlank()
                        )
                        .map(
                                part ->
                                        part.substring(
                                                0,
                                                1
                                        ).toUpperCase(
                                                Locale.ROOT
                                        )
                                                + part.substring(
                                                1
                                        ).toLowerCase(
                                                Locale.ROOT
                                        )
                        )
                        .collect(
                                Collectors.joining()
                        );

        if (className.isBlank()) {
            className =
                    "GeneratedAutomation";
        }

        if (
                Character.isDigit(
                        className.charAt(0)
                )
        ) {
            className =
                    "Test"
                            + className;
        }

        if (
                !className.endsWith(
                        "Test"
                )
        ) {
            className =
                    className
                            + "Test";
        }

        return className;
    }

    private String generateStep(
            AutomationStep step
    ) {

        return switch (
                step.getActionType()
                ) {

            case NAVIGATE ->
                    line(
                            "page.navigate("
                                    + quote(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case CLICK ->
                    line(
                            locator(step)
                                    + ".click();"
                    );

            case FILL ->
                    line(
                            locator(step)
                                    + ".fill("
                                    + quote(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case SELECT ->
                    line(
                            locator(step)
                                    + ".selectOption("
                                    + quote(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case CHECK ->
                    line(
                            locator(step)
                                    + ".check();"
                    );

            case UNCHECK ->
                    line(
                            locator(step)
                                    + ".uncheck();"
                    );

            case PRESS ->
                    line(
                            locator(step)
                                    + ".press("
                                    + quote(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case WAIT ->
                    line(
                            "page.waitForTimeout("
                                    + parseWaitValue(
                                    step
                            )
                                    + ");"
                    );

            case ASSERT_VISIBLE ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isVisible();"
                    );

            case ASSERT_HIDDEN ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isHidden();"
                    );

            case ASSERT_TEXT ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").hasText("
                                    + quote(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_VALUE ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").hasValue("
                                    + quote(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_URL ->
                    line(
                            "assertThat(page).hasURL("
                                    + quote(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_TITLE ->
                    line(
                            "assertThat(page).hasTitle("
                                    + quote(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case API_GET ->
                    line(
                            "apiResponse = apiRequest.get("
                                    + quote(
                                    requireTarget(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case API_DELETE ->
                    line(
                            "apiResponse = apiRequest.delete("
                                    + quote(
                                    requireTarget(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case API_POST ->
                    apiRequestWithOptionalBody(
                            "post",
                            step
                    );

            case API_PUT ->
                    apiRequestWithOptionalBody(
                            "put",
                            step
                    );

            case API_PATCH ->
                    apiRequestWithOptionalBody(
                            "patch",
                            step
                    );

            case ASSERT_API_STATUS -> {

                int expectedStatus =
                        parseExpectedStatus(
                                step
                        );

                yield line(
                        "assertNotNull(apiResponse, \"No API response is available for status assertion\");"
                )
                        + line(
                        "assertEquals("
                                + expectedStatus
                                + ", apiResponse.status());"
                );
            }

            case ASSERT_API_BODY_CONTAINS ->
                    line(
                            "assertNotNull(apiResponse, \"No API response is available for body assertion\");"
                    )
                            + line(
                            "assertTrue(apiResponse.text().contains("
                                    + quote(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + "));"
                    );
        };
    }

    private String apiRequestWithOptionalBody(
            String method,
            AutomationStep step
    ) {

        String target =
                quote(
                        requireTarget(
                                step
                        )
                );

        if (
                step.getInputValue() == null
                        || step.getInputValue().isBlank()
        ) {

            return line(
                    "apiResponse = apiRequest."
                            + method
                            + "("
                            + target
                            + ");"
            );
        }

        return line(
                "apiResponse = apiRequest."
                        + method
                        + "("
                        + target
                        + ", RequestOptions.create().setData("
                        + quote(
                        step.getInputValue()
                )
                        + "));"
        );
    }

    private String locator(
            AutomationStep step
    ) {

        if (
                step.getSelectorStrategy() == null
        ) {
            throw new AutomationValidationException(
                    step.getActionType()
                            + " requires a selector"
            );
        }

        SelectorStrategy strategy =
                step.getSelectorStrategy();

        return switch (strategy) {

            case ROLE ->
                    roleLocator(
                            step
                    );

            case LABEL ->
                    exactLocator(
                            "getByLabel",
                            step.getSelectorValue(),
                            step.isSelectorExact(),
                            "GetByLabelOptions"
                    );

            case PLACEHOLDER ->
                    exactLocator(
                            "getByPlaceholder",
                            step.getSelectorValue(),
                            step.isSelectorExact(),
                            "GetByPlaceholderOptions"
                    );

            case TEXT ->
                    exactLocator(
                            "getByText",
                            step.getSelectorValue(),
                            step.isSelectorExact(),
                            "GetByTextOptions"
                    );

            case TEST_ID ->
                    "page.getByTestId("
                            + quote(
                            requireSelectorValue(
                                    step
                            )
                    )
                            + ")";

            case CSS ->
                    "page.locator("
                            + quote(
                            requireSelectorValue(
                                    step
                            )
                    )
                            + ")";

            case XPATH ->
                    "page.locator("
                            + quote(
                            "xpath="
                                    + requireSelectorValue(
                                    step
                            )
                    )
                            + ")";
        };
    }

    private String roleLocator(
            AutomationStep step
    ) {

        if (step.getSelectorRole() == null) {
            throw new AutomationValidationException(
                    "ROLE selector requires a UI element role"
            );
        }

        if (
                step.getSelectorName() == null
                        || step.getSelectorName().isBlank()
        ) {
            throw new AutomationValidationException(
                    "ROLE selector requires an accessible name"
            );
        }

        return "page.getByRole("
                + "AriaRole."
                + step.getSelectorRole().name()
                + ", new Page.GetByRoleOptions()"
                + ".setName("
                + quote(
                step.getSelectorName()
        )
                + ")"
                + ".setExact("
                + step.isSelectorExact()
                + "))";
    }

    private String exactLocator(
            String method,
            String value,
            boolean exact,
            String optionType
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {
            throw new AutomationValidationException(
                    method
                            + " requires a selector value"
            );
        }

        return "page."
                + method
                + "("
                + quote(value)
                + ", new Page."
                + optionType
                + "().setExact("
                + exact
                + "))";
    }

    private String requireInput(
            AutomationStep step
    ) {

        if (
                step.getInputValue() == null
                        || step.getInputValue().isBlank()
        ) {
            throw new AutomationValidationException(
                    step.getActionType()
                            + " requires an input value"
            );
        }

        return step.getInputValue();
    }

    private String requireExpected(
            AutomationStep step
    ) {

        if (
                step.getExpectedValue() == null
                        || step.getExpectedValue().isBlank()
        ) {
            throw new AutomationValidationException(
                    step.getActionType()
                            + " requires an expected value"
            );
        }

        return step.getExpectedValue();
    }

    private String requireTarget(
            AutomationStep step
    ) {

        if (
                step.getTarget() == null
                        || step.getTarget().isBlank()
        ) {
            throw new AutomationValidationException(
                    step.getActionType()
                            + " requires a target URL"
            );
        }

        return step.getTarget();
    }

    private String requireSelectorValue(
            AutomationStep step
    ) {

        if (
                step.getSelectorValue() == null
                        || step.getSelectorValue().isBlank()
        ) {
            throw new AutomationValidationException(
                    step.getSelectorStrategy()
                            + " requires a selector value"
            );
        }

        return step.getSelectorValue();
    }

    private double parseWaitValue(
            AutomationStep step
    ) {

        String value =
                requireInput(
                        step
                );

        try {

            double milliseconds =
                    Double.parseDouble(
                            value
                    );

            if (milliseconds < 0) {
                throw new NumberFormatException();
            }

            return milliseconds;

        } catch (
                NumberFormatException exception
        ) {

            throw new AutomationValidationException(
                    "WAIT value must be a non-negative number of milliseconds"
            );
        }
    }

    private int parseExpectedStatus(
            AutomationStep step
    ) {

        String value =
                requireExpected(
                        step
                );

        try {

            int status =
                    Integer.parseInt(
                            value
                    );

            if (
                    status < 100
                            || status > 599
            ) {
                throw new NumberFormatException();
            }

            return status;

        } catch (
                NumberFormatException exception
        ) {

            throw new AutomationValidationException(
                    "ASSERT_API_STATUS expected value must be a valid HTTP status code"
            );
        }
    }

    private boolean isUiAction(
            AutomationActionType type
    ) {

        return switch (type) {

            case API_GET,
                 API_POST,
                 API_PUT,
                 API_PATCH,
                 API_DELETE,
                 ASSERT_API_STATUS,
                 ASSERT_API_BODY_CONTAINS ->
                    false;

            default ->
                    true;
        };
    }

    private boolean isApiAction(
            AutomationActionType type
    ) {

        return !isUiAction(
                type
        );
    }

    private String line(
            String content
    ) {

        return "            "
                + content
                + "\n";
    }

    private String quote(
            String value
    ) {

        return "\""
                + escapeJava(
                value
        )
                + "\"";
    }

    private String escapeJava(
            String value
    ) {

        return value
                .replace(
                        "\\",
                        "\\\\"
                )
                .replace(
                        "\"",
                        "\\\""
                )
                .replace(
                        "\r",
                        "\\r"
                )
                .replace(
                        "\n",
                        "\\n"
                )
                .replace(
                        "\t",
                        "\\t"
                );
    }

    private String escapeComment(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .replace(
                        "\r",
                        " "
                )
                .replace(
                        "\n",
                        " "
                );
    }

    public record GeneratedCode(

            String className,

            String source
    ) {
    }
}