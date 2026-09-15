package com.testforge.testforge_backend.automation.generation;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
                "import com.microsoft.playwright.options.FormData;\n"
        );

        source.append(
                "import com.fasterxml.jackson.databind.JsonNode;\n"
        );

        source.append(
                "import com.fasterxml.jackson.databind.ObjectMapper;\n"
        );

        source.append(
                "import org.junit.jupiter.api.Test;\n"
        );

        source.append(
                "import java.nio.file.Paths;\n"
        );

        source.append(
                "import java.util.Base64;\n"
        );

        source.append(
                "import java.nio.charset.StandardCharsets;\n"
        );

        source.append(
                "import java.util.HashMap;\n"
        );

        source.append(
                "import java.util.Map;\n\n"
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
                "    void execute() throws Exception {\n"
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

        source.append(
                "            Map<String, String> runtimeData = new HashMap<>();\n\n"
        );

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
                    "            System.out.println(\"[TestForge] STEP "
                            + step.getStepOrder()
                            + " START - "
                            + step.getActionType()
                            + " | "
                            + escapeJavaString(step.getAutomationStepId())
                            + "\");\n"
            );

            source.append(
                    generateStep(
                            step
                    )
            );

            source.append(
                    "            System.out.println(\"[TestForge] STEP "
                            + step.getStepOrder()
                            + " DONE - "
                            + step.getActionType()
                            + "\");\n"
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
                "\n    private static String resolveRuntimeValue(String value, Map<String, String> runtimeData) {\n"
                        + "        if (value == null) return null;\n"
                        + "        String resolved = value;\n"
                        + "        for (Map.Entry<String, String> entry : runtimeData.entrySet()) {\n"
                        + "            resolved = resolved.replace(\"${\" + entry.getKey() + \"}\", entry.getValue());\n"
                        + "        }\n"
                        + "        int unresolvedStart = resolved.indexOf(\"${\");\n"
                        + "        if (unresolvedStart >= 0) {\n"
                        + "            int unresolvedEnd = resolved.indexOf('}', unresolvedStart + 2);\n"
                        + "            if (unresolvedEnd > unresolvedStart) {\n"
                        + "                String variableName = resolved.substring(unresolvedStart + 2, unresolvedEnd);\n"
                        + "                throw new IllegalStateException(\"Runtime variable is missing: \" + variableName);\n"
                        + "            }\n"
                        + "        }\n"
                        + "        return resolved;\n"
                        + "    }\n"
        );

        if (needsApi) {
            source.append(
                    "\n    private static String resolveSecretReference(String reference) {\n"
                            + "        if (reference == null || !reference.startsWith(\"${\") || !reference.endsWith(\"}\")) {\n"
                            + "            throw new IllegalArgumentException(\"Secret reference must use ${ENV_NAME} format\");\n"
                            + "        }\n"
                            + "        String envName = reference.substring(2, reference.length() - 1);\n"
                            + "        if (!envName.matches(\"[A-Z][A-Z0-9_]*\")) {\n"
                            + "            throw new IllegalArgumentException(\"Secret environment variable name is invalid: \" + envName);\n"
                            + "        }\n"
                            + "        String value = System.getenv(envName);\n"
                            + "        if (value == null || value.isBlank()) {\n"
                            + "            throw new IllegalStateException(\"Required secret environment variable is missing: \" + envName);\n"
                            + "        }\n"
                            + "        return value;\n"
                            + "    }\n\n"
                            + "    private static JsonNode jsonPath(JsonNode root, String path) {\n"
                            + "        JsonNode current = root;\n"
                            + "        for (String part : path.split(\"\\\\.\")) {\n"
                            + "            if (current == null || current.isMissingNode()) return null;\n"
                            + "            current = current.path(part);\n"
                            + "        }\n"
                            + "        return current;\n"
                            + "    }\n"
            );
        }

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
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case GO_BACK ->
                    line(
                            "page.goBack();"
                    );

            case GO_FORWARD ->
                    line(
                            "page.goForward();"
                    );

            case RELOAD ->
                    line(
                            "page.reload();"
                    );

            case CLICK ->
                    line(
                            locator(step)
                                    + ".click();"
                    );

            case CLICK_NEW_TAB ->
                    line(
                            "page = page.waitForPopup(() -> "
                                    + locator(step)
                                    + ".click());"
                    );

            case CLICK_DOWNLOAD ->
                    line(
                            "Download download"
                                    + step.getStepOrder()
                                    + " = page.waitForDownload(() -> "
                                    + locator(step)
                                    + ".click()); download"
                                    + step.getStepOrder()
                                    + ".saveAs(Paths.get("
                                    + runtimeValue(requireInput(step))
                                    + "));"
                    );

            case DOUBLE_CLICK ->
                    line(
                            locator(step)
                                    + ".dblclick();"
                    );

            case HOVER ->
                    line(
                            locator(step)
                                    + ".hover();"
                    );

            case FOCUS ->
                    line(
                            locator(step)
                                    + ".focus();"
                    );

            case FILL ->
                    line(
                            locator(step)
                                    + ".fill("
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case CLEAR ->
                    line(
                            locator(step)
                                    + ".clear();"
                    );

            case SELECT ->
                    line(
                            locator(step)
                                    + ".selectOption("
                                    + runtimeValue(
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
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case SET_INPUT_FILES ->
                    line(
                            locator(step)
                                    + ".setInputFiles(Paths.get("
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + "));"
                    );

            case FRAME_CLICK ->
                    line(
                            frameLocator(step)
                                    + ".click();"
                    );

            case FRAME_FILL ->
                    line(
                            frameLocator(step)
                                    + ".fill("
                                    + runtimeValue(requireInput(step))
                                    + ");"
                    );

            case ACCEPT_DIALOG ->
                    line(
                            "page.onDialog(dialog -> dialog.accept());"
                    );

            case DISMISS_DIALOG ->
                    line(
                            "page.onDialog(dialog -> dialog.dismiss());"
                    );

            case WAIT ->
                    line(
                            "page.waitForTimeout("
                                    + parseWaitValue(
                                    step
                            )
                                    + ");"
                    );

            case WAIT_FOR_SELECTOR ->
                    line(
                            locator(step)
                                    + ".waitFor();"
                    );

            case WAIT_FOR_URL ->
                    line(
                            "page.waitForURL("
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case WAIT_FOR_LOAD_STATE ->
                    line(
                            "page.waitForLoadState();"
                    );

            case TAKE_SCREENSHOT ->
                    line(
                            "page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("
                                    + runtimeValue(
                                    requireInput(
                                            step
                                    )
                            )
                                    + ")));"
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

            case ASSERT_ENABLED ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isEnabled();"
                    );

            case ASSERT_DISABLED ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isDisabled();"
                    );

            case ASSERT_EDITABLE ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isEditable();"
                    );

            case ASSERT_CHECKED ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").isChecked();"
                    );

            case ASSERT_TEXT ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").hasText("
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_CONTAINS_TEXT ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").containsText("
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_COUNT ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").hasCount("
                                    + parseExpectedCount(
                                    step
                            )
                                    + ");"
                    );

            case ASSERT_VALUE ->
                    line(
                            "assertThat("
                                    + locator(step)
                                    + ").hasValue("
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_URL ->
                    line(
                            "assertThat(page).hasURL("
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case ASSERT_TITLE ->
                    line(
                            "assertThat(page).hasTitle("
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + ");"
                    );

            case API_GET -> apiRequest("get", step);

            case API_DELETE -> apiRequest("delete", step);

            case API_POST -> apiRequest("post", step);

            case API_PUT -> apiRequest("put", step);

            case API_PATCH -> apiRequest("patch", step);

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
                                    + runtimeValue(
                                    requireExpected(
                                            step
                                    )
                            )
                                    + "));"
                    );

            case ASSERT_API_BODY_EQUALS ->
                    line("assertNotNull(apiResponse, \"No API response is available for body assertion\");")
                            + line("assertEquals(" + runtimeValue(requireExpected(step)) + ", apiResponse.text());");

            case ASSERT_API_JSON_FIELD_EQUALS -> {
                String suffix = String.valueOf(step.getStepOrder());
                yield line("assertNotNull(apiResponse, \"No API response is available for JSON assertion\");")
                        + line("JsonNode apiJson" + suffix + " = new ObjectMapper().readTree(apiResponse.text());")
                        + line("JsonNode apiJsonValue" + suffix + " = jsonPath(apiJson" + suffix + ", " + quote(requireTarget(step)) + ");")
                        + line("assertNotNull(apiJsonValue" + suffix + ", \"JSON path not found: " + escapeJava(requireTarget(step)) + "\");")
                        + line("assertEquals(" + runtimeValue(requireExpected(step)) + ", apiJsonValue" + suffix + ".isTextual() ? apiJsonValue" + suffix + ".asText() : apiJsonValue" + suffix + ".toString());");
            }

            case ASSERT_API_HEADER ->
                    line("assertNotNull(apiResponse, \"No API response is available for header assertion\");")
                            + line("assertEquals(" + runtimeValue(requireExpected(step)) + ", apiResponse.headers().get(" + runtimeValue(requireTarget(step)) + "));");

            case EXTRACT_API_JSON_VALUE -> {
                String suffix = String.valueOf(step.getStepOrder());
                yield line("assertNotNull(apiResponse, \"No API response is available for JSON extraction\");")
                        + line("JsonNode extractedJson" + suffix + " = new ObjectMapper().readTree(apiResponse.text());")
                        + line("JsonNode extractedValue" + suffix + " = jsonPath(extractedJson" + suffix + ", " + quote(requireTarget(step)) + ");")
                        + line("assertNotNull(extractedValue" + suffix + ", \"JSON path not found: " + escapeJava(requireTarget(step)) + "\");")
                        + line("runtimeData.put(" + quote(requireInput(step)) + ", extractedValue" + suffix + ".isTextual() ? extractedValue" + suffix + ".asText() : extractedValue" + suffix + ".toString());");
            }
        };
    }

    private String apiRequest(
            String method,
            AutomationStep step
    ) {
        StringBuilder code = new StringBuilder();
        ApiConfig config = parseApiConfig(step.getApiConfig());

        String suffix = String.valueOf(step.getStepOrder());
        String optionsVar = "apiOptions" + suffix;
        String formVar = "apiForm" + suffix;
        code.append(line("RequestOptions " + optionsVar + " = RequestOptions.create();"));

        for (Map.Entry<String, String> header : config.headers().entrySet()) {
            code.append(line(
                    optionsVar + ".setHeader(" + quote(header.getKey()) + ", resolveRuntimeValue("
                            + quote(header.getValue()) + ", runtimeData));"
            ));
        }

        for (Map.Entry<String, String> query : config.queryParams().entrySet()) {
            code.append(line(
                    optionsVar + ".setQueryParam(" + quote(query.getKey()) + ", resolveRuntimeValue("
                            + quote(query.getValue()) + ", runtimeData));"
            ));
        }

        ApiAuth auth = config.auth();
        switch (auth.type()) {
            case "NONE" -> {
                // No authentication.
            }
            case "BASIC" -> {
                String username = requireConfigValue(auth.username(), "BASIC username");
                String secretRef = requireSecretReference(auth.passwordSecretRef(), "BASIC passwordSecretRef");
                String credentialsVar = "basicCredentials" + suffix;
                code.append(line(
                        "String " + credentialsVar + " = resolveRuntimeValue(" + quote(username)
                                + ", runtimeData) + \":\" + resolveSecretReference(" + quote(secretRef) + ");"
                ));
                code.append(line(
                        optionsVar + ".setHeader(\"Authorization\", \"Basic \" + Base64.getEncoder().encodeToString("
                                + credentialsVar + ".getBytes(StandardCharsets.UTF_8)));"
                ));
            }
            case "BEARER_TOKEN" -> {
                String secretRef = requireSecretReference(auth.tokenSecretRef(), "Bearer tokenSecretRef");
                code.append(line(
                        optionsVar + ".setHeader(\"Authorization\", \"Bearer \" + resolveSecretReference("
                                + quote(secretRef) + "));"
                ));
            }
            case "API_KEY" -> {
                String keyName = requireConfigValue(auth.keyName(), "API key name");
                String secretRef = requireSecretReference(auth.valueSecretRef(), "API key valueSecretRef");
                String location = auth.location() == null ? "HEADER" : auth.location().toUpperCase(Locale.ROOT);
                if ("HEADER".equals(location)) {
                    code.append(line(
                            optionsVar + ".setHeader(" + quote(keyName) + ", resolveSecretReference("
                                    + quote(secretRef) + "));"
                    ));
                } else if ("QUERY".equals(location)) {
                    code.append(line(
                            optionsVar + ".setQueryParam(" + quote(keyName) + ", resolveSecretReference("
                                    + quote(secretRef) + "));"
                    ));
                } else {
                    throw new AutomationValidationException("API key location must be HEADER or QUERY");
                }
            }
            default -> throw new AutomationValidationException(
                    "Unsupported API authentication type: " + auth.type()
            );
        }

        String body = config.body();
        if (body != null && !body.isBlank() && !"NONE".equals(config.bodyType())) {
            switch (config.bodyType()) {
                case "JSON" -> {
                    code.append(line(optionsVar + ".setHeader(\"Content-Type\", \"application/json\");"));
                    code.append(line(optionsVar + ".setData(resolveRuntimeValue(" + quote(body) + ", runtimeData));"));
                }
                case "TEXT" -> {
                    code.append(line(optionsVar + ".setHeader(\"Content-Type\", \"text/plain\");"));
                    code.append(line(optionsVar + ".setData(resolveRuntimeValue(" + quote(body) + ", runtimeData));"));
                }
                case "FORM" -> {
                    Map<String, String> form = parseStringMap(body, "API form body");
                    code.append(line("FormData " + formVar + " = FormData.create();"));
                    for (Map.Entry<String, String> entry : form.entrySet()) {
                        code.append(line(formVar + ".set(" + quote(entry.getKey()) + ", resolveRuntimeValue("
                                + quote(entry.getValue()) + ", runtimeData));"));
                    }
                    code.append(line(optionsVar + ".setForm(" + formVar + ");"));
                }
                default -> throw new AutomationValidationException(
                        "Unsupported API body type: " + config.bodyType()
                );
            }
        }

        code.append(line(
                "apiResponse = apiRequest." + method + "(resolveRuntimeValue("
                        + quote(requireTarget(step)) + ", runtimeData), " + optionsVar + ");"
        ));
        return code.toString();
    }

    private ApiConfig parseApiConfig(String json) {
        if (json == null || json.isBlank()) {
            return new ApiConfig(Map.of(), Map.of(), "NONE", null, ApiAuth.none());
        }
        try {
            com.fasterxml.jackson.databind.JsonNode root =
                    new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
            return new ApiConfig(
                    jsonObjectToMap(root.path("headers")),
                    jsonObjectToMap(root.path("queryParams")),
                    root.path("bodyType").asText("NONE").toUpperCase(Locale.ROOT),
                    root.path("body").isMissingNode() || root.path("body").isNull()
                            ? null : root.path("body").asText(),
                    parseApiAuth(root.path("auth"))
            );
        } catch (Exception exception) {
            throw new AutomationValidationException("Invalid API configuration JSON");
        }
    }

    private Map<String, String> jsonObjectToMap(com.fasterxml.jackson.databind.JsonNode node) {
        Map<String, String> values = new LinkedHashMap<>();
        if (node != null && node.isObject()) {
            node.fields().forEachRemaining(entry -> values.put(entry.getKey(), entry.getValue().asText()));
        }
        return values;
    }

    private Map<String, String> parseStringMap(String json, String label) {
        try {
            com.fasterxml.jackson.databind.JsonNode node =
                    new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
            if (!node.isObject()) {
                throw new AutomationValidationException(label + " must be a JSON object");
            }
            return jsonObjectToMap(node);
        } catch (AutomationValidationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AutomationValidationException(label + " must be valid JSON");
        }
    }

    private ApiAuth parseApiAuth(com.fasterxml.jackson.databind.JsonNode auth) {
        if (auth == null || auth.isMissingNode() || auth.isNull()) {
            return ApiAuth.none();
        }
        if (!auth.isObject()) {
            throw new AutomationValidationException("API authentication configuration must be a JSON object");
        }
        return new ApiAuth(
                auth.path("type").asText("NONE").toUpperCase(Locale.ROOT),
                nullableText(auth, "username"),
                nullableText(auth, "passwordSecretRef"),
                nullableText(auth, "tokenSecretRef"),
                nullableText(auth, "keyName"),
                nullableText(auth, "valueSecretRef"),
                nullableText(auth, "location")
        );
    }

    private String nullableText(com.fasterxml.jackson.databind.JsonNode node, String field) {
        com.fasterxml.jackson.databind.JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }

    private String requireConfigValue(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new AutomationValidationException(label + " is required");
        }
        return value;
    }

    private String requireSecretReference(String value, String label) {
        String reference = requireConfigValue(value, label).trim();
        if (!reference.matches("^\\$\\{[A-Z][A-Z0-9_]*}$")) {
            throw new AutomationValidationException(label + " must use ${ENV_NAME} format");
        }
        return reference;
    }

    private record ApiConfig(
            Map<String, String> headers,
            Map<String, String> queryParams,
            String bodyType,
            String body,
            ApiAuth auth
    ) {}

    private record ApiAuth(
            String type,
            String username,
            String passwordSecretRef,
            String tokenSecretRef,
            String keyName,
            String valueSecretRef,
            String location
    ) {
        private static ApiAuth none() {
            return new ApiAuth("NONE", null, null, null, null, null, null);
        }
    }

    private String frameLocator(
            AutomationStep step
    ) {
        String frame = "page.frameLocator("
                + runtimeValue(requireTarget(step))
                + ")";

        return switch (step.getSelectorStrategy()) {
            case CSS -> frame
                    + ".locator("
                    + runtimeValue(requireSelectorValue(step))
                    + ")";
            case XPATH -> frame
                    + ".locator(\"xpath=\" + "
                    + runtimeValue(requireSelectorValue(step))
                    + ")";
            default -> throw new AutomationValidationException(
                    step.getActionType()
                            + " currently requires a CSS or XPATH element selector"
            );
        };
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
                            + runtimeValue(
                            requireSelectorValue(
                                    step
                            )
                    )
                            + ")";

            case CSS ->
                    "page.locator("
                            + runtimeValue(
                            requireSelectorValue(
                                    step
                            )
                    )
                            + ")";

            case XPATH ->
                    "page.locator(\"xpath=\" + "
                            + runtimeValue(
                            requireSelectorValue(
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
                + runtimeValue(
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
                + runtimeValue(value)
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
                 ASSERT_API_BODY_CONTAINS,
                 ASSERT_API_BODY_EQUALS,
                 ASSERT_API_JSON_FIELD_EQUALS,
                 ASSERT_API_HEADER,
                 EXTRACT_API_JSON_VALUE ->
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

    private String runtimeValue(
            String value
    ) {
        return "resolveRuntimeValue("
                + quote(value)
                + ", runtimeData)";
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
    private int parseExpectedCount(
            AutomationStep step
    ) {

        try {
            int count = Integer.parseInt(
                    requireExpected(step).trim()
            );

            if (count < 0) {
                throw new AutomationValidationException(
                        "ASSERT_COUNT expected value must be zero or greater"
                );
            }

            return count;
        } catch (NumberFormatException exception) {
            throw new AutomationValidationException(
                    "ASSERT_COUNT expected value must be a whole number"
            );
        }
    }

}