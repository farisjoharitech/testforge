package com.testforge.testforge_backend.automation.generation;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlaywrightCapabilityRegressionTest {

    private final PlaywrightJavaGenerator generator =
            new PlaywrightJavaGenerator();

    @Test
    void shouldGenerateEveryDeclaredAutomationAction() {

        AutomationScript script =
                new AutomationScript(
                        "AUTO-CAPABILITY-MATRIX",
                        null,
                        "Capability Matrix"
                );

        List<AutomationStep> steps =
                new ArrayList<>();

        int order = 1;

        for (AutomationActionType actionType : AutomationActionType.values()) {
            steps.add(
                    validStep(
                            order++,
                            actionType
                    )
            );
        }

        PlaywrightJavaGenerator.GeneratedCode generated =
                assertDoesNotThrow(
                        () -> generator.generate(
                                script,
                                steps
                        )
                );

        assertEquals(
                AutomationActionType.values().length,
                steps.size()
        );

        for (AutomationActionType actionType : AutomationActionType.values()) {
            assertTrue(
                    generated.source().contains(
                            " - " + actionType + " | "
                    ),
                    "Generated source should contain action " + actionType
            );
        }
    }

    @Test
    void shouldGenerateBasicAuthentication() {

        String source = generateSingleApiStep(
                """
                {
                  "headers": {},
                  "queryParams": {},
                  "bodyType": "NONE",
                  "body": null,
                  "auth": {
                    "type": "BASIC",
                    "username": "api-user",
                    "passwordSecretRef": "${API_PASSWORD}"
                  }
                }
                """
        );

        assertTrue(source.contains("Authorization"));
        assertTrue(source.contains("Basic "));
        assertTrue(source.contains("API_PASSWORD"));
    }

    @Test
    void shouldGenerateBearerAuthentication() {

        String source = generateSingleApiStep(
                """
                {
                  "headers": {},
                  "queryParams": {},
                  "bodyType": "NONE",
                  "body": null,
                  "auth": {
                    "type": "BEARER_TOKEN",
                    "tokenSecretRef": "${API_TOKEN}"
                  }
                }
                """
        );

        assertTrue(source.contains("Bearer "));
        assertTrue(source.contains("API_TOKEN"));
    }

    @Test
    void shouldGenerateApiKeyHeaderAuthentication() {

        String source = generateSingleApiStep(
                """
                {
                  "headers": {},
                  "queryParams": {},
                  "bodyType": "NONE",
                  "body": null,
                  "auth": {
                    "type": "API_KEY",
                    "keyName": "X-API-Key",
                    "valueSecretRef": "${API_KEY}",
                    "location": "HEADER"
                  }
                }
                """
        );

        assertTrue(source.contains("X-API-Key"));
        assertTrue(source.contains("setHeader"));
        assertTrue(source.contains("API_KEY"));
    }

    @Test
    void shouldGenerateApiKeyQueryAuthentication() {

        String source = generateSingleApiStep(
                """
                {
                  "headers": {},
                  "queryParams": {},
                  "bodyType": "NONE",
                  "body": null,
                  "auth": {
                    "type": "API_KEY",
                    "keyName": "api_key",
                    "valueSecretRef": "${API_KEY}",
                    "location": "QUERY"
                  }
                }
                """
        );

        assertTrue(source.contains("api_key"));
        assertTrue(source.contains("setQueryParam"));
        assertTrue(source.contains("API_KEY"));
    }

    @Test
    void shouldGenerateJsonBodyHeadersAndQueryParameters() {

        AutomationScript script =
                new AutomationScript(
                        "AUTO-API-CONFIG",
                        null,
                        "API Config"
                );

        AutomationStep step =
                validStep(
                        1,
                        AutomationActionType.API_POST
                );

        step.setApiConfig(
                """
                {
                  "headers": {
                    "X-Tenant": "qa"
                  },
                  "queryParams": {
                    "include": "details"
                  },
                  "bodyType": "JSON",
                  "body": "{\\"name\\":\\"${CUSTOMER_NAME}\\"}",
                  "auth": {
                    "type": "NONE"
                  }
                }
                """
        );

        String source =
                generator.generate(
                        script,
                        List.of(step)
                ).source();

        assertTrue(source.contains("X-Tenant"));
        assertTrue(source.contains("include"));
        assertTrue(source.contains("application/json"));
        assertTrue(source.contains("CUSTOMER_NAME"));
    }

    @Test
    void shouldGenerateApiJsonExtractionIntoRuntimeData() {

        AutomationScript script =
                new AutomationScript(
                        "AUTO-EXTRACT",
                        null,
                        "Extract Runtime Value"
                );

        AutomationStep step =
                validStep(
                        1,
                        AutomationActionType.EXTRACT_API_JSON_VALUE
                );

        String source =
                generator.generate(
                        script,
                        List.of(step)
                ).source();

        assertTrue(source.contains("jsonPath"));
        assertTrue(source.contains("runtimeData.put"));
        assertTrue(source.contains("ORDER_ID"));
    }

    private String generateSingleApiStep(
            String apiConfig
    ) {

        AutomationScript script =
                new AutomationScript(
                        "AUTO-AUTH",
                        null,
                        "Authentication"
                );

        AutomationStep step =
                validStep(
                        1,
                        AutomationActionType.API_GET
                );

        step.setApiConfig(apiConfig);

        return generator.generate(
                script,
                List.of(step)
        ).source();
    }

    private AutomationStep validStep(
            int order,
            AutomationActionType actionType
    ) {

        AutomationStep step =
                new AutomationStep(
                        "AUTO-STEP-" + order,
                        null,
                        null,
                        order,
                        actionType
                );

        step.setSelectorExact(false);

        switch (actionType) {
            case NAVIGATE ->
                    step.setInputValue("${BASE_URL}/login");

            case GO_BACK,
                 GO_FORWARD,
                 RELOAD,
                 ACCEPT_DIALOG,
                 DISMISS_DIALOG,
                 WAIT_FOR_LOAD_STATE -> {
            }

            case CLICK,
                 CLICK_NEW_TAB,
                 DOUBLE_CLICK,
                 HOVER,
                 FOCUS,
                 CLEAR,
                 CHECK,
                 UNCHECK,
                 WAIT_FOR_SELECTOR,
                 ASSERT_VISIBLE,
                 ASSERT_HIDDEN,
                 ASSERT_ENABLED,
                 ASSERT_DISABLED,
                 ASSERT_EDITABLE,
                 ASSERT_CHECKED ->
                    setLabelSelector(step);

            case CLICK_DOWNLOAD -> {
                setLabelSelector(step);
                step.setInputValue("target/download.bin");
            }

            case FILL -> {
                setLabelSelector(step);
                step.setInputValue("value");
            }

            case SELECT -> {
                setLabelSelector(step);
                step.setInputValue("option");
            }

            case PRESS -> {
                setLabelSelector(step);
                step.setInputValue("Enter");
            }

            case SET_INPUT_FILES -> {
                setLabelSelector(step);
                step.setInputValue("target/upload.txt");
            }

            case FRAME_CLICK -> {
                setCssSelector(step);
                step.setTarget("iframe#payment");
            }

            case FRAME_FILL -> {
                setCssSelector(step);
                step.setTarget("iframe#payment");
                step.setInputValue("4111111111111111");
            }

            case WAIT ->
                    step.setInputValue("100");

            case WAIT_FOR_URL ->
                    step.setInputValue("${BASE_URL}/dashboard");

            case TAKE_SCREENSHOT ->
                    step.setInputValue("target/screenshot.png");

            case ASSERT_TEXT,
                 ASSERT_CONTAINS_TEXT,
                 ASSERT_VALUE -> {
                setLabelSelector(step);
                step.setExpectedValue("expected");
            }

            case ASSERT_COUNT -> {
                setLabelSelector(step);
                step.setExpectedValue("1");
            }

            case ASSERT_URL ->
                    step.setExpectedValue("${BASE_URL}/dashboard");

            case ASSERT_TITLE ->
                    step.setExpectedValue("Dashboard");

            case API_GET,
                 API_POST,
                 API_PUT,
                 API_PATCH,
                 API_DELETE -> {
                step.setTarget("${API_BASE_URL}/customers");
                step.setApiConfig(
                        """
                        {
                          "headers": {},
                          "queryParams": {},
                          "bodyType": "NONE",
                          "body": null,
                          "auth": {"type": "NONE"}
                        }
                        """
                );
            }

            case ASSERT_API_STATUS ->
                    step.setExpectedValue("200");

            case ASSERT_API_BODY_CONTAINS,
                 ASSERT_API_BODY_EQUALS ->
                    step.setExpectedValue("success");

            case ASSERT_API_JSON_FIELD_EQUALS -> {
                step.setTarget("data.status");
                step.setExpectedValue("ACTIVE");
            }

            case ASSERT_API_HEADER -> {
                step.setTarget("Content-Type");
                step.setExpectedValue("application/json");
            }

            case EXTRACT_API_JSON_VALUE -> {
                step.setTarget("data.id");
                step.setInputValue("ORDER_ID");
            }
        }

        return step;
    }

    private void setLabelSelector(
            AutomationStep step
    ) {
        step.setSelectorStrategy(
                SelectorStrategy.LABEL
        );
        step.setSelectorValue("Control");
    }

    private void setCssSelector(
            AutomationStep step
    ) {
        step.setSelectorStrategy(
                SelectorStrategy.CSS
        );
        step.setSelectorValue("button.submit");
    }
}
