package com.testforge.testforge_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTestStepRequest {

    @NotBlank(message = "Test Step ID is required")
    @Size(
            max = 50,
            message = "Test Step ID must not exceed 50 characters"
    )
    private String testStepId;

    @NotNull(message = "Step Order is required")
    @Min(
            value = 1,
            message = "Step Order must be at least 1"
    )
    private Integer stepOrder;

    @NotBlank(message = "Action is required")
    @Size(
            max = 1000,
            message = "Action must not exceed 1000 characters"
    )
    private String action;

    @Size(
            max = 500,
            message = "Target must not exceed 500 characters"
    )
    private String target;

    @Size(
            max = 2000,
            message = "Input Value must not exceed 2000 characters"
    )
    private String inputValue;

    @Size(
            max = 2000,
            message = "Expected Result must not exceed 2000 characters"
    )
    private String expectedResult;

    public String getTestStepId() {
        return testStepId;
    }

    public void setTestStepId(
            String testStepId
    ) {
        this.testStepId = testStepId;
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
}