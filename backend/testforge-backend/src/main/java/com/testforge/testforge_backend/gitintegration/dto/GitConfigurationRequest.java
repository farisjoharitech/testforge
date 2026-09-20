package com.testforge.testforge_backend.gitintegration.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record GitConfigurationRequest(@NotBlank @Size(max=1000) String repositoryUrl,
 @NotBlank @Size(max=255) String branch, @NotBlank @Size(max=500) String automationProjectPath,
 @NotBlank @Size(max=500) String commitMessageTemplate, @Size(max=255) String credentialUsername,
 @Size(max=2000) String credentialToken) { }
