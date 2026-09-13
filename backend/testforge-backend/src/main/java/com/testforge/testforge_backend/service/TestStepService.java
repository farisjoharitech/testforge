package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.dto.CreateTestStepRequest;
import com.testforge.testforge_backend.dto.UpdateTestStepRequest;
import com.testforge.testforge_backend.exception.DuplicateTestStepException;
import com.testforge.testforge_backend.exception.DuplicateTestStepOrderException;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.exception.TestStepNotFoundException;
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

    public TestStepService(
            TestStepRepository testStepRepository,
            TestCaseRepository testCaseRepository) {

        this.testStepRepository =
                testStepRepository;

        this.testCaseRepository =
                testCaseRepository;
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

        if (testStepRepository
                .existsByTestStepId(
                        request.getTestStepId()
                )) {

            throw new DuplicateTestStepException(
                    "Test Step ID already exists: "
                            + request.getTestStepId()
            );
        }

        if (testStepRepository
                .existsByTestCaseAndStepOrder(
                        testCase,
                        request.getStepOrder()
                )) {

            throw new DuplicateTestStepOrderException(
                    "Step order "
                            + request.getStepOrder()
                            + " already exists for Test Case: "
                            + testCaseBusinessId
            );
        }

        TestStep testStep =
                new TestStep();

        testStep.setTestStepId(
                request.getTestStepId()
        );

        testStep.setTestCase(
                testCase
        );

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
        return testStep;
    }

    public void delete(
            Long id) {

        if (!testStepRepository
                .existsById(id)) {

            throw new TestStepNotFoundException(
                    "Test Step not found with id: "
                            + id
            );
        }

        testStepRepository
                .deleteById(id);
    }
}