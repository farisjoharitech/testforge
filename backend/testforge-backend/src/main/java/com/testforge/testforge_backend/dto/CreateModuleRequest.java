package com.testforge.testforge_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateModuleRequest {
    @Size(max = 50, message = "Module ID must not exceed 50 characters")
    private String moduleId;
    @NotBlank(message = "Module name is required")
    @Size(max = 255, message = "Module name must not exceed 255 characters")
    private String name;
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
