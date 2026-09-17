package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.testset.entity.TestSet;
import com.testforge.testforge_backend.testset.entity.TestSetItem;
import com.testforge.testforge_backend.testset.exception.TestSetNotFoundException;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class AutomationTestSetRunService {

    private final TestSetRepository testSetRepository;
    private final AutomationMultiRunService automationMultiRunService;

    public AutomationTestSetRunService(
            TestSetRepository testSetRepository,
            AutomationMultiRunService automationMultiRunService
    ) {
        this.testSetRepository = testSetRepository;
        this.automationMultiRunService = automationMultiRunService;
    }

    public AutomationRunResponse executeTestSet(Long testSetId) {
        if (testSetId == null) {
            throw new IllegalArgumentException("Test Set ID must not be null");
        }

        TestSet testSet = testSetRepository.findById(testSetId)
                .orElseThrow(() -> new TestSetNotFoundException(
                        "Test Set not found with id: " + testSetId
                ));

        List<TestSetItem> orderedItems = testSet.getItems()
                .stream()
                .sorted(Comparator.comparing(TestSetItem::getItemOrder))
                .toList();

        if (orderedItems.isEmpty()) {
            throw new IllegalArgumentException(
                    "Test Set has no Test Cases: " + testSet.getTestSetId()
            );
        }

        for (TestSetItem item : orderedItems) {
            TestCase testCase = item.getTestCase();

            if (!testCase.isAutomatable()
                    || testCase.getAutomationType() == AutomationType.MANUAL) {
                throw new AutomationConflictException(
                        "Test Set contains a Test Case that is no longer automation eligible: "
                                + testCase.getTestCaseId()
                );
            }
        }

        List<Long> orderedTestCaseIds = orderedItems
                .stream()
                .map(item -> item.getTestCase().getId())
                .toList();

        return automationMultiRunService.executeTestSetTestCases(
                orderedTestCaseIds
        );
    }
}
