package com.testforge.testforge_backend.automation.execution;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Component
public class AutomationExecutionRunner {

    private static final int MAX_LOG_LENGTH =
            500_000;

    private static final String GENERATED_PACKAGE =
            "generated.testforge";

    private static final String PLAYWRIGHT_VERSION =
            "1.62.0";

    private static final String JUNIT_VERSION =
            "5.12.2";

    @Value(
            "${testforge.automation.execution.timeout-seconds:120}"
    )
    private long executionTimeoutSeconds;

    @Value(
            "${testforge.automation.execution.browser-install-timeout-seconds:300}"
    )
    private long browserInstallTimeoutSeconds;

    public RunnerResult execute(
            String executionId,
            String className,
            String generatedSource
    ) {

        LocalDateTime startedAt =
                LocalDateTime.now();

        Path workingDirectory =
                null;

        try {

            validateInput(
                    className,
                    generatedSource
            );

            workingDirectory =
                    Files.createTempDirectory(
                            "testforge-"
                                    + sanitizeFileName(
                                    executionId
                            )
                                    + "-"
                    );

            writeTemporaryProject(
                    workingDirectory,
                    className,
                    generatedSource
            );

            StringBuilder completeLog =
                    new StringBuilder();

            /*
             * Only UI-generated scripts need Chromium.
             *
             * Pure API automation through APIRequestContext
             * does not require a browser process.
             */
            if (
                    generatedSource.contains(
                            "playwright.chromium()"
                    )
            ) {

                ProcessResult browserInstallResult =
                        installChromium(
                                workingDirectory
                        );

                appendSection(
                        completeLog,
                        "PLAYWRIGHT BROWSER INSTALL",
                        browserInstallResult.output()
                );

                if (
                        browserInstallResult.timedOut()
                ) {

                    return buildResult(
                            AutomationExecutionStatus.TIMED_OUT,
                            null,
                            completeLog.toString(),
                            "Playwright Chromium installation timed out.",
                            startedAt
                    );
                }

                if (
                        browserInstallResult.exitCode() == null
                                || browserInstallResult.exitCode() != 0
                ) {

                    return buildResult(
                            AutomationExecutionStatus.ERROR,
                            browserInstallResult.exitCode(),
                            completeLog.toString(),
                            "Unable to install or verify the Playwright Chromium browser.",
                            startedAt
                    );
                }
            }

            ProcessResult testResult =
                    runGeneratedTest(
                            workingDirectory,
                            className
                    );

            appendSection(
                    completeLog,
                    "AUTOMATION EXECUTION",
                    testResult.output()
            );

            if (
                    testResult.timedOut()
            ) {

                return buildResult(
                        AutomationExecutionStatus.TIMED_OUT,
                        null,
                        completeLog.toString(),
                        "Automation execution exceeded the configured timeout.",
                        startedAt
                );
            }

            if (
                    testResult.exitCode() != null
                            && testResult.exitCode() == 0
            ) {

                return buildResult(
                        AutomationExecutionStatus.PASSED,
                        0,
                        completeLog.toString(),
                        null,
                        startedAt
                );
            }

            return buildResult(
                    AutomationExecutionStatus.FAILED,
                    testResult.exitCode(),
                    completeLog.toString(),
                    "Generated automation test failed.",
                    startedAt
            );

        } catch (
                Exception exception
        ) {

            return buildResult(
                    AutomationExecutionStatus.ERROR,
                    null,
                    stackMessage(
                            exception
                    ),
                    exception.getMessage(),
                    startedAt
            );

        } finally {

            if (
                    workingDirectory != null
            ) {

                deleteRecursively(
                        workingDirectory
                );
            }
        }
    }

    private void validateInput(
            String className,
            String generatedSource
    ) {

        if (
                className == null
                        || className.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Generated class name is required"
            );
        }

        /*
         * Avoid path traversal or arbitrary path creation.
         */
        if (
                !className.matches(
                        "[A-Za-z_$][A-Za-z0-9_$]*"
                )
        ) {

            throw new IllegalArgumentException(
                    "Generated class name is invalid: "
                            + className
            );
        }

