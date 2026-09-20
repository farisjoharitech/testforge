package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationStepRepository;
import com.testforge.testforge_backend.testsuite.repository.SuiteRunRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

/** Shared by the dependency preview and the authoritative deletion transaction. */
@Service
public class TestCaseDeletionPolicy {
    private final AutomationExecutionRepository executions;
    private final SuiteRunRepository runs;
    private final AutomationStepRepository actions;

    public TestCaseDeletionPolicy(AutomationExecutionRepository executions,
                                  SuiteRunRepository runs, AutomationStepRepository actions) {
        this.executions = executions; this.runs = runs; this.actions = actions;
    }

    public List<String> blockers(Long id) {
        List<String> blockers = new ArrayList<>();
        if (executions.countRunningForTestCase(id) > 0) blockers.add("An automation execution is running. Wait for it to finish.");
        if (runs.countActiveForTestCase(id) > 0) blockers.add("A Suite Run containing this Test Case is in progress. Wait for it to finish.");
        if (actions.countExternalMappings(id) > 0) blockers.add("Automation owned by another Test Case references these Test Steps. Resolve that mapping first.");
        return List.copyOf(blockers);
    }
}
