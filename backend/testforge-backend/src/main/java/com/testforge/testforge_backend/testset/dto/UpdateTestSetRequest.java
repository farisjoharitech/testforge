package com.testforge.testforge_backend.testset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateTestSetRequest(
        @NotBlank(message = "Test Set name is required")
        @Size(max = 255, message = "Test Set name must be 255 characters or fewer")
        String name,

        @Size(max = 2000, message = "Description must be 2000 characters or fewer")
        String description,

        @NotEmpty(message = "Select at least one Test Case")
        List<@NotNull Long> testCaseIds
) {
}
