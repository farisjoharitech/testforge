package com.testforge.testforge_backend.automation.integration;

import com.testforge.testforge_backend.automation.dto.AutomationScriptResponse;
import com.testforge.testforge_backend.automation.dto.AutomationStepResponse;
import com.testforge.testforge_backend.automation.dto.CreateAutomationScriptRequest;
import com.testforge.testforge_backend.automation.dto.CreateAutomationStepRequest;
import com.testforge.testforge_backend.automation.dto.UpdateAutomationStepRequest;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import com.testforge.testforge_backend.automation.service.AutomationService;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.domain.enums.ApprovalStatus;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.RequirementPriority;
import com.testforge.testforge_backend.domain.enums.RequirementStatus;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestCaseStatus;
import com.testforge.testforge_backend.domain.enums.TestPlanStatus;
import com.testforge.testforge_backend.domain.enums.TestScenarioPriority;
import com.testforge.testforge_backend.domain.enums.TestScenarioStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class AutomationIntegrationTest {

    @Autowired
    private AutomationService automationService;

    @Autowired
    private TestPlanRepository testPlanRepository;

    @Autowired
    private RequirementRepository requirementRepository;

    @Autowired
    private TestScenarioRepository testScenarioRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestStepRepository testStepRepository;

    @Autowired
    private AutomationScriptRepository automationScriptRepository;

    @Autowired
    private AutomationStepRepository automationStepRepository;

    @Test
    void shouldCreateAndPersistAutomationScript() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-001"
                );

        CreateAutomationScriptRequest request =
                new CreateAutomationScriptRequest(
                        uniqueId(
                                "AUTOSCRIPT"
                        ),
                        "Login Automation"
                );

        AutomationScriptResponse response =
                automationService.createScript(
                        testCase.getId(),
                        request
                );

        assertNotNull(
                response.id()
        );

        assertEquals(
                testCase.getId(),
                response.testCaseId()
        );

        assertEquals(
                "Login Automation",
                response.name()
        );

        assertTrue(
                automationScriptRepository
                        .findById(
                                response.id()
                        )
                        .isPresent()
        );
    }

    @Test
    void shouldPersistValidFillAutomationStep() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-002"
                );

        TestStep testStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-001",
                        1,
                        "Enter username"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        testStep.getId(),
                        1,
                        AutomationActionType.FILL,
                        "Username field",
                        SelectorStrategy.LABEL,
                        "Username",
                        null,
                        null,
                        false,
                        "${TEST_USERNAME}",
                        null
                );

        AutomationStepResponse response =
                automationService.createStep(
                        script.id(),
                        request
                );

        assertNotNull(
                response.id()
        );

        assertEquals(
                testStep.getId(),
                response.sourceTestStepId()
        );

        assertEquals(
                AutomationActionType.FILL,
                response.actionType()
        );

        assertEquals(
                SelectorStrategy.LABEL,
                response.selectorStrategy()
        );

        assertEquals(
                "Username",
                response.selectorValue()
        );

        assertEquals(
                "${TEST_USERNAME}",
                response.inputValue()
        );

        assertTrue(
                automationStepRepository
                        .findById(
                                response.id()
                        )
                        .isPresent()
        );
    }

    @Test
    void shouldReturnAutomationStepsOrderedByStepOrder() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-003"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-002",
                        1,
                        "Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        createClickStep(
                script.id(),
                sourceStep.getId(),
                3,
                "Third"
        );

        createClickStep(
                script.id(),
                sourceStep.getId(),
                1,
                "First"
        );

        createClickStep(
                script.id(),
                sourceStep.getId(),
                2,
                "Second"
        );

        List<AutomationStepResponse> steps =
                automationService.getSteps(
                        script.id()
                );

        assertEquals(
                3,
                steps.size()
        );

        assertEquals(
                1,
                steps.get(0).stepOrder()
        );

        assertEquals(
                2,
                steps.get(1).stepOrder()
        );

        assertEquals(
                3,
                steps.get(2).stepOrder()
        );
    }

    @Test
    void shouldRejectSourceTestStepFromAnotherTestCase() {

        TestCase firstTestCase =
                createTestCase(
                        "TC-AUTO-004-A"
                );

        TestCase secondTestCase =
                createTestCase(
                        "TC-AUTO-004-B"
                );

        TestStep secondCaseStep =
                createTestStep(
                        secondTestCase,
                        "STEP-AUTO-003",
                        1,
                        "Click Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        firstTestCase
                );

        CreateAutomationStepRequest request =
                createClickRequest(
                        secondCaseStep.getId(),
                        1,
                        "Login"
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createStep(
                                script.id(),
                                request
                        )
        );
    }

    @Test
    void shouldRejectSecondAutomationScriptForSameTestCase() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-005"
                );

        createAutomationScript(
                testCase
        );

        CreateAutomationScriptRequest secondRequest =
                new CreateAutomationScriptRequest(
                        uniqueId(
                                "AUTOSCRIPT"
                        ),
                        "Second Automation"
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createScript(
                                testCase.getId(),
                                secondRequest
                        )
        );
    }

    @Test
    void shouldRejectDuplicateAutomationScriptBusinessId() {

        TestCase firstTestCase =
                createTestCase(
                        "TC-AUTO-006-A"
                );

        TestCase secondTestCase =
                createTestCase(
                        "TC-AUTO-006-B"
                );

        String businessId =
                uniqueId(
                        "AUTOSCRIPT"
                );

        automationService.createScript(
                firstTestCase.getId(),
                new CreateAutomationScriptRequest(
                        businessId,
                        "First Automation"
                )
        );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createScript(
                                secondTestCase.getId(),
                                new CreateAutomationScriptRequest(
                                        businessId,
                                        "Second Automation"
                                )
                        )
        );
    }

    @Test
    void shouldRejectDuplicateAutomationStepBusinessId() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-007"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-004",
                        1,
                        "Click Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        String businessId =
                uniqueId(
                        "AUTO-STEP"
                );

        CreateAutomationStepRequest first =
                new CreateAutomationStepRequest(
                        businessId,
                        sourceStep.getId(),
                        1,
                        AutomationActionType.CLICK,
                        "Login button",
                        SelectorStrategy.TEXT,
                        "Login",
                        null,
                        null,
                        false,
                        null,
                        null
                );

        automationService.createStep(
                script.id(),
                first
        );

        CreateAutomationStepRequest second =
                new CreateAutomationStepRequest(
                        businessId,
                        sourceStep.getId(),
                        2,
                        AutomationActionType.CLICK,
                        "Submit button",
                        SelectorStrategy.TEXT,
                        "Submit",
                        null,
                        null,
                        false,
                        null,
                        null
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createStep(
                                script.id(),
                                second
                        )
        );
    }

    @Test
    void shouldRejectDuplicateStepOrderWithinSameScript() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-008"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-005",
                        1,
                        "Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        createClickStep(
                script.id(),
                sourceStep.getId(),
                1,
                "Login"
        );

        CreateAutomationStepRequest duplicateOrder =
                createClickRequest(
                        sourceStep.getId(),
                        1,
                        "Submit"
                );

        assertThrows(
                AutomationConflictException.class,
                () ->
                        automationService.createStep(
                                script.id(),
                                duplicateOrder
                        )
        );
    }

    @Test
    void shouldAllowMultipleAutomationStepsForSameSourceTestStep() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-009"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-006",
                        1,
                        "Log in with valid credentials"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        CreateAutomationStepRequest username =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        sourceStep.getId(),
                        1,
                        AutomationActionType.FILL,
                        "Username",
                        SelectorStrategy.LABEL,
                        "Username",
                        null,
                        null,
                        false,
                        "${TEST_USERNAME}",
                        null
                );

        CreateAutomationStepRequest password =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        sourceStep.getId(),
                        2,
                        AutomationActionType.FILL,
                        "Password",
                        SelectorStrategy.LABEL,
                        "Password",
                        null,
                        null,
                        false,
                        "${TEST_PASSWORD}",
                        null
                );

        CreateAutomationStepRequest login =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        sourceStep.getId(),
                        3,
                        AutomationActionType.CLICK,
                        "Login button",
                        SelectorStrategy.ROLE,
                        null,
                        UiElementRole.BUTTON,
                        "Login",
                        true,
                        null,
                        null
                );

        automationService.createStep(
                script.id(),
                username
        );

        automationService.createStep(
                script.id(),
                password
        );

        automationService.createStep(
                script.id(),
                login
        );

        List<AutomationStepResponse> steps =
                automationService.getSteps(
                        script.id()
                );

        assertEquals(
                3,
                steps.size()
        );

        assertTrue(
                steps.stream()
                        .allMatch(
                                step ->
                                        step.sourceTestStepId()
                                                .equals(
                                                        sourceStep.getId()
                                                )
                        )
        );
    }

    @Test
    void shouldRejectFillWithoutSelector() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-010"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-007",
                        1,
                        "Enter username"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        sourceStep.getId(),
                        1,
                        AutomationActionType.FILL,
                        "Username field",
                        null,
                        null,
                        null,
                        null,
                        false,
                        "john",
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () ->
                        automationService.createStep(
                                script.id(),
                                request
                        )
        );

        assertEquals(
                0,
                automationStepRepository
                        .findByAutomationScriptIdOrderByStepOrderAsc(
                                script.id()
                        )
                        .size()
        );
    }

    @Test
    void shouldRejectInvalidRoleSelector() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-011"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-008",
                        1,
                        "Click Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        CreateAutomationStepRequest request =
                new CreateAutomationStepRequest(
                        uniqueId(
                                "AUTO-STEP"
                        ),
                        sourceStep.getId(),
                        1,
                        AutomationActionType.CLICK,
                        "Login button",
                        SelectorStrategy.ROLE,
                        "button.login",
                        UiElementRole.BUTTON,
                        "Login",
                        true,
                        null,
                        null
                );

        assertThrows(
                AutomationValidationException.class,
                () ->
                        automationService.createStep(
                                script.id(),
                                request
                        )
        );
    }

    @Test
    void shouldUpdatePersistedAutomationStep() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-012"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-009",
                        1,
                        "Enter username"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        AutomationStepResponse created =
                automationService.createStep(
                        script.id(),
                        new CreateAutomationStepRequest(
                                uniqueId(
                                        "AUTO-STEP"
                                ),
                                sourceStep.getId(),
                                1,
                                AutomationActionType.FILL,
                                "Username",
                                SelectorStrategy.LABEL,
                                "Username",
                                null,
                                null,
                                false,
                                "old-value",
                                null
                        )
                );

        UpdateAutomationStepRequest update =
                new UpdateAutomationStepRequest(
                        1,
                        AutomationActionType.FILL,
                        "Username",
                        SelectorStrategy.TEST_ID,
                        "username-input",
                        null,
                        null,
                        false,
                        "new-value",
                        null
                );

        AutomationStepResponse updated =
                automationService.updateStep(
                        created.id(),
                        update
                );

        assertEquals(
                SelectorStrategy.TEST_ID,
                updated.selectorStrategy()
        );

        assertEquals(
                "username-input",
                updated.selectorValue()
        );

        assertEquals(
                "new-value",
                updated.inputValue()
        );

        assertEquals(
                sourceStep.getId(),
                updated.sourceTestStepId()
        );

        AutomationStepResponse reloaded =
                automationService.getStep(
                        created.id()
                );

        assertEquals(
                SelectorStrategy.TEST_ID,
                reloaded.selectorStrategy()
        );

        assertEquals(
                "username-input",
                reloaded.selectorValue()
        );

        assertEquals(
                sourceStep.getId(),
                reloaded.sourceTestStepId()
        );
    }

    @Test
    void shouldDeleteAutomationStepWithoutDeletingSourceTestStep() {

        TestCase testCase =
                createTestCase(
                        "TC-AUTO-013"
                );

        TestStep sourceStep =
                createTestStep(
                        testCase,
                        "STEP-AUTO-010",
                        1,
                        "Click Login"
                );

        AutomationScriptResponse script =
                createAutomationScript(
                        testCase
                );

        AutomationStepResponse step =
                automationService.createStep(
                        script.id(),
                        createClickRequest(
                                sourceStep.getId(),
                                1,
                                "Login"
                        )
                );

        automationService.deleteStep(
                step.id()
        );

        assertFalse(
                automationStepRepository
                        .findById(
                                step.id()
                        )
                        .isPresent()
        );

        assertTrue(
                testStepRepository
                        .findById(
                                sourceStep.getId()
                        )
                        .isPresent()
        );
    }

    private AutomationScriptResponse createAutomationScript(
            TestCase testCase
    ) {

        return automationService.createScript(
                testCase.getId(),
                new CreateAutomationScriptRequest(
                        uniqueId(
                                "AUTOSCRIPT"
                        ),
                        "Automation "
                                + testCase.getTestCaseId()
                )
        );
    }

    private void createClickStep(
            Long automationScriptId,
            Long sourceTestStepId,
            int stepOrder,
            String selectorText
    ) {

        automationService.createStep(
                automationScriptId,
                createClickRequest(
                        sourceTestStepId,
                        stepOrder,
                        selectorText
                )
        );
    }

    private CreateAutomationStepRequest createClickRequest(
            Long sourceTestStepId,
            int stepOrder,
            String selectorText
    ) {

        return new CreateAutomationStepRequest(
                uniqueId(
                        "AUTO-STEP"
                ),
                sourceTestStepId,
                stepOrder,
                AutomationActionType.CLICK,
                selectorText,
                SelectorStrategy.TEXT,
                selectorText,
                null,
                null,
                false,
                null,
                null
        );
    }

    private TestPlan createTestPlan() {

        TestPlan testPlan =
                new TestPlan();

        testPlan.setTestPlanId(
                uniqueId(
                        "TP-AUTO"
                )
        );

        testPlan.setName(
                "Automation Integration Test Plan"
        );

        testPlan.setVersion(
                "1.0"
        );

        testPlan.setProject(
                "TestForge"
        );

        testPlan.setApplication(
                "TestForge"
        );

        testPlan.setEnvironment(
                "TEST"
        );

        testPlan.setPreparedBy(
                "AutomationIntegrationTest"
        );

        testPlan.setStatus(
                TestPlanStatus.DRAFT
        );

        testPlan.setApprovalStatus(
                ApprovalStatus.PENDING
        );

        LocalDateTime now =
                LocalDateTime.now();

        testPlan.setCreatedAt(
                now
        );

        testPlan.setUpdatedAt(
                now
        );

        return testPlanRepository.save(
                testPlan
        );
    }

    private Requirement createRequirement(
            TestPlan testPlan
    ) {

        Requirement requirement =
                new Requirement();

        requirement.setRequirementId(
                uniqueId(
                        "REQ-AUTO"
                )
        );

        requirement.setTestPlan(
                testPlan
        );

        requirement.setDescription(
                "Automation integration test requirement"
        );

        requirement.setPriority(
                RequirementPriority.HIGH
        );

        requirement.setStatus(
                RequirementStatus.DRAFT
        );

        requirement.setAutomatable(
                true
        );

        LocalDateTime now =
                LocalDateTime.now();

        requirement.setCreatedAt(
                now
        );

        requirement.setUpdatedAt(
                now
        );

        return requirementRepository.save(
                requirement
        );
    }

    private TestScenario createTestScenario(
            Requirement requirement
    ) {

        TestScenario testScenario =
                new TestScenario();

        testScenario.setScenarioId(
                uniqueId(
                        "TS-AUTO"
                )
        );

        testScenario.setRequirement(
                requirement
        );

        testScenario.setDescription(
                "Automation integration test scenario"
        );

        testScenario.setTestType(
                TestType.FUNCTIONAL
        );

        testScenario.setAutomatable(
                true
        );

        testScenario.setPriority(
                TestScenarioPriority.HIGH
        );

        testScenario.setStatus(
                TestScenarioStatus.DRAFT
        );

        LocalDateTime now =
                LocalDateTime.now();

        testScenario.setCreatedAt(
                now
        );

        testScenario.setUpdatedAt(
                now
        );

        return testScenarioRepository.save(
                testScenario
        );
    }

    private TestCase createTestCase(
            String businessId
    ) {

        TestPlan testPlan =
                createTestPlan();

        Requirement requirement =
                createRequirement(
                        testPlan
                );

        TestScenario testScenario =
                createTestScenario(
                        requirement
                );

        TestCase testCase =
                new TestCase();

        testCase.setTestCaseId(
                uniqueId(
                        businessId
                )
        );

        testCase.setTestScenario(
                testScenario
        );

        testCase.setName(
                "Automation Integration Test Case"
        );

        testCase.setPreconditions(
                "User can access the application"
        );

        testCase.setTestData(
                "Integration test data"
        );

        testCase.setExpectedResult(
                "Expected automation behavior occurs"
        );

        testCase.setPriority(
                TestCasePriority.HIGH
        );

        testCase.setTestType(
                TestType.FUNCTIONAL
        );

        testCase.setAutomatable(
                true
        );

        testCase.setAutomationType(
                AutomationType.UI
        );

        testCase.setAutomationStatus(
                AutomationStatus.NOT_AUTOMATED
        );

        testCase.setStatus(
                TestCaseStatus.DRAFT
        );

        LocalDateTime now =
                LocalDateTime.now();

        testCase.setCreatedAt(
                now
        );

        testCase.setUpdatedAt(
                now
        );

        return testCaseRepository.save(
                testCase
        );
    }

    private TestStep createTestStep(
            TestCase testCase,
            String businessId,
            int stepOrder,
            String action
    ) {

        TestStep testStep =
                new TestStep();

        testStep.setTestStepId(
                uniqueId(
                        businessId
                )
        );

        testStep.setTestCase(
                testCase
        );

        testStep.setStepOrder(
                stepOrder
        );

        testStep.setAction(
                action
        );

        LocalDateTime now =
                LocalDateTime.now();

        testStep.setCreatedAt(
                now
        );

        testStep.setUpdatedAt(
                now
        );

        return testStepRepository.save(
                testStep
        );
    }

    private String uniqueId(
            String prefix
    ) {

        return prefix
                + "-"
                + UUID.randomUUID()
                .toString()
                .substring(
                        0,
                        8
                )
                .toUpperCase();
    }
}