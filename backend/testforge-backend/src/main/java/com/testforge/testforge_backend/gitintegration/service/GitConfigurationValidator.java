package com.testforge.testforge_backend.gitintegration.service;

import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.nio.file.Path;

@Component
public class GitConfigurationValidator {
    public void validate(String repositoryUrl, String branch, String projectPath, String commitMessage) {
        validateRepository(repositoryUrl);
        if (!branch.matches("[A-Za-z0-9][A-Za-z0-9._/-]{0,254}") || branch.contains("..") || branch.contains("//") || branch.endsWith("/") || branch.endsWith(".")) {
            throw new GitIntegrationException("Branch name is invalid.");
        }
        Path path;
        try { path = Path.of(projectPath); } catch (RuntimeException exception) { throw new GitIntegrationException("Automation Project Path is invalid."); }
        Path normalized=path.normalize();
        if (path.isAbsolute() || projectPath.contains("\\") || normalized.startsWith("..") || normalized.toString().isBlank() || normalized.toString().equals(".") || normalized.startsWith(".git") || projectPath.contains(":")) {
            throw new GitIntegrationException("Automation Project Path must be a relative path inside the repository.");
        }
        if (commitMessage == null || commitMessage.isBlank() || commitMessage.length() > 500 || commitMessage.chars().anyMatch(c -> c == 0 || c == '\r' || c == '\n')) {
            throw new GitIntegrationException("Commit message must be a single line between 1 and 500 characters.");
        }
    }

    private void validateRepository(String value) {
        try {
            URI uri = URI.create(value);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getUserInfo() != null || uri.getFragment() != null || uri.getQuery()!=null) {
                throw new GitIntegrationException("Repository URL must be an HTTPS URL without embedded credentials.");
            }
        } catch (IllegalArgumentException exception) {
            throw new GitIntegrationException("Repository URL is invalid.");
        }
    }
}
