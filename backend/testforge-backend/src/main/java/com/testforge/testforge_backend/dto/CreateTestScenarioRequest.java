package com.testforge.testforge_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTestScenarioRequest {

    @NotBlank(message = "Scenario ID is required")
    @Size(
            max = 50,
            message = "Scenario ID must not exceed 50 characters"
    )
    private String scenarioId;

    @NotBlank(message = "Description is required")
    @Size(
            max = 1000,
            message = "Description must not exceed 1000 characters"
    )
    private String description;

    @NotBlank(message = "Test Type is required")
    @Size(
            max = 50,
            message = "Test Type must not exceed 50 characters"
    )
    private String testType;

    @NotNull(message = "Automatable is required")
    private Boolean automatable;

    @NotBlank(message = "Priority is required")
    @Size(
            max = 50,
            message = "Priority must not exceed 50 characters"
    )
    private String priority;

    @NotBlank(message = "Status is required")
    @Size(
            max = 50,
            message = "Status must not exceed 50 characters"
    )
    private String status;

    public String getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(String scenarioId) {
        this.scenarioId = scenarioId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public String getTestType() {
        return testType;
    }

    public void setTestType(
            String testType
    ) {
        this.testType = testType;
    }

    public Boolean getAutomatable() {
        return automatable;
    }

    public void setAutomatable(
            Boolean automatable
    ) {
        this.automatable = automatable;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(
            String priority
    ) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status
    ) {
        this.status = status;
    }
}