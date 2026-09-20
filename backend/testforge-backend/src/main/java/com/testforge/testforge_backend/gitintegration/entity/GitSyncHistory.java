package com.testforge.testforge_backend.gitintegration.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "git_sync_history")
public class GitSyncHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "configuration_id", nullable = false) private GitIntegrationConfiguration configuration;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private GitSyncStatus status;
    @Column(name = "commit_sha", length = 64) private String commitSha;
    @Column(length = 1000) private String summary;
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
    public Long getId(){return id;} public GitIntegrationConfiguration getConfiguration(){return configuration;} public void setConfiguration(GitIntegrationConfiguration v){configuration=v;}
    public GitSyncStatus getStatus(){return status;} public void setStatus(GitSyncStatus v){status=v;} public String getCommitSha(){return commitSha;} public void setCommitSha(String v){commitSha=v;}
    public String getSummary(){return summary;} public void setSummary(String v){summary=v;} public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
