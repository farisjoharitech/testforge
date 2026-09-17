package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AutomationArtifactServiceTest {

    @TempDir
    Path tempDirectory;

    @Test
    void shouldReturnFailureScreenshot() throws Exception {
        AutomationExecutionRepository repository =
                mock(AutomationExecutionRepository.class);

        AutomationExecution execution =
                execution("EXEC-001");

        execution.setFailureScreenshotPath(
                Path.of("EXEC-001", "failure.png").toString()
        );

        Path screenshot = tempDirectory
                .resolve("EXEC-001")
                .resolve("failure.png");

        Files.createDirectories(screenshot.getParent());
        Files.writeString(screenshot, "png");

        when(repository.findByExecutionId("EXEC-001"))
                .thenReturn(Optional.of(execution));

        AutomationArtifactService service =
                new AutomationArtifactService(
                        repository,
                        tempDirectory.toString()
                );

        AutomationArtifactService.ArtifactDownload artifact =
                service.getArtifact(
                        "EXEC-001",
                        "screenshot"
                );

        assertEquals(
                "image/png",
                artifact.contentType()
        );

        assertEquals(
                "EXEC-001-failure.png",
                artifact.filename()
        );

        assertEquals(
                3,
                artifact.resource().contentLength()
        );
    }

    @Test
    void shouldRejectArtifactOutsideConfiguredRoot() {
        AutomationExecutionRepository repository =
                mock(AutomationExecutionRepository.class);

        AutomationExecution execution =
                execution("EXEC-002");

        execution.setTracePath(
                Path.of("..", "trace.zip").toString()
        );

        when(repository.findByExecutionId("EXEC-002"))
                .thenReturn(Optional.of(execution));

        AutomationArtifactService service =
                new AutomationArtifactService(
                        repository,
                        tempDirectory.toString()
                );

        assertThrows(
                AutomationNotFoundException.class,
                () -> service.getArtifact(
                        "EXEC-002",
                        "trace"
                )
        );
    }

    private AutomationExecution execution(
            String executionId
    ) {
        return new AutomationExecution(
                executionId,
                null,
                null,
                AutomationExecutionStatus.FAILED,
                "GeneratedTest",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }
}
