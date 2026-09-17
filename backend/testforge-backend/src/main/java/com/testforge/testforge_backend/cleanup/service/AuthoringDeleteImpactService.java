package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.cleanup.dto.AuthoringDeleteImpactResponse;
import com.testforge.testforge_backend.domain.Requirement;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.exception.RequirementNotFoundException;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.exception.TestScenarioNotFoundException;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.repository.TestScenarioRepository;
import com.testforge.testforge_backend.repository.TestStepRepository;
import com.testforge.testforge_backend.testset.repository.TestSetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthoringDeleteImpactService {

    private final RequirementRepository requirementRepository;
    private final TestScenarioRepository testScenarioRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestStepRepository testStepRepository;
    private final AutomationScriptRepository automationScriptRepository;
    private final AutomationStepRepository automationStepRepository;
    private final AutomationExecutionRepository automationExecutionRepository;
    private final TestSetRepository testSetRepository;

    public AuthoringDeleteImpactService(
            RequirementRepository requirementRepository,
            TestScenarioRepository testScenarioRepository,
            TestCaseRepository testCaseRepository,
            TestStepRepository testStepRepository,
            AutomationScriptRepository automationScriptRepository,
            AutomationStepRepository automationStepRepository,
            AutomationExecutionRepository automationExecutionRepository,
            TestSetRepository testSetRepository) {
        this.requirementRepository = requirementRepository;
        this.testScenarioRepository = testScenarioRepository;
        this.testCaseRepository = testCaseRepository;
        this.testStepRepository = testStepRepository;
        this.automationScriptRepository = automationScriptRepository;
        this.automationStepRepository = automationStepRepository;
        this.automationExecutionRepository = automationExecutionRepository;
        this.testSetRepository = testSetRepository;
    }

    public AuthoringDeleteImpactResponse getRequirementImpact(Long id) {
        Requirement requirement = requirementRepository.findById(id)
                .orElseThrow(() -> new RequirementNotFoundException("Requirement not found with id: " + id));
        return new AuthoringDeleteImpactResponse(
                "REQUIREMENT", id, requirement.getRequirementId(),
                testScenarioRepository.countByRequirement_Id(id),
                testCaseRepository.countByRequirementId(id),
                testStepRepository.countByRequirementId(id),
                automationScriptRepository.countByRequirementId(id),
                automationStepRepository.countByRequirementId(id),
                testSetRepository.countMembershipsByRequirementId(id),
                automationExecutionRepository.countByRequirementId(id),
                true
        );
    }

    public AuthoringDeleteImpactResponse getScenarioImpact(Long id) {
        TestScenario scenario = testScenarioRepository.findById(id)
                .orElseThrow(() -> new TestScenarioNotFoundException("Test Scenario not found with id: " + id));
        return new AuthoringDeleteImpactResponse(
                "SCENARIO", id, scenario.getScenarioId(),
                0,
                testCaseRepository.countByTestScenario_Id(id),
                testStepRepository.countByScenarioId(id),
                automationScriptRepository.countByScenarioId(id),
                automationStepRepository.countByScenarioId(id),
                testSetRepository.countMembershipsByScenarioId(id),
                automationExecutionRepository.countByScenarioId(id),
                true
        );
    }

    public AuthoringDeleteImpactResponse getTestCaseImpact(Long id) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new TestCaseNotFoundException("Test Case not found with id: " + id));
        return new AuthoringDeleteImpactResponse(
                "TEST_CASE", id, testCase.getTestCaseId(),
                0,
                0,
                testStepRepository.countByTestCase_Id(id),
                automationScriptRepository.countByTestCaseId(id),
                automationStepRepository.countByTestCaseId(id),
                testSetRepository.countMembershipsByTestCaseId(id),
                automationExecutionRepository.countByTestCase_Id(id),
                true
        );
    }
}
