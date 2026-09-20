package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.automation.dto.CreateAutomationScriptRequest;
import com.testforge.testforge_backend.automation.dto.CreateAutomationStepRequest;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.service.AutomationService;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.dto.TestStepAutomationChange;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;
import java.util.UUID;

@Service
public class TestStepAutomationService {
    private final AutomationService automation;
    private final AutomationScriptRepository scripts;
    private final AutomationStepRepository steps;

    public TestStepAutomationService(AutomationService automation, AutomationScriptRepository scripts,
                                     AutomationStepRepository steps) {
        this.automation = automation;
        this.scripts = scripts;
        this.steps = steps;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void apply(TestStep step, TestStepAutomationChange change) {
        if (change == null) return;
        if ((change.configuration() != null) == change.removeExisting()) {
            throw new AutomationValidationException("Choose automation configuration or confirm its removal.");
        }
        var mappings = steps.findByTestStepIdOrderByStepOrderAsc(step.getId());
        if (mappings.size() > 1) throw new AutomationConflictException("Test Step has multiple automation mappings. Reload its configuration.");
        var existing = mappings.isEmpty() ? null : mappings.get(0);
        if (!Objects.equals(existing == null ? null : existing.getId(), change.expectedAutomationStepId())) {
            throw new AutomationConflictException("Automation configuration changed. Reload the Test Step before saving.");
        }
        if (change.removeExisting()) {
            if (existing != null) automation.deleteStep(existing.getId());
            return;
        }
        var testCase = step.getTestCase();
        if (!testCase.getTestScenario().isAutomatable()) {
            throw new AutomationConflictException("Automation is not enabled for this Scenario.");
        }
        var configuration = change.configuration();
        // The explicitly selected Step action determines its category; retain mixed-case support.
        var selectedType = configuration.actionType().name().contains("API_")
                ? com.testforge.testforge_backend.domain.enums.AutomationType.API
                : com.testforge.testforge_backend.domain.enums.AutomationType.UI;
        var currentType = testCase.getAutomationType();
        testCase.setAutomationType(currentType == com.testforge.testforge_backend.domain.enums.AutomationType.MANUAL
                ? selectedType : currentType == selectedType ? currentType
                : com.testforge.testforge_backend.domain.enums.AutomationType.UI_API);
        if (existing != null) {
            automation.updateStep(existing.getId(), configuration);
            return;
        }
        Long scriptId = scripts.findByTestCaseId(testCase.getId()).map(script -> script.getId()).orElseGet(() ->
                automation.createScript(testCase.getId(), new CreateAutomationScriptRequest(
                        "AUTO-" + UUID.randomUUID(), testCase.getName())).id());
        automation.createStep(scriptId, new CreateAutomationStepRequest(
                "ASTEP-" + UUID.randomUUID(), step.getId(), configuration.stepOrder(), configuration.actionType(),
                configuration.target(), configuration.selectorStrategy(), configuration.selectorValue(),
                configuration.selectorRole(), configuration.selectorName(), configuration.selectorExact(),
                configuration.inputValue(), configuration.expectedValue(), configuration.apiConfig()));
    }
}
