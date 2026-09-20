package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.exception.ResourceInUseException;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.dto.CreateTestScenarioRequest;
import com.testforge.testforge_backend.dto.UpdateTestScenarioRequest;
import com.testforge.testforge_backend.exception.DuplicateTestScenarioException;
import com.testforge.testforge_backend.exception.InvalidTestCaseAutomationException;
import com.testforge.testforge_backend.exception.RequirementNotFoundException;
import com.testforge.testforge_backend.exception.TestScenarioNotFoundException;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.testsuite.repository.TestSuiteRepository;
import com.testforge.testforge_backend.exception.ScenarioInUseException;
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

    private final TestCaseRepository
            children;

    private final AutomationScriptRepository
            automationScriptRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public TestScenarioService(
            TestScenarioRepository testScenarioRepository,
            RequirementRepository requirementRepository,
            BusinessIdGeneratorService businessIdGeneratorService,
            TestCaseRepository children,
            AutomationScriptRepository automationScriptRepository,
            TestSuiteRepository testSuiteRepository,
            com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService) {

        this.testScenarioRepository =
                testScenarioRepository;

        this.requirementRepository =
                requirementRepository;

        this.businessIdGeneratorService =
                businessIdGeneratorService;

        this.children = children;
        this.automationScriptRepository = automationScriptRepository;
        this.testSuiteRepository = testSuiteRepository;
        this.deletionService = deletionService;
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

        scenario.setAutomatable(
                request.getAutomatable()
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

        if (
                scenario.isAutomatable()
                        && !request.getAutomatable()
                        && automationScriptRepository.countByScenarioId(id) > 0
        ) {
            throw new InvalidTestCaseAutomationException(
                    "Scenario cannot be changed to manual while automation configuration exists"
            );
        }

        scenario.setDescription(
                request.getDescription()
        );

        scenario.setTestType(
                request.getTestType()
        );

        scenario.setAutomatable(
                request.getAutomatable()
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

        deletionService.deleteScenario(id);
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
