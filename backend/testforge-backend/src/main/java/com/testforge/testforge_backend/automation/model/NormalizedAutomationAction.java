package com.testforge.testforge_backend.automation.model;

public class NormalizedAutomationAction {

    private String sourceStepId;

    private Integer stepOrder;

    private AutomationActionType actionType;

    private String target;

    private NormalizedSelector selector;

    private String value;

    private String expectedValue;

    public NormalizedAutomationAction() {
    }

    public NormalizedAutomationAction(
            String sourceStepId,
            Integer stepOrder,
            AutomationActionType actionType,
            String target,
            NormalizedSelector selector,
            String value,
            String expectedValue) {

        this.sourceStepId = sourceStepId;
        this.stepOrder = stepOrder;
        this.actionType = actionType;
        this.target = target;
        this.selector = selector;
        this.value = value;
        this.expectedValue = expectedValue;
    }

    public String getSourceStepId() {
        return sourceStepId;
    }

    public void setSourceStepId(
            String sourceStepId
    ) {
        this.sourceStepId = sourceStepId;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(
            Integer stepOrder
    ) {
        this.stepOrder = stepOrder;
    }

    public AutomationActionType getActionType() {
        return actionType;
    }

    public void setActionType(
            AutomationActionType actionType
    ) {
        this.actionType = actionType;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(
            String target
    ) {
        this.target = target;
    }

    public NormalizedSelector getSelector() {
        return selector;
    }

    public void setSelector(
            NormalizedSelector selector
    ) {
        this.selector = selector;
    }

    public String getValue() {
        return value;
    }

    public void setValue(
            String value
    ) {
        this.value = value;
    }

    public String getExpectedValue() {
        return expectedValue;
    }

    public void setExpectedValue(
            String expectedValue
    ) {
        this.expectedValue = expectedValue;
    }
}