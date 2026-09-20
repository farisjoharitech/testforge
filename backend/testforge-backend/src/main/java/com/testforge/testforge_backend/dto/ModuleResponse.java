package com.testforge.testforge_backend.dto;

import java.time.LocalDateTime;

public record ModuleResponse(Long id, String moduleId, Long projectId,
                             String projectBusinessId, String projectName,
                             Long testPlanId, String testPlanBusinessId, String testPlanName,
                             String name, String description,
                             LocalDateTime createdAt, LocalDateTime updatedAt) {}
