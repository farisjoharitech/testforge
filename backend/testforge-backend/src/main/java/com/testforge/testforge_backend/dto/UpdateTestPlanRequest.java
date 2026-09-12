package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.ApprovalStatus;
import com.testforge.testforge_backend.domain.enums.TestPlanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateTestPlanRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Version must not exceed 50 characters")
    private String version;

    @Size(max = 255, message = "Project must not exceed 255 characters")
    private String project;

    @Size(max = 255, message = "Application must not exceed 255 characters")
    private String application;

    @Size(max = 100, message = "Environment must not exceed 100 characters")
    private String environment;

    @Size(max = 255, message = "Prepared By must not exceed 255 characters")
    private String preparedBy;

    @NotNull(message = "Status is required")
    private TestPlanStatus status;

    @NotNull(message = "Approval Status is required")
    private ApprovalStatus approvalStatus;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getPreparedBy() {
        return preparedBy;
    }

    public void setPreparedBy(String preparedBy) {
        this.preparedBy = preparedBy;
    }

    public TestPlanStatus getStatus() {
        return status;
    }

    public void setStatus(TestPlanStatus status) {
        this.status = status;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
}