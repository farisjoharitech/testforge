package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.TestScenarioPriority;
import com.testforge.testforge_backend.domain.enums.TestScenarioStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTestScenarioRequest {

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

    @NotNull(message = "Test Type is required")
    private TestType testType;


    @NotNull(message = "Priority is required")
    private TestScenarioPriority priority;

    @NotNull(message = "Status is required")
    private TestScenarioStatus status;

    public String getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(
            String scenarioId
    ) {
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

    public TestType getTestType() {
        return testType;
    }

    public void setTestType(
            TestType testType
    ) {
        this.testType = testType;
    }


    public TestScenarioPriority getPriority() {
        return priority;
    }

    public void setPriority(
            TestScenarioPriority priority
    ) {
        this.priority = priority;
    }

    public TestScenarioStatus getStatus() {
        return status;
    }

    public void setStatus(
            TestScenarioStatus status
    ) {
        this.status = status;
    }
}