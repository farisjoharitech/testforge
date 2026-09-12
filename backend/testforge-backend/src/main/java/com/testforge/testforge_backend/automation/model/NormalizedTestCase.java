package com.testforge.testforge_backend.automation.model;

import com.testforge.testforge_backend.domain.enums.AutomationType;

import java.util.ArrayList;
import java.util.List;

public class NormalizedTestCase {

    private String testCaseId;

    private String name;

    private AutomationType automationType;

    private List<NormalizedAutomationAction> actions =
            new ArrayList<>();

    public NormalizedTestCase() {
    }

    public NormalizedTestCase(
            String testCaseId,
            String name,
            AutomationType automationType,
            List<NormalizedAutomationAction> actions) {

        this.testCaseId = testCaseId;
        this.name = name;
        this.automationType = automationType;
        this.actions = actions;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(
            String testCaseId
    ) {
        this.testCaseId = testCaseId;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public AutomationType getAutomationType() {
        return automationType;
    }

    public void setAutomationType(
            AutomationType automationType
    ) {
        this.automationType = automationType;
    }

    public List<NormalizedAutomationAction> getActions() {
        return actions;
    }

    public void setActions(
            List<NormalizedAutomationAction> actions
    ) {
        this.actions = actions;
    }

    public void addAction(
            NormalizedAutomationAction action
    ) {
        this.actions.add(action);
    }
}