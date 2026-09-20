package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.TestScenarioPriority;
import com.testforge.testforge_backend.domain.enums.TestScenarioStatus;
import com.testforge.testforge_backend.domain.enums.TestType;

import java.time.LocalDateTime;

public class TestScenarioResponse {

    private Long id;

    private String scenarioId;

    private Long requirementId;

    private String requirementBusinessId;

    private String description;

    private TestType testType;

    private boolean automatable;

    private TestScenarioPriority priority;

    private TestScenarioStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(
            String scenarioId
    ) {
        this.scenarioId = scenarioId;
    }

    public Long getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(
            Long requirementId
    ) {
        this.requirementId = requirementId;
    }

    public String getRequirementBusinessId() {
        return requirementBusinessId;
    }

    public void setRequirementBusinessId(
            String requirementBusinessId
    ) {
        this.requirementBusinessId =
                requirementBusinessId;
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

    public boolean isAutomatable() {
        return automatable;
    }

    public void setAutomatable(boolean automatable) {
        this.automatable = automatable;
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
