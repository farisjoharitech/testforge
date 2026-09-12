package com.testforge.testforge_backend.dto;

import java.time.LocalDateTime;

public class TestStepResponse {

    private Long id;

    private String testStepId;

    private Long testCaseId;

    private String testCaseBusinessId;

    private Integer stepOrder;

    private String action;

    private String target;

    private String inputValue;

    private String expectedResult;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getTestStepId() {
        return testStepId;
    }

    public void setTestStepId(
            String testStepId
    ) {
        this.testStepId = testStepId;
    }

    public Long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(
            Long testCaseId
    ) {
        this.testCaseId = testCaseId;
    }

    public String getTestCaseBusinessId() {
        return testCaseBusinessId;
    }

    public void setTestCaseBusinessId(
            String testCaseBusinessId
    ) {
        this.testCaseBusinessId =
                testCaseBusinessId;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(
            Integer stepOrder
    ) {
        this.stepOrder = stepOrder;
    }

    public String getAction() {
        return action;
    }

    public void setAction(
            String action
    ) {
        this.action = action;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(
            String target
    ) {
        this.target = target;
    }

    public String getInputValue() {
        return inputValue;
    }

    public void setInputValue(
            String inputValue
    ) {
        this.inputValue = inputValue;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(
            String expectedResult
    ) {
        this.expectedResult = expectedResult;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}