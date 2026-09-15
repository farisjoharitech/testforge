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
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

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

    private static final long PROCESS_SHUTDOWN_TIMEOUT_SECONDS =
            5;

    private static final long OUTPUT_READER_JOIN_TIMEOUT_MILLIS =
            10_000;

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
             * Only UI-generated scripts require Chromium.
             *
             * Pure API tests using APIRequestContext do not
             * require a browser installation.
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
                            <groupId>com.fasterxml.jackson.core</groupId>
                            <artifactId>jackson-databind</artifactId>
                            <version>2.18.3</version>
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
                        "-B",
                        "-ntp",
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
                        "-B",
                        "-ntp",
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
         * Keep stderr and stdout in one stream so execution
         * logs remain in approximately the same order Maven
         * produced them.
         */
        processBuilder.redirectErrorStream(
                true
        );

        Process process =
                processBuilder.start();

        StringBuilder liveOutput =
                new StringBuilder();

        AtomicBoolean outputTruncated =
                new AtomicBoolean(
                        false
                );

        Thread outputReaderThread =
                createOutputReaderThread(
                        process,
                        liveOutput,
                        outputTruncated
                );

        outputReaderThread.start();

        boolean finished =
                process.waitFor(
                        timeoutSeconds,
                        TimeUnit.SECONDS
                );

        if (!finished) {

            appendLiveOutput(
                    liveOutput,
                    System.lineSeparator()
                            + "[TestForge] Execution timeout reached after "
                            + timeoutSeconds
                            + " seconds. Terminating Maven process tree."
                            + System.lineSeparator(),
                    outputTruncated
            );

            terminateProcessTree(
                    process
            );
        }

        waitForOutputReader(
                outputReaderThread,
                liveOutput,
                outputTruncated
        );

        String output =
                snapshotOutput(
                        liveOutput,
                        outputTruncated
                );

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
    }

    private Thread createOutputReaderThread(
            Process process,
            StringBuilder liveOutput,
            AtomicBoolean outputTruncated
    ) {

        Thread thread =
                new Thread(
                        () -> {

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

                                    appendLiveOutput(
                                            liveOutput,
                                            line
                                                    + System.lineSeparator(),
                                            outputTruncated
                                    );
                                }

                            } catch (
                                    IOException exception
                            ) {

                                appendLiveOutput(
                                        liveOutput,
                                        System.lineSeparator()
                                                + "[TestForge] Unable to continue reading process output: "
                                                + safeMessage(
                                                exception
                                        )
                                                + System.lineSeparator(),
                                        outputTruncated
                                );
                            }
                        },
                        "testforge-automation-output-reader"
                );

        /*
         * Never allow a stuck child-process stream to prevent
         * the Spring Boot JVM from shutting down.
         */
        thread.setDaemon(
                true
        );

        return thread;
    }

    private void appendLiveOutput(
            StringBuilder output,
            String value,
            AtomicBoolean truncated
    ) {

        if (
                value == null
                        || value.isEmpty()
        ) {
            return;
        }

        synchronized (
                output
        ) {

            if (
                    output.length()
                            >= MAX_LOG_LENGTH
            ) {

                truncated.set(
                        true
                );

                return;
            }

            int remaining =
                    MAX_LOG_LENGTH
                            - output.length();

            if (
                    value.length()
                            <= remaining
            ) {

                output.append(
                        value
                );

            } else {

                output.append(
                        value,
                        0,
                        remaining
                );

                truncated.set(
                        true
                );
            }
        }
    }

    private String snapshotOutput(
            StringBuilder liveOutput,
            AtomicBoolean outputTruncated
    ) {

        String value;

        synchronized (
                liveOutput
        ) {

            value =
                    liveOutput.toString();
        }

        if (
                outputTruncated.get()
        ) {

            value =
                    value
                            + System.lineSeparator()
                            + "[TestForge] Log output truncated after "
                            + MAX_LOG_LENGTH
                            + " characters."
                            + System.lineSeparator();
        }

        return value;
    }

    private void waitForOutputReader(
            Thread outputReaderThread,
            StringBuilder liveOutput,
            AtomicBoolean outputTruncated
    ) {

        try {

            outputReaderThread.join(
                    OUTPUT_READER_JOIN_TIMEOUT_MILLIS
            );

            if (
                    outputReaderThread.isAlive()
            ) {

                appendLiveOutput(
                        liveOutput,
                        System.lineSeparator()
                                + "[TestForge] Output reader did not finish within "
                                + OUTPUT_READER_JOIN_TIMEOUT_MILLIS
                                + " ms. Returning captured output so far."
                                + System.lineSeparator(),
                        outputTruncated
                );
            }

        } catch (
                InterruptedException exception
        ) {

            Thread.currentThread()
                    .interrupt();

            appendLiveOutput(
                    liveOutput,
                    System.lineSeparator()
                            + "[TestForge] Interrupted while waiting for process output reader."
                            + System.lineSeparator(),
                    outputTruncated
            );
        }
    }

    private void terminateProcessTree(
            Process process
    ) {

        ProcessHandle root =
                process.toHandle();

        /*
         * mvnw.cmd on Windows launches additional Java
         * processes. Killing only cmd.exe can leave Maven
         * running and holding stdout open.
         *
         * Capture descendants first because the descendants()
         * stream may change once termination starts.
         */
        List<ProcessHandle> descendants =
                root
                        .descendants()
                        .toList();

        /*
         * Graceful termination: children first, then root.
         */
        for (
                ProcessHandle descendant
                : descendants
        ) {

            if (
                    descendant.isAlive()
            ) {

                descendant.destroy();
            }
        }

        if (
                root.isAlive()
        ) {

            root.destroy();
        }

        waitForProcessTreeToStop(
                root,
                descendants,
                PROCESS_SHUTDOWN_TIMEOUT_SECONDS
        );

        /*
         * Force-kill anything still alive.
         */
        for (
                ProcessHandle descendant
                : descendants
        ) {

            if (
                    descendant.isAlive()
            ) {

                descendant.destroyForcibly();
            }
        }

        if (
                root.isAlive()
        ) {

            root.destroyForcibly();
        }

        waitForProcessTreeToStop(
                root,
                descendants,
                PROCESS_SHUTDOWN_TIMEOUT_SECONDS
        );
    }

    private void waitForProcessTreeToStop(
            ProcessHandle root,
            List<ProcessHandle> descendants,
            long timeoutSeconds
    ) {

        long deadline =
                System.nanoTime()
                        + TimeUnit.SECONDS.toNanos(
                        timeoutSeconds
                );

        while (
                System.nanoTime()
                        < deadline
        ) {

            boolean anyAlive =
                    root.isAlive();

            if (
                    !anyAlive
            ) {

                for (
                        ProcessHandle descendant
                        : descendants
                ) {

                    if (
                            descendant.isAlive()
                    ) {

                        anyAlive =
                                true;

                        break;
                    }
                }
            }

            if (
                    !anyAlive
            ) {

                return;
            }

            try {

                Thread.sleep(
                        100
                );

            } catch (
                    InterruptedException exception
            ) {

                Thread.currentThread()
                        .interrupt();

                return;
            }
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
                safeMessage(
                        exception
                )
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
                            safeMessage(
                                    cause
                            )
                    );
        }

        return value.toString();
    }

    private String safeMessage(
            Throwable throwable
    ) {

        if (
                throwable == null
                        || throwable.getMessage() == null
                        || throwable.getMessage().isBlank()
        ) {

            return "(no message)";
        }

        return throwable.getMessage();
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