        if (
                generatedSource == null
                        || generatedSource.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Generated Java source is required"
            );
        }

        if (
                !generatedSource.contains(
                        "package "
                                + GENERATED_PACKAGE
                                + ";"
                )
        ) {

            throw new IllegalArgumentException(
                    "Generated Java source must use package "
                            + GENERATED_PACKAGE
            );
        }
    }

    private void writeTemporaryProject(
            Path projectDirectory,
            String className,
            String generatedSource
    ) throws IOException {

        Path sourceDirectory =
                projectDirectory
                        .resolve(
                                "src"
                        )
                        .resolve(
                                "test"
                        )
                        .resolve(
                                "java"
                        )
                        .resolve(
                                "generated"
                        )
                        .resolve(
                                "testforge"
                        );

        Files.createDirectories(
                sourceDirectory
        );

        Path sourceFile =
                sourceDirectory.resolve(
                        className
                                + ".java"
                );

        Files.writeString(
                sourceFile,
                generatedSource,
                StandardCharsets.UTF_8
        );

        Path pomFile =
                projectDirectory.resolve(
                        "pom.xml"
                );

        Files.writeString(
                pomFile,
                buildPom(),
                StandardCharsets.UTF_8
        );
    }

    private String buildPom() {

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <project xmlns="http://maven.apache.org/POM/4.0.0"
                         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                         xsi:schemaLocation="
                           http://maven.apache.org/POM/4.0.0
                           https://maven.apache.org/xsd/maven-4.0.0.xsd">

                    <modelVersion>4.0.0</modelVersion>

                    <groupId>com.testforge.generated</groupId>
                    <artifactId>generated-automation-execution</artifactId>
                    <version>1.0.0</version>

                    <properties>
                        <maven.compiler.release>17</maven.compiler.release>
                        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
                    </properties>

                    <dependencies>

                        <dependency>
                            <groupId>com.microsoft.playwright</groupId>
                            <artifactId>playwright</artifactId>
                            <version>%s</version>
                        </dependency>

                        <dependency>
                            <groupId>org.junit.jupiter</groupId>
                            <artifactId>junit-jupiter</artifactId>
                            <version>%s</version>
                            <scope>test</scope>
                        </dependency>

                    </dependencies>

                    <build>

                        <plugins>

                            <plugin>
                                <groupId>org.apache.maven.plugins</groupId>
                                <artifactId>maven-compiler-plugin</artifactId>
                                <version>3.13.0</version>

                                <configuration>
                                    <release>17</release>
                                </configuration>
                            </plugin>

                            <plugin>
                                <groupId>org.apache.maven.plugins</groupId>
                                <artifactId>maven-surefire-plugin</artifactId>
                                <version>3.5.2</version>

                                <configuration>
                                    <useModulePath>false</useModulePath>
                                </configuration>
                            </plugin>

                            <plugin>
                                <groupId>org.codehaus.mojo</groupId>
                                <artifactId>exec-maven-plugin</artifactId>
                                <version>3.5.0</version>
                            </plugin>

                        </plugins>

                    </build>

                </project>
                """.formatted(
                PLAYWRIGHT_VERSION,
                JUNIT_VERSION
        );
    }

    private ProcessResult installChromium(
            Path projectDirectory
    ) throws Exception {

        List<String> mavenArguments =
                List.of(
                        "-q",
                        "-f",
                        projectDirectory
                                .resolve(
                                        "pom.xml"
                                )
                                .toAbsolutePath()
                                .toString(),
                        "exec:java",
                        "-Dexec.mainClass=com.microsoft.playwright.CLI",
                        "-Dexec.args=install chromium"
                );

        return runMaven(
                projectDirectory,
                mavenArguments,
                browserInstallTimeoutSeconds
        );
    }

    private ProcessResult runGeneratedTest(
            Path projectDirectory,
            String className
    ) throws Exception {

        List<String> mavenArguments =
                List.of(
                        "-f",
                        projectDirectory
                                .resolve(
                                        "pom.xml"
                                )
                                .toAbsolutePath()
                                .toString(),
                        "test",
                        "-Dtest="
                                + className
                );

        return runMaven(
                projectDirectory,
                mavenArguments,
                executionTimeoutSeconds
        );
    }

    private ProcessResult runMaven(
            Path workingDirectory,
            List<String> mavenArguments,
            long timeoutSeconds
    ) throws Exception {

        List<String> command =
                buildMavenCommand(
                        mavenArguments
                );

        ProcessBuilder processBuilder =
                new ProcessBuilder(
                        command
                );

        processBuilder.directory(
                workingDirectory.toFile()
        );

        /*
         * Merge stderr into stdout so logs stay in execution order.
         */
        processBuilder.redirectErrorStream(
                true
        );

        Process process =
                processBuilder.start();

        ExecutorService outputExecutor =
                Executors.newSingleThreadExecutor();

        Future<String> outputFuture =
                outputExecutor.submit(
                        () ->
                                readProcessOutput(
                                        process
                                )
                );

        boolean finished;

        try {

            finished =
                    process.waitFor(
                            timeoutSeconds,
                            TimeUnit.SECONDS
                    );

            if (!finished) {

                process.destroy();

                if (
                        !process.waitFor(
                                5,
                                TimeUnit.SECONDS
                        )
                ) {

                    process.destroyForcibly();

                    process.waitFor(
                            5,
                            TimeUnit.SECONDS
                    );
                }
            }

            String output;

            try {

                output =
                        outputFuture.get(
                                10,
                                TimeUnit.SECONDS
                        );

            } catch (
                    Exception exception
            ) {

                output =
                        "Unable to read complete process output: "
                                + exception.getMessage();
            }

            if (!finished) {

                return new ProcessResult(
                        null,
                        true,
                        output
                );
            }

            return new ProcessResult(
                    process.exitValue(),
                    false,
                    output
            );

        } finally {

            outputExecutor.shutdownNow();
        }
    }

    private List<String> buildMavenCommand(
            List<String> mavenArguments
    ) {

        boolean windows =
                System
                        .getProperty(
                                "os.name",
                                ""
                        )
                        .toLowerCase(
                                Locale.ROOT
                        )
                        .contains(
                                "win"
                        );

        Path backendRoot =
                Path.of(
                                System.getProperty(
                                        "user.dir"
                                )
                        )
                        .toAbsolutePath()
                        .normalize();

        Path wrapper =
                backendRoot.resolve(
                        windows
                                ? "mvnw.cmd"
                                : "mvnw"
                );

        List<String> command =
                new ArrayList<>();

        if (
                windows
                        && Files.exists(
                        wrapper
                )
        ) {

            command.add(
                    "cmd.exe"
            );

            command.add(
                    "/c"
            );

            command.add(
                    wrapper.toString()
            );

        } else if (
                Files.exists(
                        wrapper
                )
        ) {

            command.add(
                    wrapper.toString()
            );

        } else {

            command.add(
                    windows
                            ? "mvn.cmd"
                            : "mvn"
            );
        }

        command.addAll(
                mavenArguments
        );

        return command;
    }

    private String readProcessOutput(
            Process process
    ) throws IOException {

        StringBuilder output =
                new StringBuilder();

        boolean truncated =
                false;

        try (
                BufferedReader reader =
                        process.inputReader(
                                StandardCharsets.UTF_8
                        )
        ) {

            String line;

            while (
                    (line =
                            reader.readLine())
                            != null
            ) {

                if (
                        output.length()
                                < MAX_LOG_LENGTH
                ) {

                    output
                            .append(
                                    line
                            )
                            .append(
                                    System.lineSeparator()
                            );

                } else {

                    truncated =
                            true;
                }
            }
        }

        if (
                truncated
        ) {

            output.append(
                    System.lineSeparator()
            );

            output.append(
                    "[TestForge] Log output truncated after "
                            + MAX_LOG_LENGTH
                            + " characters."
            );
        }

        return output.toString();
    }

    private void appendSection(
            StringBuilder destination,
            String title,
            String output
    ) {

        destination
                .append(
                        System.lineSeparator()
                )
                .append(
                        "=================================================="
                )
                .append(
                        System.lineSeparator()
                )
                .append(
                        title
                )
                .append(
                        System.lineSeparator()
                )
                .append(
                        "=================================================="
                )
                .append(
                        System.lineSeparator()
                );

        if (
                output == null
                        || output.isBlank()
        ) {

            destination.append(
                    "(no output)"
            );

        } else {

            destination.append(
                    output
            );
        }

        destination.append(
                System.lineSeparator()
        );
    }

    private RunnerResult buildResult(
            AutomationExecutionStatus status,
            Integer exitCode,
            String logOutput,
            String errorMessage,
            LocalDateTime startedAt
    ) {

        LocalDateTime finishedAt =
                LocalDateTime.now();

        long durationMs =
                Duration
                        .between(
                                startedAt,
                                finishedAt
                        )
                        .toMillis();

        return new RunnerResult(
                status,
                exitCode,
                logOutput,
                errorMessage,
                startedAt,
                finishedAt,
                durationMs
        );
    }

    private String sanitizeFileName(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return "execution";
        }

        return value.replaceAll(
                "[^A-Za-z0-9-_]",
                "-"
        );
    }

    private String stackMessage(
            Exception exception
    ) {

        StringBuilder value =
                new StringBuilder();

        value.append(
                exception.getClass()
                        .getName()
        );

        value.append(
                ": "
        );

        value.append(
                exception.getMessage()
                        == null
                        ? "(no message)"
                        : exception.getMessage()
        );

        Throwable cause =
                exception.getCause();

        if (
                cause != null
        ) {

            value
                    .append(
                            System.lineSeparator()
                    )
                    .append(
                            "Caused by: "
                    )
                    .append(
                            cause.getClass()
                                    .getName()
                    )
                    .append(
                            ": "
                    )
                    .append(
                            cause.getMessage()
                    );
        }

        return value.toString();
    }

    private void deleteRecursively(
            Path root
    ) {

        try {

            if (
                    !Files.exists(
                            root
                    )
            ) {
                return;
            }

            try (
                    var stream =
                            Files.walk(
                                    root
                            )
            ) {

                stream
                        .sorted(
                                Comparator.reverseOrder()
                        )
                        .forEach(
                                path -> {

                                    try {

                                        Files.deleteIfExists(
                                                path
                                        );

                                    } catch (
                                            IOException ignored
                                    ) {

                                        /*
                                         * Best-effort cleanup.
                                         */
                                    }
                                }
                        );
            }

        } catch (
                IOException ignored
        ) {

            /*
             * Best-effort cleanup.
             */
        }
    }

    private record ProcessResult(

            Integer exitCode,

            boolean timedOut,

            String output
    ) {
    }

    public record RunnerResult(

            AutomationExecutionStatus status,

            Integer exitCode,

            String logOutput,

            String errorMessage,

            LocalDateTime startedAt,

            LocalDateTime finishedAt,

            Long durationMs
    ) {
    }
}