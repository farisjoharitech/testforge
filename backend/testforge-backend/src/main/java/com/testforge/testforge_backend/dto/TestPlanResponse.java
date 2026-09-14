package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.ApprovalStatus;
import com.testforge.testforge_backend.domain.enums.TestPlanStatus;

import java.time.LocalDateTime;

public class TestPlanResponse {

    private Long id;
    private String testPlanId;
    private Long projectId;
    private String projectBusinessId;
    private String projectName;
    private String project;
    private String name;
    private String version;
    private String application;
    private String environment;
    private String preparedBy;
    private TestPlanStatus status;
    private ApprovalStatus approvalStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTestPlanId() { return testPlanId; }
    public void setTestPlanId(String testPlanId) { this.testPlanId = testPlanId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectBusinessId() { return projectBusinessId; }
    public void setProjectBusinessId(String projectBusinessId) {
        this.projectBusinessId = projectBusinessId;
    }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getApplication() { return application; }
    public void setApplication(String application) { this.application = application; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public String getPreparedBy() { return preparedBy; }
    public void setPreparedBy(String preparedBy) { this.preparedBy = preparedBy; }

    public TestPlanStatus getStatus() { return status; }
    public void setStatus(TestPlanStatus status) { this.status = status; }

    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
