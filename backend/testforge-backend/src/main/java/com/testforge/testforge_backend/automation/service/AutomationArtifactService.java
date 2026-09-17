package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

@Service
public class AutomationArtifactService {

    private final AutomationExecutionRepository automationExecutionRepository;
    private final Path artifactRoot;

    public AutomationArtifactService(
            AutomationExecutionRepository automationExecutionRepository,
            @Value("${testforge.automation.artifacts.directory:automation/artifacts}")
            String artifactDirectory
    ) {
        this.automationExecutionRepository = automationExecutionRepository;
        this.artifactRoot = Path.of(artifactDirectory)
                .toAbsolutePath()
                .normalize();
    }

    @Transactional(readOnly = true)
    public ArtifactDownload getArtifact(
            String executionId,
            String artifactType
    ) {
        if (executionId == null || executionId.isBlank()) {
            throw new IllegalArgumentException("Execution ID is required");
        }

        if (artifactType == null || artifactType.isBlank()) {
            throw new IllegalArgumentException("Artifact type is required");
        }

        AutomationExecution execution = automationExecutionRepository
                .findByExecutionId(executionId.trim())
                .orElseThrow(() -> new AutomationNotFoundException(
                        "Automation execution not found: " + executionId));

        return switch (artifactType.trim().toLowerCase(Locale.ROOT)) {
            case "screenshot" -> fileArtifact(
                    execution.getFailureScreenshotPath(),
                    "image/png",
                    execution.getExecutionId() + "-failure.png",
                    true
            );

            case "trace" -> fileArtifact(
                    execution.getTracePath(),
                    "application/zip",
                    execution.getExecutionId() + "-trace.zip",
                    false
            );

            case "log" -> logArtifact(execution);

            default -> throw new AutomationNotFoundException(
                    "Automation artifact not found: " + artifactType);
        };
    }

    private ArtifactDownload fileArtifact(
            String storedPath,
            String contentType,
            String filename,
            boolean inline
    ) {
        if (storedPath == null || storedPath.isBlank()) {
            throw new AutomationNotFoundException(
                    "Requested automation artifact is not available");
        }

        Path resolved = artifactRoot
                .resolve(storedPath)
                .normalize();

        if (!resolved.startsWith(artifactRoot) || !Files.isRegularFile(resolved)) {
            throw new AutomationNotFoundException(
                    "Requested automation artifact is not available");
        }

        return new ArtifactDownload(
                new FileSystemResource(resolved),
                contentType,
                filename,
                inline
        );
    }

    private ArtifactDownload logArtifact(
            AutomationExecution execution
    ) {
        String log = execution.getLogOutput();

        if (log == null || log.isBlank()) {
            throw new AutomationNotFoundException(
                    "Execution log is not available");
        }

        return new ArtifactDownload(
                new ByteArrayResource(log.getBytes(StandardCharsets.UTF_8)),
                "text/plain;charset=UTF-8",
                execution.getExecutionId() + "-execution.log",
                false
        );
    }

    public record ArtifactDownload(
            Resource resource,
            String contentType,
            String filename,
            boolean inline
    ) {
    }
}
