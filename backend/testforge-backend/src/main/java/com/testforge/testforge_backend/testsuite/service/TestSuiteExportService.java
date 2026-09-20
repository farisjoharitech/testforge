package com.testforge.testforge_backend.testsuite.service;

import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.service.AutomationGenerationService;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.domain.TestScenario;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.testsuite.dto.SuiteJUnitConfiguration;
import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode;
import com.testforge.testforge_backend.testsuite.entity.TestSuite;
import com.testforge.testforge_backend.testsuite.entity.TestSuiteScenario;
import com.testforge.testforge_backend.testsuite.repository.TestSuiteRepository;
import com.testforge.testforge_backend.testsuite.exception.InvalidTestSuiteException;
import com.testforge.testforge_backend.testsuite.exception.TestSuiteNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@Transactional(readOnly = true)
public class TestSuiteExportService {
    private final TestSuiteRepository suites;
    private final TestCaseRepository cases;
    private final AutomationScriptRepository scripts;
    private final AutomationGenerationService generation;
    private final TestSuiteService suiteService;
    private final JUnitSuiteSourceTransformer transformer;

    public TestSuiteExportService(TestSuiteRepository suites, TestCaseRepository cases,
                                  AutomationScriptRepository scripts, AutomationGenerationService generation,
                                  TestSuiteService suiteService, JUnitSuiteSourceTransformer transformer) {
        this.suites = suites;
        this.cases = cases;
        this.scripts = scripts;
        this.generation = generation;
        this.suiteService = suiteService;
        this.transformer = transformer;
    }

    public ExportedSuite export(String projectId, Long suiteId) {
        GeneratedSuiteProject project = generateFiles(projectId, suiteId);
        return new ExportedSuite(fileName(project.suiteName()) + ".zip", zip(project.files()));
    }

    /** Shared deterministic source for ZIP export and Project Git synchronization. */
    public GeneratedSuiteProject generateFiles(String projectId, Long suiteId) {
        TestSuite suite = suites.findById(suiteId)
                .orElseThrow(() -> new TestSuiteNotFoundException("Test Suite not found: " + suiteId));
        if (!suite.getProject().getProjectId().equals(projectId)) {
            throw new InvalidTestSuiteException("Test Suite belongs to another Project");
        }
        SuiteJUnitConfiguration config = suiteService.configuration(suiteId);
        List<GeneratedScriptResponse> generated = new ArrayList<>();
        List<String> scenarioIds = new ArrayList<>();
        for (TestSuiteScenario member : suite.getScenarios()) {
            TestScenario scenario = member.getScenario();
            if (!scenario.isAutomatable()) {
                throw new InvalidTestSuiteException("Scenario \"" + scenario.getDescription() + "\" (" + scenario.getScenarioId() + ") is not automatable.");
            }
            scenarioIds.add(scenario.getScenarioId());
            for (TestCase testCase : cases.findByTestScenarioOrderByIdAsc(scenario)) {
                AutomationScript script = scripts.findByTestCaseId(testCase.getId())
                        .orElseThrow(() -> new AutomationNotFoundException("Test Case \"" + testCase.getName() + "\" (" + testCase.getTestCaseId() + ") has no automation script configured."));
                GeneratedScriptResponse source = generation.getGenerated(script.getId());
                if (source.stale()) {
                    throw new AutomationConflictException("Generated automation for Test Case \"" + testCase.getName() + "\" (" + testCase.getTestCaseId() + ") is stale. Regenerate it before export.");
                }
                generated.add(transformer.apply(source, config));
            }
        }
        if (generated.isEmpty()) {
            throw new AutomationNotFoundException("Test Suite \"" + suite.getName() + "\" has no generated automation to export.");
        }
        Map<String, String> files = new LinkedHashMap<>();
        files.put("pom.xml", pom(suite));
        boolean parallel = config.executionMode() == SuiteExecutionMode.PARALLEL;
        files.put("src/test/resources/junit-platform.properties",
                "junit.jupiter.execution.parallel.enabled=" + parallel + "\n" +
                        "junit.jupiter.execution.parallel.mode.default=" + (parallel ? "concurrent" : "same_thread") + "\n");
        files.put("testforge-suite.properties",
                "project.id=" + suite.getProject().getProjectId() + "\n" +
                        "suite.id=" + suite.getId() + "\n" +
                        "suite.name=" + suite.getName() + "\n" +
                        "scenario.ids=" + String.join(",", scenarioIds) + "\n");
        for (GeneratedScriptResponse source : generated) {
            files.put("src/test/java/generated/testforge/" + safeClass(source.className()) + ".java", source.source());
        }
        return new GeneratedSuiteProject(suite.getId(), suite.getName(), Map.copyOf(files));
    }

    private byte[] zip(Map<String, String> files) {
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(bytes, StandardCharsets.UTF_8)) {
            for (Map.Entry<String, String> file : files.entrySet()) {
                ZipEntry entry = new ZipEntry(file.getKey());
                zip.putNextEntry(entry);
                zip.write(file.getValue().getBytes(StandardCharsets.UTF_8));
                zip.closeEntry();
            }
            zip.finish();
            return bytes.toByteArray();
        } catch (IOException exception) {
            throw new AutomationConflictException("Unable to create Test Suite export.");
        }
    }

    private String safeClass(String value) {
        if (value == null || !value.matches("[A-Za-z_$][A-Za-z0-9_$]*")) {
            throw new AutomationConflictException("Generated automation contains an unsafe class name.");
        }
        return value;
    }

    public static String fileName(String value) {
        String safe = value == null ? "test-suite" : value.replaceAll("[^A-Za-z0-9._-]+", "-").replaceAll("^-+|-+$", "");
        return safe.isBlank() ? "test-suite" : safe;
    }

    private String pom(TestSuite suite) {
        String artifact = fileName(suite.getName()).toLowerCase(Locale.ROOT);
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion>
                <groupId>com.testforge.generated</groupId><artifactId>%s</artifactId><version>1.0.0</version>
                <properties><maven.compiler.release>17</maven.compiler.release><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding><testforge.browser>chromium</testforge.browser><testforge.headless>true</testforge.headless><testforge.baseUrl></testforge.baseUrl><groups></groups></properties>
                <dependencies><dependency><groupId>com.microsoft.playwright</groupId><artifactId>playwright</artifactId><version>1.52.0</version></dependency><dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.18.3</version></dependency><dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.12.2</version><scope>test</scope></dependency></dependencies>
                <build><plugins><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId><version>3.13.0</version><configuration><release>17</release></configuration></plugin><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId><version>3.5.2</version><configuration><useModulePath>false</useModulePath><groups>${groups}</groups><systemPropertyVariables><testforge.browser>${testforge.browser}</testforge.browser><testforge.headless>${testforge.headless}</testforge.headless><testforge.baseUrl>${testforge.baseUrl}</testforge.baseUrl></systemPropertyVariables></configuration></plugin></plugins></build></project>
                """.formatted(artifact);
    }

    public record GeneratedSuiteProject(Long suiteId, String suiteName, Map<String, String> files) { }
    public record ExportedSuite(String fileName, byte[] content) { }
}
