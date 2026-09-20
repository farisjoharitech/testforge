package com.testforge.testforge_backend.gitintegration.service;

import com.testforge.testforge_backend.gitintegration.dto.GitChangeResponse;
import java.util.Map;

public interface GitRepositoryClient {
    void testConnection(RepositoryTarget target, GitCredentialVault.Credential credential);
    GitChangeResponse preview(RepositoryTarget target, GitCredentialVault.Credential credential, Map<String,String> files, String contentHash);
    PushResult sync(RepositoryTarget target, GitCredentialVault.Credential credential, Map<String,String> files, String contentHash, String commitMessage);
    record RepositoryTarget(String projectId,String repositoryUrl,String branch,String projectPath) { }
    record PushResult(boolean changed,String commitSha,GitChangeResponse changes) { }
}
