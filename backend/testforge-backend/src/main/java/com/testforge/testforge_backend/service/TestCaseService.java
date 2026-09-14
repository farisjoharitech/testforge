package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.dto.CreateTestCaseRequest;
import com.testforge.testforge_backend.dto.UpdateTestCaseRequest;
import com.testforge.testforge_backend.exception.DuplicateTestCaseException;
import com.testforge.testforge_backend.exception.InvalidTestCaseAutomationException;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.exception.TestScenarioNotFoundException;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TestCaseService {

    private final TestCaseRepository
            testCaseRepository;

    private final TestScenarioRepository
            testScenarioRepository;

    private final BusinessIdGeneratorService
            businessIdGeneratorService;

    public TestCaseService(
            TestCaseRepository testCaseRepository,
            TestScenarioRepository testScenarioRepository,
            BusinessIdGeneratorService businessIdGeneratorService
    ) {
        this.testCaseRepository =
                testCaseRepository;

        this.testScenarioRepository =
                testScenarioRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;
    }

    public TestCase create(
            String scenarioBusinessId,
            CreateTestCaseRequest request
    ) {
        TestScenario testScenario =
                testScenarioRepository
                        .findByScenarioId(
                                scenarioBusinessId
                        )
                        .orElseThrow(
                                () ->
                                        new TestScenarioNotFoundException(
                                                "Test Scenario not found with scenarioId: "
                                                        + scenarioBusinessId
                                        )
                        );

        String testCaseId = resolveTestCaseId(
                request.getTestCaseId()
        );

        if (
                testCaseRepository
                        .existsByTestCaseId(
                                testCaseId
                        )
        ) {
            throw new DuplicateTestCaseException(
                    "Test Case ID already exists: "
                            + testCaseId
            );
        }

        validateAutomationType(
                request.getAutomatable(),
                request.getAutomationType()
        );

        TestCase testCase =
                new TestCase();

        testCase.setTestCaseId(
                testCaseId
        );

        testCase.setTestScenario(
                testScenario
        );

        testCase.setName(
                request.getName()
        );

        testCase.setPreconditions(
                request.getPreconditions()
        );

        testCase.setTestData(
                request.getTestData()
        );

        testCase.setExpectedResult(
                request.getExpectedResult()
        );

        testCase.setPriority(
                request.getPriority()
        );

        testCase.setTestType(
                request.getTestType()
        );

        testCase.setAutomatable(
                request.getAutomatable()
        );

        testCase.setAutomationType(
                request.getAutomationType()
        );

        /*
         * Lifecycle state is derived
         * by the backend.
         *
         * Clients do not choose this.
         */
        testCase.setAutomationStatus(
                initialAutomationStatus(
                        request.getAutomatable()
                )
        );

        testCase.setStatus(
                request.getStatus()
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

    @Transactional(
            readOnly = true
    )
    public List<TestCase> getByScenario(
            String scenarioBusinessId
    ) {
        TestScenario testScenario =
                testScenarioRepository
                        .findByScenarioId(
                                scenarioBusinessId
                        )
                        .orElseThrow(
                                () ->
                                        new TestScenarioNotFoundException(
                                                "Test Scenario not found with scenarioId: "
                                                        + scenarioBusinessId
                                        )
                        );

        return testCaseRepository
                .findByTestScenarioOrderByIdAsc(
                        testScenario
                );
    }

    @Transactional(
            readOnly = true
    )
    public TestCase getById(
            Long id
    ) {
        return testCaseRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new TestCaseNotFoundException(
                                        "Test Case not found with id: "
                                                + id
                                )
                );
    }

    @Transactional(
            readOnly = true
    )
    public TestCase getByTestCaseId(
            String testCaseId
    ) {
        return testCaseRepository
                .findByTestCaseId(
                        testCaseId
                )
                .orElseThrow(
                        () ->
                                new TestCaseNotFoundException(
                                        "Test Case not found with testCaseId: "
                                                + testCaseId
                                )
                );
    }

    @Transactional(
            readOnly = true
    )
    public List<TestCase> getAutomationEligible() {
        return testCaseRepository
                .findByAutomatableTrueOrderByIdAsc();
    }

    public TestCase update(
            Long id,
            UpdateTestCaseRequest request
    ) {
        TestCase testCase =
                testCaseRepository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                () ->
                                        new TestCaseNotFoundException(
                                                "Test Case not found with id: "
                                                        + id
                                        )
                        );

        validateAutomationType(
                request.getAutomatable(),
                request.getAutomationType()
        );

        boolean wasAutomatable =
                testCase.isAutomatable();

        boolean willBeAutomatable =
                Boolean.TRUE.equals(
                        request.getAutomatable()
                );

        AutomationType previousAutomationType =
                testCase.getAutomationType();

        AutomationType requestedAutomationType =
                request.getAutomationType();

        boolean automatableChanged =
                wasAutomatable
                        != willBeAutomatable;

        boolean automationTypeChanged =
                previousAutomationType
                        != requestedAutomationType;

        boolean automationConfigurationChanged =
                automatableChanged
                        || automationTypeChanged;

        /*
         * An execution owns its
         * configuration while it is
         * RUNNING.
         *
         * Normal metadata fields can
         * still be edited, but the
         * automation configuration
         * cannot be changed.
         */
        if (
                testCase.getAutomationStatus()
                        == AutomationStatus.RUNNING
                        && automationConfigurationChanged
        ) {
            throw new InvalidTestCaseAutomationException(
                    "Automation configuration cannot be changed while the Test Case is RUNNING"
            );
        }

        testCase.setName(
                request.getName()
        );

        testCase.setPreconditions(
                request.getPreconditions()
        );

        testCase.setTestData(
                request.getTestData()
        );

        testCase.setExpectedResult(
                request.getExpectedResult()
        );

        testCase.setPriority(
                request.getPriority()
        );

        testCase.setTestType(
                request.getTestType()
        );

        testCase.setAutomatable(
                request.getAutomatable()
        );

        testCase.setAutomationType(
                request.getAutomationType()
        );

        /*
         * ==================================================
         * AUTOMATION LIFECYCLE OWNERSHIP
         * ==================================================
         *
         * The normal Test Case update
         * endpoint never accepts an
         * automationStatus.
         *
         * Only derive/reset when the
         * automation configuration
         * itself changes.
         */

        if (!willBeAutomatable) {

            /*
             * Automatable -> Manual
             */
            testCase.setAutomationStatus(
                    AutomationStatus.NOT_APPLICABLE
            );

        } else if (
                !wasAutomatable
                        || automationTypeChanged
                        || testCase.getAutomationStatus()
                        == AutomationStatus.NOT_APPLICABLE
        ) {

            /*
             * Manual -> Automatable,
             * or UI/API/UI_API changed.
             *
             * Existing generated scripts
             * or execution lifecycle no
             * longer represent the new
             * configuration.
             */
            testCase.setAutomationStatus(
                    AutomationStatus.NOT_AUTOMATED
            );

        }

        /*
         * Otherwise preserve:
         *
         * NOT_AUTOMATED
         * SCRIPT_GENERATED
         * READY
         * RUNNING
         * AUTOMATED
         *
         * Normal metadata edits must not
         * reset lifecycle state.
         */

        testCase.setStatus(
                request.getStatus()
        );

        testCase.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * No save() required.
         *
         * testCase is a managed entity
         * inside this transaction and
         * Hibernate dirty checking will
         * persist the changes.
         */
        return testCase;
    }

    public void delete(
            Long id
    ) {
        if (
                !testCaseRepository
                        .existsById(
                                id
                        )
        ) {
            throw new TestCaseNotFoundException(
                    "Test Case not found with id: "
                            + id
            );
        }

        testCaseRepository
                .deleteById(
                        id
                );
    }


    private String resolveTestCaseId(
            String requestedTestCaseId
    ) {
        if (
                requestedTestCaseId != null
                        && !requestedTestCaseId.isBlank()
        ) {
            return requestedTestCaseId.trim();
        }

        String generatedId = businessIdGeneratorService.generateTestCaseId();

        while (testCaseRepository.existsByTestCaseId(generatedId)) {
            generatedId = businessIdGeneratorService.generateTestCaseId();
        }

        return generatedId;
    }

    private void validateAutomationType(
            Boolean automatable,
            AutomationType automationType
    ) {
        if (automatable == null) {
            throw new InvalidTestCaseAutomationException(
                    "Automatable is required"
            );
        }

        if (automationType == null) {
            throw new InvalidTestCaseAutomationException(
                    "Automation Type is required"
            );
        }

        if (!automatable) {

            if (
                    automationType
                            != AutomationType.MANUAL
            ) {
                throw new InvalidTestCaseAutomationException(
                        "Non-automatable Test Case must use automationType MANUAL"
                );
            }

            return;
        }

        if (
                automationType
                        == AutomationType.MANUAL
        ) {
            throw new InvalidTestCaseAutomationException(
                    "Automatable Test Case cannot use automationType MANUAL"
            );
        }
    }

    private AutomationStatus initialAutomationStatus(
            Boolean automatable
    ) {
        if (
                Boolean.TRUE.equals(
                        automatable
                )
        ) {
            return AutomationStatus.NOT_AUTOMATED;
        }

        return AutomationStatus.NOT_APPLICABLE;
    }
}