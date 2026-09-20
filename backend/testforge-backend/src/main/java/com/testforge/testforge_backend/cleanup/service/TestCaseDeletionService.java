package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestStep;
import com.testforge.testforge_backend.exception.ResourceInUseException;
import com.testforge.testforge_backend.exception.TestCaseNotFoundException;
import com.testforge.testforge_backend.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestCaseDeletionService {
    private final EntityManager em;
    private final TestCaseDeletionPolicy policy;
    private final AutomationStepRepository actions;
    private final AutomationScriptRepository scripts;
    private final TestStepRepository steps;
    private final TestCaseRepository cases;

    public TestCaseDeletionService(EntityManager em, TestCaseDeletionPolicy policy, AutomationStepRepository actions,
                                   AutomationScriptRepository scripts, TestStepRepository steps, TestCaseRepository cases) {
        this.em = em; this.policy = policy; this.actions = actions; this.scripts = scripts; this.steps = steps; this.cases = cases;
    }

    @Transactional
    public void delete(Long id) {
        TestCase testCase = em.find(TestCase.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (testCase == null) throw new TestCaseNotFoundException("Test Case not found.");
        // Lock owned parents before inspecting dependencies; concurrent FK inserts cannot slip into cleanup.
        var ownedScripts = em.createQuery("select s from AutomationScript s where s.testCase.id=:id order by s.id", AutomationScript.class)
                .setParameter("id", id).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        var ownedSteps = em.createQuery("select s from TestStep s where s.testCase.id=:id order by s.id", TestStep.class)
                .setParameter("id", id).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        var blockers = policy.blockers(id);
        if (!blockers.isEmpty()) throw new ResourceInUseException("Test Case cannot be deleted. " + String.join(" ", blockers));

        actions.deleteOwnedByTestCase(id);
        scripts.deleteAll(ownedScripts);
        scripts.flush(); // Historical execution references are SET NULL by existing V19 constraints.
        steps.deleteAll(ownedSteps);
        steps.flush();
        cases.delete(testCase);
        cases.flush();
        // Suite membership belongs to the Scenario. Future runs load its remaining Cases afresh.
        // Historical execution and Suite result snapshots are deliberately never deleted here.
    }
}
