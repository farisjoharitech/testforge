package com.testforge.testforge_backend.automation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateMultiTestCaseRunRequest(
        @NotNull
        @Size(min = 2, message = "Select at least two Test Cases")
        List<@NotNull Long> testCaseIds
) {
}
