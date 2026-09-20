package com.testforge.testforge_backend.gitintegration.dto;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size;
public record GitSyncRequest(@NotBlank @Size(max=500) String commitMessage) { }
