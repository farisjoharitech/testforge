package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.dto.CreateTestPlanRequest;
import com.testforge.testforge_backend.dto.UpdateTestPlanRequest;
import com.testforge.testforge_backend.exception.DuplicateTestPlanException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TestPlanService {

    private final TestPlanRepository testPlanRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;

    public TestPlanService(
            TestPlanRepository testPlanRepository,
            BusinessIdGeneratorService businessIdGeneratorService
    ) {
        this.testPlanRepository = testPlanRepository;
        this.businessIdGeneratorService = businessIdGeneratorService;
    }

    public TestPlan create(CreateTestPlanRequest request) {

        String testPlanId = resolveTestPlanId(
                request.getTestPlanId()
        );

        if (testPlanRepository.existsByTestPlanId(testPlanId)) {
            throw new DuplicateTestPlanException(
                    "Test Plan ID already exists: " + testPlanId
            );
        }

        TestPlan testPlan = new TestPlan();

        testPlan.setTestPlanId(testPlanId);
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

    public void delete(Long id) {

        if (!testPlanRepository.existsById(id)) {
            throw new TestPlanNotFoundException(
                    "Test Plan not found with id: " + id
            );
        }

        testPlanRepository.deleteById(id);
    }

    private String resolveTestPlanId(
            String requestedTestPlanId
    ) {
        if (
                requestedTestPlanId != null
                        && !requestedTestPlanId.isBlank()
        ) {
            return requestedTestPlanId.trim();
        }

        String generatedId = businessIdGeneratorService.generateTestPlanId();

        while (testPlanRepository.existsByTestPlanId(generatedId)) {
            generatedId = businessIdGeneratorService.generateTestPlanId();
        }

        return generatedId;
    }
}
