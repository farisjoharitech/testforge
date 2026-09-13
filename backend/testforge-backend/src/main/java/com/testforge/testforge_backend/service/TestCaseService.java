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

    public TestCaseService(
            TestCaseRepository testCaseRepository,
            TestScenarioRepository testScenarioRepository) {

        this.testCaseRepository =
                testCaseRepository;

        this.testScenarioRepository =
                testScenarioRepository;
    }

    public TestCase create(
            String scenarioBusinessId,
            CreateTestCaseRequest request) {

        TestScenario testScenario =
                testScenarioRepository
                        .findByScenarioId(
                                scenarioBusinessId
                        )
                        .orElseThrow(() ->
                                new TestScenarioNotFoundException(
                                        "Test Scenario not found with scenarioId: "
                                                + scenarioBusinessId
                                )
                        );

        if (testCaseRepository
                .existsByTestCaseId(
                        request.getTestCaseId()
                )) {

            throw new DuplicateTestCaseException(
                    "Test Case ID already exists: "
                            + request.getTestCaseId()
            );
        }

        validateAutomationConfiguration(
                request.getAutomatable(),
                request.getAutomationType(),
                request.getAutomationStatus()
        );

        TestCase testCase =
                new TestCase();

        testCase.setTestCaseId(
                request.getTestCaseId()
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

        testCase.setAutomationStatus(
                request.getAutomationStatus()
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

    @Transactional(readOnly = true)
    public List<TestCase> getByScenario(
            String scenarioBusinessId) {

        TestScenario testScenario =
                testScenarioRepository
                        .findByScenarioId(
                                scenarioBusinessId
                        )
                        .orElseThrow(() ->
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

    @Transactional(readOnly = true)
    public TestCase getById(
            Long id) {

        return testCaseRepository
                .findById(id)
                .orElseThrow(() ->
                        new TestCaseNotFoundException(
                                "Test Case not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public TestCase getByTestCaseId(
            String testCaseId) {

        return testCaseRepository
                .findByTestCaseId(
                        testCaseId
                )
                .orElseThrow(() ->
                        new TestCaseNotFoundException(
                                "Test Case not found with testCaseId: "
                                        + testCaseId
                        )
                );
    }

    public TestCase update(
            Long id,
            UpdateTestCaseRequest request) {

        TestCase testCase =
                testCaseRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new TestCaseNotFoundException(
                                        "Test Case not found with id: "
                                                + id
                                )
                        );

        validateAutomationConfiguration(
                request.getAutomatable(),
                request.getAutomationType(),
                request.getAutomationStatus()
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

        testCase.setAutomationStatus(
                request.getAutomationStatus()
        );

        testCase.setStatus(
                request.getStatus()
        );

        testCase.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * Do not call save() here.
         * The entity is managed by this transaction.
         */
        return testCase;
    }

    public void delete(
            Long id) {

        if (!testCaseRepository
                .existsById(id)) {

            throw new TestCaseNotFoundException(
                    "Test Case not found with id: "
                            + id
            );
        }

        testCaseRepository
                .deleteById(id);
    }

    private void validateAutomationConfiguration(
            Boolean automatable,
            AutomationType automationType,
            AutomationStatus automationStatus) {

        if (!automatable) {

            if (automationType
                    != AutomationType.MANUAL) {

                throw new InvalidTestCaseAutomationException(
                        "Non-automatable Test Case must use automationType MANUAL"
                );
            }

            if (automationStatus
                    != AutomationStatus.NOT_APPLICABLE) {

                throw new InvalidTestCaseAutomationException(
                        "Non-automatable Test Case must use automationStatus NOT_APPLICABLE"
                );
            }

            return;
        }

        if (automationType
                == AutomationType.MANUAL) {

            throw new InvalidTestCaseAutomationException(
                    "Automatable Test Case cannot use automationType MANUAL"
            );
        }

        if (automationStatus
                == AutomationStatus.NOT_APPLICABLE) {

            throw new InvalidTestCaseAutomationException(
                    "Automatable Test Case cannot use automationStatus NOT_APPLICABLE"
            );
        }
    }
}