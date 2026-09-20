package com.testforge.testforge_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateModuleRequest {
    @NotBlank(message = "Module name is required")
    @Size(max = 255, message = "Module name must not exceed 255 characters")
    private String name;
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
