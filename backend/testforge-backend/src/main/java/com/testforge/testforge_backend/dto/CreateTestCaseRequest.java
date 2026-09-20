package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestCaseStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTestCaseRequest {

    @Size(
            max = 50,
            message =
                    "Test Case ID must not exceed 50 characters"
    )
    private String testCaseId;

    @NotBlank(
            message =
                    "Name is required"
    )
    @Size(
            max = 255,
            message =
                    "Name must not exceed 255 characters"
    )
    private String name;

    @Size(
            max = 2000,
            message =
                    "Preconditions must not exceed 2000 characters"
    )
    private String preconditions;

    @Size(
            max = 2000,
            message =
                    "Test Data must not exceed 2000 characters"
    )
    private String testData;

    @NotBlank(
            message =
                    "Expected Result is required"
    )
    @Size(
            max = 2000,
            message =
                    "Expected Result must not exceed 2000 characters"
    )
    private String expectedResult;

    @NotNull(
            message =
                    "Priority is required"
    )
    private TestCasePriority priority;

    @NotNull(
            message =
                    "Test Type is required"
    )
    private TestType testType;

    /* Legacy compatibility field. Scenario now owns eligibility. */
    private Boolean automatable;

    @NotNull(
            message =
                    "Automation Type is required"
    )
    private AutomationType automationType;

    /*
     * automationStatus intentionally
     * does NOT belong here.
     *
     * The backend owns the automation
     * lifecycle.
     */

    @NotNull(
            message =
                    "Status is required"
    )
    private TestCaseStatus status;

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(
            String testCaseId
    ) {
        this.testCaseId =
                testCaseId;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name =
                name;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(
            String preconditions
    ) {
        this.preconditions =
                preconditions;
    }

    public String getTestData() {
        return testData;
    }

    public void setTestData(
            String testData
    ) {
        this.testData =
                testData;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(
            String expectedResult
    ) {
        this.expectedResult =
                expectedResult;
    }

    public TestCasePriority getPriority() {
        return priority;
    }

    public void setPriority(
            TestCasePriority priority
    ) {
        this.priority =
                priority;
    }

    public TestType getTestType() {
        return testType;
    }

    public void setTestType(
            TestType testType
    ) {
        this.testType =
                testType;
    }

    public Boolean getAutomatable() {
        return automatable;
    }

    public void setAutomatable(
            Boolean automatable
    ) {
        this.automatable =
                automatable;
    }

    public AutomationType getAutomationType() {
        return automationType;
    }

    public void setAutomationType(
            AutomationType automationType
    ) {
        this.automationType =
                automationType;
    }

    public TestCaseStatus getStatus() {
        return status;
    }

    public void setStatus(
            TestCaseStatus status
    ) {
        this.status =
                status;
    }
}
