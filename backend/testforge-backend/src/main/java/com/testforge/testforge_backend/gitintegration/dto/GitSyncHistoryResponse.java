package com.testforge.testforge_backend.gitintegration.dto;
import com.testforge.testforge_backend.gitintegration.entity.GitSyncStatus;
import java.time.LocalDateTime;
public record GitSyncHistoryResponse(GitSyncStatus status,String commitSha,String summary,LocalDateTime createdAt) { }
