package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateProjectRequest {

    @NotBlank(
            message = "Name is required"
    )
    @Size(
            max = 255,
            message = "Name must not exceed 255 characters"
    )
    private String name;

    @Size(
            max = 1000,
            message = "Description must not exceed 1000 characters"
    )
    private String description;

    @NotNull(
            message = "Status is required"
    )
    private ProjectStatus status;

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(
            ProjectStatus status
    ) {
        this.status = status;
    }
}
