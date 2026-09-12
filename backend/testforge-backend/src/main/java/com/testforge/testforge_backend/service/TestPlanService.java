package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;
import com.testforge.testforge_backend.dto.CreateTestPlanRequest;

import com.testforge.testforge_backend.exception.DuplicateTestPlanException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.dto.UpdateTestPlanRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TestPlanService {

    private final TestPlanRepository testPlanRepository;

    public TestPlanService(TestPlanRepository testPlanRepository) {
        this.testPlanRepository = testPlanRepository;
    }

    public TestPlan create(CreateTestPlanRequest request) {

        if (testPlanRepository.existsByTestPlanId(request.getTestPlanId())) {
            throw new DuplicateTestPlanException(
                    "Test Plan ID already exists: " + request.getTestPlanId()
            );
        }

        TestPlan testPlan = new TestPlan();

        testPlan.setTestPlanId(request.getTestPlanId());
        testPlan.setName(request.getName());
        testPlan.setVersion(request.getVersion());
        testPlan.setProject(request.getProject());
        testPlan.setApplication(request.getApplication());
        testPlan.setEnvironment(request.getEnvironment());
        testPlan.setPreparedBy(request.getPreparedBy());
        testPlan.setStatus(request.getStatus());
        testPlan.setApprovalStatus(request.getApprovalStatus());

        LocalDateTime now = LocalDateTime.now();

        testPlan.setCreatedAt(now);
        testPlan.setUpdatedAt(now);

        return testPlanRepository.save(testPlan);
    }

    public TestPlan getById(Long id) {
        return testPlanRepository.findById(id)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with id: " + id
                        )
                );
    }

    public TestPlan getByTestPlanId(String testPlanId) {
        return testPlanRepository.findByTestPlanId(testPlanId)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with testPlanId: " + testPlanId
                        )
                );
    }

    public List<TestPlan> getAll() {
        return testPlanRepository.findAll();
    }

    public void delete(Long id) {
        if (!testPlanRepository.existsById(id)) {
            throw new TestPlanNotFoundException(
                    "Test Plan not found with id: " + id
            );
        }

        testPlanRepository.deleteById(id);
    }

    public TestPlan update(Long id, UpdateTestPlanRequest request) {

        TestPlan testPlan = testPlanRepository.findById(id)
                .orElseThrow(() ->
                        new TestPlanNotFoundException(
                                "Test Plan not found with id: " + id
                        )
                );

        testPlan.setName(request.getName());
        testPlan.setVersion(request.getVersion());
        testPlan.setProject(request.getProject());
        testPlan.setApplication(request.getApplication());
        testPlan.setEnvironment(request.getEnvironment());
        testPlan.setPreparedBy(request.getPreparedBy());
        testPlan.setStatus(request.getStatus());
        testPlan.setApprovalStatus(request.getApprovalStatus());

        testPlan.setUpdatedAt(LocalDateTime.now());

        return testPlanRepository.save(testPlan);
    }
}