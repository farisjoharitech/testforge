package com.testforge.testforge_backend.gitintegration.dto;
import com.testforge.testforge_backend.gitintegration.entity.GitSyncStatus;
public record GitSyncResponse(GitSyncStatus status,String message,String commitSha,GitChangeResponse changes) { }
