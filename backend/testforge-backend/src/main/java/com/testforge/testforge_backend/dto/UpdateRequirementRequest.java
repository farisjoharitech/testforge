package com.testforge.testforge_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateRequirementRequest {

    @NotBlank(message = "Description is required")
    @Size(
            max = 1000,
            message = "Description must not exceed 1000 characters"
    )
    private String description;

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

    @NotNull(message = "Automatable is required")
    private Boolean automatable;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAutomatable() {
        return automatable;
    }

    public void setAutomatable(Boolean automatable) {
        this.automatable = automatable;
    }
}