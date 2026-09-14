package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.ProjectStatus;

import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;
    private String projectId;
    private String name;
    private String description;
    private ProjectStatus status;
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

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(
            String projectId
    ) {
        this.projectId = projectId;
    }

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
