package com.testforge.testforge_backend.automation.generation;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PlaywrightFailureDiagnosticsGenerationTest {

    private final PlaywrightJavaGenerator generator =
            new PlaywrightJavaGenerator();

    @Test
    void shouldGenerateFailureScreenshotAndTraceForUiAutomation() {
        AutomationScript script =
                new AutomationScript(
                        "AUTO-DIAGNOSTICS",
                        null,
                        "Failure Diagnostics"
                );

        AutomationStep step =
                new AutomationStep(
                        "AUTO-STEP-001",
                        script,
                        null,
                        1,
                        AutomationActionType.CLICK
                );

        step.setTarget("Login");
        step.setSelectorStrategy(SelectorStrategy.TEXT);
        step.setSelectorValue("Login");
        step.setSelectorExact(true);

        String source =
                generator.generate(
                        script,
                        List.of(step)
                ).source();

        assertTrue(
                source.contains(
                        "context.tracing().start"
                )
        );

        assertTrue(
                source.contains(
                        "testforge-artifacts"
                )
        );

        assertTrue(
                source.contains(
                        "failure.png"
                )
        );

        assertTrue(
                source.contains(
                        "trace.zip"
                )
        );

        assertTrue(
                source.contains(
                        "setFullPage(true)"
                )
        );
    }
}
