package com.testforge.testforge_backend.gitintegration.entity;

import com.testforge.testforge_backend.domain.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "git_integration_configuration")
public class GitIntegrationConfiguration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false, unique = true) private Project project;
    @Column(name = "repository_url", nullable = false, length = 1000) private String repositoryUrl;
    @Column(name = "branch_name", nullable = false, length = 255) private String branchName;
    @Column(name = "automation_project_path", nullable = false, length = 500) private String automationProjectPath;
    @Column(name = "commit_message_template", nullable = false, length = 500) private String commitMessageTemplate;
    @Column(name = "last_successful_content_hash", length = 64) private String lastSuccessfulContentHash;
    @Enumerated(EnumType.STRING) @Column(name = "last_sync_status", nullable = false, length = 30) private GitSyncStatus lastSyncStatus;
    @Column(name = "last_sync_at") private LocalDateTime lastSyncAt;
    @Column(name = "last_commit_sha", length = 64) private String lastCommitSha;
    @Column(name = "last_error_summary", length = 1000) private String lastErrorSummary;
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;

    public Long getId(){return id;} public Project getProject(){return project;} public void setProject(Project v){project=v;}
    public String getRepositoryUrl(){return repositoryUrl;} public void setRepositoryUrl(String v){repositoryUrl=v;}
    public String getBranchName(){return branchName;} public void setBranchName(String v){branchName=v;}
    public String getAutomationProjectPath(){return automationProjectPath;} public void setAutomationProjectPath(String v){automationProjectPath=v;}
    public String getCommitMessageTemplate(){return commitMessageTemplate;} public void setCommitMessageTemplate(String v){commitMessageTemplate=v;}
    public String getLastSuccessfulContentHash(){return lastSuccessfulContentHash;} public void setLastSuccessfulContentHash(String v){lastSuccessfulContentHash=v;}
    public GitSyncStatus getLastSyncStatus(){return lastSyncStatus;} public void setLastSyncStatus(GitSyncStatus v){lastSyncStatus=v;}
    public LocalDateTime getLastSyncAt(){return lastSyncAt;} public void setLastSyncAt(LocalDateTime v){lastSyncAt=v;}
    public String getLastCommitSha(){return lastCommitSha;} public void setLastCommitSha(String v){lastCommitSha=v;}
    public String getLastErrorSummary(){return lastErrorSummary;} public void setLastErrorSummary(String v){lastErrorSummary=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
    public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){updatedAt=v;}
}
