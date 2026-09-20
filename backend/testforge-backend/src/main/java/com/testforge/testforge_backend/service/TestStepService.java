package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.automation.entity.AutomationStep;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.dto.CreateTestStepRequest;
import com.testforge.testforge_backend.dto.TestStepDeleteImpactResponse;
import com.testforge.testforge_backend.dto.UpdateTestStepRequest;
import com.testforge.testforge_backend.exception.DuplicateTestStepException;
import com.testforge.testforge_backend.exception.DuplicateTestStepOrderException;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.exception.TestStepNotFoundException;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TestStepService {

    private final TestStepRepository
            testStepRepository;

    private final TestCaseRepository
            testCaseRepository;

    private final BusinessIdGeneratorService
            businessIdGeneratorService;

    private final AutomationStepRepository
            automationStepRepository;

    private final TestStepAutomationService testStepAutomationService;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public TestStepService(
            TestStepRepository testStepRepository,
            TestCaseRepository testCaseRepository,
            BusinessIdGeneratorService businessIdGeneratorService,
            AutomationStepRepository automationStepRepository,
            TestStepAutomationService testStepAutomationService,
            com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService) {
        this.testStepAutomationService = testStepAutomationService;
        this.deletionService = deletionService;

        this.testStepRepository =
                testStepRepository;

        this.testCaseRepository =
                testCaseRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;

        this.automationStepRepository =
                automationStepRepository;
    }

    public TestStep create(
            String testCaseBusinessId,
            CreateTestStepRequest request) {

        TestCase testCase =
                testCaseRepository
                        .findByTestCaseId(
                                testCaseBusinessId
                        )
                        .orElseThrow(() ->
                                new TestCaseNotFoundException(
                                        "Test Case not found with testCaseId: "
                                                + testCaseBusinessId
                                )
                        );

        String testStepId = resolveTestStepId(
                request.getTestStepId()
        );

        if (testStepRepository
                .existsByTestStepId(
                        testStepId
                )) {

            throw new DuplicateTestStepException(
                    "Test Step ID already exists: "
                            + testStepId
            );
        }

        Integer stepOrder = resolveStepOrder(
                testCase,
                request.getStepOrder()
        );

        if (testStepRepository
                .existsByTestCaseAndStepOrder(
                        testCase,
                        stepOrder
                )) {

            throw new DuplicateTestStepOrderException(
                    "Step order "
                            + stepOrder
                            + " already exists for Test Case: "
                            + testCaseBusinessId
            );
        }

        TestStep testStep =
                new TestStep();

        testStep.setTestStepId(
                testStepId
        );

        testStep.setTestCase(
                testCase
        );

        testStep.setStepOrder(
                stepOrder
        );

        testStep.setAction(
                request.getAction()
        );

        testStep.setTarget(
                request.getTarget()
        );

        testStep.setInputValue(
                request.getInputValue()
        );

        testStep.setExpectedResult(
                request.getExpectedResult()
        );

        LocalDateTime now =
                LocalDateTime.now();

        testStep.setCreatedAt(
                now
        );

        testStep.setUpdatedAt(
                now
        );

        TestStep saved = testStepRepository.save(testStep);
        testStepAutomationService.apply(saved, request.getAutomation());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<TestStep> getByTestCase(
            String testCaseBusinessId) {

        TestCase testCase =
                testCaseRepository
                        .findByTestCaseId(
                                testCaseBusinessId
                        )
                        .orElseThrow(() ->
                                new TestCaseNotFoundException(
                                        "Test Case not found with testCaseId: "
                                                + testCaseBusinessId
                                )
                        );

        return testStepRepository
                .findByTestCaseOrderByStepOrderAsc(
                        testCase
                );
    }

    @Transactional(readOnly = true)
    public TestStep getById(
            Long id) {

        return testStepRepository
                .findById(id)
                .orElseThrow(() ->
                        new TestStepNotFoundException(
                                "Test Step not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public TestStep getByTestStepId(
            String testStepId) {

        return testStepRepository
                .findByTestStepId(
                        testStepId
                )
                .orElseThrow(() ->
                        new TestStepNotFoundException(
                                "Test Step not found with testStepId: "
                                        + testStepId
                        )
                );
    }

    public TestStep update(
            Long id,
            UpdateTestStepRequest request) {

        TestStep testStep =
                testStepRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new TestStepNotFoundException(
                                        "Test Step not found with id: "
                                                + id
                                )
                        );

        if (testStepRepository
                .existsByTestCaseAndStepOrderAndIdNot(
                        testStep.getTestCase(),
                        request.getStepOrder(),
                        testStep.getId()
                )) {

            throw new DuplicateTestStepOrderException(
                    "Step order "
                            + request.getStepOrder()
                            + " already exists for Test Case: "
                            + testStep
                            .getTestCase()
                            .getTestCaseId()
            );
        }

        testStep.setStepOrder(
                request.getStepOrder()
        );

        testStep.setAction(
                request.getAction()
        );

        testStep.setTarget(
                request.getTarget()
        );

        testStep.setInputValue(
                request.getInputValue()
        );

        testStep.setExpectedResult(
                request.getExpectedResult()
        );

        testStep.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * Managed entity.
         * Hibernate dirty checking persists updates.
         */
        testStepAutomationService.apply(testStep, request.getAutomation());
        return testStep;
    }


    private String resolveTestStepId(
            String requestedTestStepId) {

        if (
                requestedTestStepId != null
                        && !requestedTestStepId.isBlank()
        ) {
            return requestedTestStepId.trim();
        }

        String generatedId = businessIdGeneratorService.generateTestStepId();

        while (testStepRepository.existsByTestStepId(generatedId)) {
            generatedId = businessIdGeneratorService.generateTestStepId();
        }

        return generatedId;
    }

    private Integer resolveStepOrder(
            TestCase testCase,
            Integer requestedStepOrder) {

        if (requestedStepOrder != null) {
            return requestedStepOrder;
        }

        return testStepRepository
                .findTopByTestCaseOrderByStepOrderDesc(
                        testCase
                )
                .map(TestStep::getStepOrder)
                .map(currentMax -> currentMax + 1)
                .orElse(1);
    }

    @Transactional(readOnly = true)
    public TestStepDeleteImpactResponse getDeleteImpact(
            Long id) {

        TestStep testStep = testStepRepository
                .findById(id)
                .orElseThrow(() ->
                        new TestStepNotFoundException(
                                "Test Step not found with id: "
                                        + id
                        )
                );

        List<AutomationStep> mappedSteps = automationStepRepository
                .findByTestStepIdOrderByStepOrderAsc(id);

        long affectedScriptCount = mappedSteps.stream()
                .map(step -> step.getAutomationScript().getId())
                .distinct()
                .count();

        boolean generatedScriptWillBecomeStale = mappedSteps.stream()
                .map(AutomationStep::getAutomationScript)
                .anyMatch(script ->
                        script.getGeneratedSource() != null
                                && !script.getGeneratedSource().isBlank()
                                && script.getGeneratedAt() != null
                );

        return new TestStepDeleteImpactResponse(
                testStep.getId(),
                testStep.getTestStepId(),
                mappedSteps.size(),
                affectedScriptCount,
                generatedScriptWillBecomeStale
        );
    }

    public void delete(
            Long id) {

        deletionService.deleteTestStep(id);
    }
}
