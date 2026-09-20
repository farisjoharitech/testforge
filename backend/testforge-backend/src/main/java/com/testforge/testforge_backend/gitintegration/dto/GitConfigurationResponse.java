package com.testforge.testforge_backend.gitintegration.dto;
import com.testforge.testforge_backend.gitintegration.entity.GitSyncStatus;
import java.time.LocalDateTime;
import java.util.List;
public record GitConfigurationResponse(boolean configured,String projectId,String repositoryUrl,String branch,String automationProjectPath,
 String commitMessageTemplate,boolean credentialConfigured,GitSyncStatus status,LocalDateTime lastSyncAt,
 String lastCommitSha,String lastErrorSummary,List<GitSyncHistoryResponse> recentSyncs) { }
