package com.testforge.testforge_backend.testset.service;

import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import com.testforge.testforge_backend.service.BusinessIdGeneratorService;
import com.testforge.testforge_backend.testset.dto.CreateTestSetRequest;
import com.testforge.testforge_backend.testset.dto.TestSetCandidateResponse;
import com.testforge.testforge_backend.testset.dto.TestSetMemberResponse;
import com.testforge.testforge_backend.testset.dto.TestSetResponse;
import com.testforge.testforge_backend.testset.dto.UpdateTestSetRequest;
import com.testforge.testforge_backend.testset.entity.TestSet;
import com.testforge.testforge_backend.testset.entity.TestSetItem;
import com.testforge.testforge_backend.testset.exception.InvalidTestSetException;
import com.testforge.testforge_backend.testset.exception.TestSetNotFoundException;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class TestSetService {

    private final TestSetRepository testSetRepository;
    private final TestPlanRepository testPlanRepository;
    private final TestCaseRepository testCaseRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;

    public TestSetService(
            TestSetRepository testSetRepository,
            TestPlanRepository testPlanRepository,
            TestCaseRepository testCaseRepository,
            BusinessIdGeneratorService businessIdGeneratorService
    ) {
        this.testSetRepository = testSetRepository;
        this.testPlanRepository = testPlanRepository;
        this.testCaseRepository = testCaseRepository;
        this.businessIdGeneratorService = businessIdGeneratorService;
    }

    public TestSetResponse create(CreateTestSetRequest request) {
        TestPlan testPlan = findTestPlan(request.testPlanId());
        LocalDateTime now = LocalDateTime.now();

        TestSet testSet = new TestSet();
        testSet.setTestSetId(businessIdGeneratorService.generateTestSetId());
        testSet.setTestPlan(testPlan);
        testSet.setName(normalizeRequired(request.name()));
        testSet.setDescription(normalizeNullable(request.description()));
        testSet.setCreatedAt(now);
        testSet.setUpdatedAt(now);
        testSet.replaceItems(buildItems(testPlan, request.testCaseIds(), now));

        return toResponse(testSetRepository.save(testSet));
    }

    public TestSetResponse update(Long id, UpdateTestSetRequest request) {
        TestSet testSet = findTestSet(id);
        LocalDateTime now = LocalDateTime.now();

        testSet.setName(normalizeRequired(request.name()));
        testSet.setDescription(normalizeNullable(request.description()));

        List<TestSetItem> replacementItems =
                buildItems(testSet.getTestPlan(), request.testCaseIds(), now);

        /*
         * Flush orphan removals before inserting the replacement membership.
         * This avoids transient unique-key conflicts on
         * (test_set_id, test_case_id) and (test_set_id, item_order).
         */
        testSet.getItems().clear();
        testSetRepository.flush();
        testSet.replaceItems(replacementItems);

        testSet.setUpdatedAt(now);

        return toResponse(testSet);
    }

    @Transactional(readOnly = true)
    public TestSetResponse getById(Long id) {
        return toResponse(findTestSet(id));
    }

    @Transactional(readOnly = true)
    public List<TestSetResponse> getAll() {
        return testSetRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestSetResponse> getByTestPlan(Long testPlanId) {
        findTestPlan(testPlanId);
        return testSetRepository.findByTestPlanIdOrderByIdAsc(testPlanId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestSetCandidateResponse> getCandidates(Long testPlanId) {
        findTestPlan(testPlanId);
        return testCaseRepository.findByTestPlanIdOrderByIdAsc(testPlanId)
                .stream()
                .filter(TestCase::isAutomatable)
                .filter(testCase -> testCase.getAutomationType() != AutomationType.MANUAL)
                .map(testCase -> new TestSetCandidateResponse(
                        testCase.getId(),
                        testCase.getTestCaseId(),
                        testCase.getName(),
                        testCase.getTestScenario().getId(),
                        testCase.getTestScenario().getScenarioId(),
                        testCase.getAutomationType(),
                        testCase.getAutomationStatus()
                ))
                .toList();
    }

    public void delete(Long id) {
        testSetRepository.delete(findTestSet(id));
    }

    private List<TestSetItem> buildItems(
            TestPlan testPlan,
            List<Long> testCaseIds,
            LocalDateTime now
    ) {
        if (testCaseIds == null || testCaseIds.isEmpty()) {
            throw new InvalidTestSetException("Select at least one Test Case");
        }

        Set<Long> uniqueIds = new HashSet<>();
        List<TestSetItem> items = new ArrayList<>();

        for (int index = 0; index < testCaseIds.size(); index++) {
            Long testCaseId = testCaseIds.get(index);

            if (!uniqueIds.add(testCaseId)) {
                throw new InvalidTestSetException(
                        "A Test Case can only appear once in a Test Set: " + testCaseId
                );
            }

            TestCase testCase = testCaseRepository.findById(testCaseId)
                    .orElseThrow(() -> new TestCaseNotFoundException(
                            "Test Case not found with id: " + testCaseId
                    ));

            Long owningTestPlanId = testCase
                    .getTestScenario()
                    .getRequirement()
                    .getTestPlan()
                    .getId();

            if (!testPlan.getId().equals(owningTestPlanId)) {
                throw new InvalidTestSetException(
                        "Test Case " + testCase.getTestCaseId()
                                + " does not belong to Test Plan "
                                + testPlan.getTestPlanId()
                );
            }

            if (!testCase.isAutomatable() || testCase.getAutomationType() == AutomationType.MANUAL) {
                throw new InvalidTestSetException(
                        "Test Case is not automation eligible: " + testCase.getTestCaseId()
                );
            }

            items.add(new TestSetItem(testCase, index + 1, now));
        }

        return items;
    }

    private TestSet findTestSet(Long id) {
        return testSetRepository.findById(id)
                .orElseThrow(() -> new TestSetNotFoundException(
                        "Test Set not found with id: " + id
                ));
    }

    private TestPlan findTestPlan(Long id) {
        return testPlanRepository.findById(id)
                .orElseThrow(() -> new TestPlanNotFoundException(
                        "Test Plan not found with id: " + id
                ));
    }

    private TestSetResponse toResponse(TestSet testSet) {
        List<TestSetMemberResponse> members = testSet.getItems()
                .stream()
                .map(item -> new TestSetMemberResponse(
                        item.getId(),
                        item.getTestCase().getId(),
                        item.getTestCase().getTestCaseId(),
                        item.getTestCase().getName(),
                        item.getTestCase().getTestScenario().getId(),
                        item.getTestCase().getTestScenario().getScenarioId(),
                        item.getTestCase().getAutomationType(),
                        item.getTestCase().getAutomationStatus(),
                        item.getItemOrder()
                ))
                .toList();

        return new TestSetResponse(
                testSet.getId(),
                testSet.getTestSetId(),
                testSet.getTestPlan().getId(),
                testSet.getTestPlan().getTestPlanId(),
                testSet.getTestPlan().getName(),
                testSet.getName(),
                testSet.getDescription(),
                members.size(),
                members,
                testSet.getCreatedAt(),
                testSet.getUpdatedAt()
        );
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
