package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.RequirementPriority;
import com.testforge.testforge_backend.domain.enums.RequirementStatus;
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

    @NotNull(message = "Priority is required")
    private RequirementPriority priority;

    @NotNull(message = "Status is required")
    private RequirementStatus status;


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

}