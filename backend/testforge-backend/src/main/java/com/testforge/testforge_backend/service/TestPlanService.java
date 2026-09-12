package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TestPlanService {

    private final TestPlanRepository testPlanRepository;

    public TestPlanService(TestPlanRepository testPlanRepository) {
        this.testPlanRepository = testPlanRepository;
    }

    public TestPlan create(TestPlan testPlan) {
        if (testPlanRepository.existsByTestPlanId(testPlan.getTestPlanId())) {
            throw new IllegalArgumentException(
                    "Test Plan ID already exists: " + testPlan.getTestPlanId()
            );
        }

        LocalDateTime now = LocalDateTime.now();

        testPlan.setCreatedAt(now);
        testPlan.setUpdatedAt(now);

        return testPlanRepository.save(testPlan);
    }

    public TestPlan getById(Long id) {
        return testPlanRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Test Plan not found with id: " + id
                        )
                );
    }

    public TestPlan getByTestPlanId(String testPlanId) {
        return testPlanRepository.findByTestPlanId(testPlanId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Test Plan not found with testPlanId: " + testPlanId
                        )
                );
    }

    public List<TestPlan> getAll() {
        return testPlanRepository.findAll();
    }

    public void delete(Long id) {
        if (!testPlanRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Test Plan not found with id: " + id
            );
        }

        testPlanRepository.deleteById(id);
    }
}