package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.dto.CreateTestScenarioRequest;
import com.testforge.testforge_backend.dto.UpdateTestScenarioRequest;
import com.testforge.testforge_backend.exception.DuplicateTestScenarioException;
import com.testforge.testforge_backend.exception.RequirementNotFoundException;
import com.testforge.testforge_backend.exception.TestScenarioNotFoundException;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TestScenarioService {

    private final TestScenarioRepository
            testScenarioRepository;

    private final RequirementRepository
            requirementRepository;

    private final BusinessIdGeneratorService
            businessIdGeneratorService;

    public TestScenarioService(
            TestScenarioRepository testScenarioRepository,
            RequirementRepository requirementRepository,
            BusinessIdGeneratorService businessIdGeneratorService) {

        this.testScenarioRepository =
                testScenarioRepository;

        this.requirementRepository =
                requirementRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;
    }

    public TestScenario create(
            String requirementBusinessId,
            CreateTestScenarioRequest request) {

        Requirement requirement =
                requirementRepository
                        .findByRequirementId(
                                requirementBusinessId
                        )
                        .orElseThrow(() ->
                                new RequirementNotFoundException(
                                        "Requirement not found with requirementId: "
                                                + requirementBusinessId
                                )
                        );

        String scenarioId = resolveScenarioId(
                request.getScenarioId()
        );

        if (testScenarioRepository
                .existsByScenarioId(
                        scenarioId
                )) {

            throw new DuplicateTestScenarioException(
                    "Scenario ID already exists: "
                            + scenarioId
            );
        }

        TestScenario scenario =
                new TestScenario();

        scenario.setScenarioId(
                scenarioId
        );

        scenario.setRequirement(
                requirement
        );

        scenario.setDescription(
                request.getDescription()
        );

        scenario.setTestType(
                request.getTestType()
        );


        scenario.setPriority(
                request.getPriority()
        );

        scenario.setStatus(
                request.getStatus()
        );

        LocalDateTime now =
                LocalDateTime.now();

        scenario.setCreatedAt(
                now
        );

        scenario.setUpdatedAt(
                now
        );

        return testScenarioRepository.save(
                scenario
        );
    }

    @Transactional(readOnly = true)
    public List<TestScenario> getByRequirement(
            String requirementBusinessId) {

        Requirement requirement =
                requirementRepository
                        .findByRequirementId(
                                requirementBusinessId
                        )
                        .orElseThrow(() ->
                                new RequirementNotFoundException(
                                        "Requirement not found with requirementId: "
                                                + requirementBusinessId
                                )
                        );

        return testScenarioRepository
                .findByRequirementOrderByIdAsc(
                        requirement
                );
    }

    @Transactional(readOnly = true)
    public TestScenario getById(
            Long id) {

        return testScenarioRepository
                .findById(id)
                .orElseThrow(() ->
                        new TestScenarioNotFoundException(
                                "Test Scenario not found with id: "
                                        + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public TestScenario getByScenarioId(
            String scenarioId) {

        return testScenarioRepository
                .findByScenarioId(
                        scenarioId
                )
                .orElseThrow(() ->
                        new TestScenarioNotFoundException(
                                "Test Scenario not found with scenarioId: "
                                        + scenarioId
                        )
                );
    }

    public TestScenario update(
            Long id,
            UpdateTestScenarioRequest request) {

        TestScenario scenario =
                testScenarioRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new TestScenarioNotFoundException(
                                        "Test Scenario not found with id: "
                                                + id
                                )
                        );

        scenario.setDescription(
                request.getDescription()
        );

        scenario.setTestType(
                request.getTestType()
        );


        scenario.setPriority(
                request.getPriority()
        );

        scenario.setStatus(
                request.getStatus()
        );

        scenario.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * Managed inside the transaction.
         * Hibernate dirty checking persists it.
         */
        return scenario;
    }

    public void delete(
            Long id) {

        if (!testScenarioRepository
                .existsById(id)) {

            throw new TestScenarioNotFoundException(
                    "Test Scenario not found with id: "
                            + id
            );
        }

        testScenarioRepository
                .deleteById(id);
    }

    private String resolveScenarioId(
            String requestedScenarioId) {

        if (
                requestedScenarioId != null
                        && !requestedScenarioId.isBlank()
        ) {
            return requestedScenarioId.trim();
        }

        String generatedId = businessIdGeneratorService.generateScenarioId();

        while (testScenarioRepository.existsByScenarioId(generatedId)) {
            generatedId = businessIdGeneratorService.generateScenarioId();
        }

        return generatedId;
    }
}
