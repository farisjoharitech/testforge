package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.RequirementPriority;
import com.testforge.testforge_backend.domain.enums.RequirementStatus;

import java.time.LocalDateTime;

public class RequirementResponse {

    private Long id;

    private String requirementId;

    private Long testPlanId;

    private String testPlanBusinessId;

    private String description;

    private RequirementPriority priority;

    private RequirementStatus status;

    private boolean automatable;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(
            String requirementId
    ) {
        this.requirementId = requirementId;
    }

    public Long getTestPlanId() {
        return testPlanId;
    }

    public void setTestPlanId(
            Long testPlanId
    ) {
        this.testPlanId = testPlanId;
    }

    public String getTestPlanBusinessId() {
        return testPlanBusinessId;
    }

    public void setTestPlanBusinessId(
            String testPlanBusinessId
    ) {
        this.testPlanBusinessId = testPlanBusinessId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public RequirementPriority getPriority() {
        return priority;
    }

    public void setPriority(
            RequirementPriority priority
    ) {
        this.priority = priority;
    }

    public RequirementStatus getStatus() {
        return status;
    }

    public void setStatus(
            RequirementStatus status
    ) {
        this.status = status;
    }

    public boolean isAutomatable() {
        return automatable;
    }

    public void setAutomatable(
            boolean automatable
    ) {
        this.automatable = automatable;
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