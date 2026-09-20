package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationExecutionResponse;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionRunner;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.repository.TestCaseRepository;
import com.testforge.testforge_backend.testsuite.dto.SuiteJUnitConfiguration;
import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode;
import com.testforge.testforge_backend.testsuite.service.JUnitSuiteSourceTransformer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

@Service
public class AutomationMultiRunService {

    private final TestCaseRepository testCaseRepository;
    private final AutomationScriptRepository automationScriptRepository;
    private final AutomationExecutionRepository automationExecutionRepository;
    private final AutomationGenerationService automationGenerationService;
    private final AutomationExecutionPersistenceService persistenceService;
    private final AutomationExecutionRunner automationExecutionRunner;
    private final AutomationExecutionLogStreamService logStreamService;
    private final AutomationStructuredEventService structuredEventService;
    private final AutomationRunService automationRunService;
    private final AutomationRunEventStreamService runEventStreamService;
    private final JUnitSuiteSourceTransformer junitTransformer;

    public AutomationMultiRunService(
            TestCaseRepository testCaseRepository,
            AutomationScriptRepository automationScriptRepository,
            AutomationExecutionRepository automationExecutionRepository,
            AutomationGenerationService automationGenerationService,
            AutomationExecutionPersistenceService persistenceService,
            AutomationExecutionRunner automationExecutionRunner,
            AutomationExecutionLogStreamService logStreamService,
            AutomationStructuredEventService structuredEventService,
            AutomationRunService automationRunService,
            AutomationRunEventStreamService runEventStreamService,
            JUnitSuiteSourceTransformer junitTransformer
    ) {
        this.testCaseRepository = testCaseRepository;
        this.automationScriptRepository = automationScriptRepository;
        this.automationExecutionRepository = automationExecutionRepository;
        this.automationGenerationService = automationGenerationService;
        this.persistenceService = persistenceService;
        this.automationExecutionRunner = automationExecutionRunner;
        this.logStreamService = logStreamService;
        this.structuredEventService = structuredEventService;
        this.automationRunService = automationRunService;
        this.runEventStreamService = runEventStreamService;
        this.junitTransformer = junitTransformer;
    }

    public AutomationRunResponse executeTestCases(List<Long> testCaseIds) {
        return executeTestCases(
                testCaseIds,
                AutomationRunType.MULTI_TEST_CASE,
                2,
                "Select at least two Test Cases for a multi-test run"
        );
    }

    public AutomationRunResponse executeScenarioTestCases(List<Long> testCaseIds) {
        return executeTestCases(
                testCaseIds,
                AutomationRunType.SCENARIO,
                1,
                "Scenario has no automatable Test Cases"
        );
    }

    public AutomationRunResponse executeTestPlanTestCases(List<Long> testCaseIds) {
        return executeTestCases(
                testCaseIds,
                AutomationRunType.TEST_PLAN,
                1,
                "Test Plan has no automatable Test Cases"
        );
    }

    public AutomationRunResponse executeTestSuiteTestCases(
            List<Long> testCaseIds,
            SuiteJUnitConfiguration configuration,
            Consumer<AutomationRunResponse> completion
    ) {
        List<ExecutionJob> jobs = validateAndBuildJobs(testCaseIds, 1, "Test Suite has no Test Cases").stream()
                .map(job -> new ExecutionJob(job.scriptId(), junitTransformer.apply(job.generatedScript(), configuration)))
                .toList();
        AutomationRunResponse run = persistenceService.startRun(AutomationRunType.TEST_SUITE, jobs.size());
        CompletableFuture.runAsync(() -> execute(run.id(), jobs, configuration.executionMode(), completion));
        return run;
    }

    private AutomationRunResponse executeTestCases(
            List<Long> testCaseIds,
            AutomationRunType runType,
            int minimumCount,
            String minimumCountMessage
    ) {
        return executeTestCases(testCaseIds, runType, minimumCount, minimumCountMessage, ignored -> { });
    }

    private AutomationRunResponse executeTestCases(
            List<Long> testCaseIds,
            AutomationRunType runType,
            int minimumCount,
            String minimumCountMessage,
            Consumer<AutomationRunResponse> completion
    ) {
        List<ExecutionJob> jobs = validateAndBuildJobs(
                testCaseIds,
                minimumCount,
                minimumCountMessage
        );

        AutomationRunResponse run = persistenceService.startRun(
                runType,
                jobs.size()
        );

        CompletableFuture.runAsync(
                () -> executeSequentially(run.id(), jobs, completion)
        );

        return run;
    }

    private List<ExecutionJob> validateAndBuildJobs(
            List<Long> testCaseIds,
            int minimumCount,
            String minimumCountMessage
    ) {
        if (testCaseIds == null || testCaseIds.size() < minimumCount) {
            throw new IllegalArgumentException(minimumCountMessage);
        }

        Set<Long> uniqueIds = new LinkedHashSet<>(testCaseIds);

        if (uniqueIds.size() != testCaseIds.size()) {
            throw new AutomationConflictException(
                    "The same Test Case cannot be selected more than once"
            );
        }

        List<ExecutionJob> jobs = new ArrayList<>();

        for (Long testCaseId : uniqueIds) {
            if (testCaseId == null) {
                throw new IllegalArgumentException("Test Case ID must not be null");
            }

            if (!testCaseRepository.existsById(testCaseId)) {
                throw new AutomationNotFoundException(
                        "Test Case not found: " + testCaseId
                );
            }

            AutomationScript script = automationScriptRepository
                    .findByTestCaseId(testCaseId)
                    .orElseThrow(() -> new AutomationNotFoundException(
                            missingAutomationMessage(testCaseId)
                    ));

            if (automationExecutionRepository.existsByAutomationScript_IdAndStatus(
                    script.getId(),
                    AutomationExecutionStatus.RUNNING
            )) {
                throw new AutomationConflictException(
                        "Automation Script already has a RUNNING execution: "
                                + script.getAutomationScriptId()
                );
            }

            GeneratedScriptResponse generated =
                    automationGenerationService.getGenerated(script.getId());

            if (generated.stale()) {
                throw new AutomationConflictException(
                        "Generated script is stale for Test Case: " + testCaseId
                                + ". Regenerate it before starting the run."
                );
            }

            jobs.add(new ExecutionJob(script.getId(), generated));
        }

        return List.copyOf(jobs);
    }

    private String missingAutomationMessage(Long testCaseId) {
        return testCaseRepository.findById(testCaseId)
                .map(testCase -> "Test Case \"" + testCase.getName() + "\" (" + testCase.getTestCaseId()
                        + ") has no automation script configured.")
                .orElse("Test Case " + testCaseId + " has no automation script configured.");
    }

    private void executeSequentially(Long runId, List<ExecutionJob> jobs, Consumer<AutomationRunResponse> completion) {
        execute(runId, jobs, SuiteExecutionMode.SEQUENTIAL, completion);
    }

    private void execute(Long runId,List<ExecutionJob> jobs,SuiteExecutionMode mode,Consumer<AutomationRunResponse> completion) {
        try {
            if(mode==SuiteExecutionMode.PARALLEL){CompletableFuture.allOf(jobs.stream().map(job->CompletableFuture.runAsync(()->executeJob(runId,job))).toArray(CompletableFuture[]::new)).join();}else for(ExecutionJob job:jobs)executeJob(runId,job);
            publishCompletedRunIfFinished(runId);
        } catch (RuntimeException exception) {
            persistenceService.markRunInfrastructureError(runId);
            publishCompletedRunIfFinished(runId);
        } finally {
            completion.accept(automationRunService.getById(runId));
        }
    }

    private void executeJob(Long runId,ExecutionJob job) {
                AutomationExecutionResponse runningExecution =
                        persistenceService.startExecutionInRun(
                                runId,
                                job.scriptId(),
                                job.generatedScript()
                        );

                structuredEventService.testCaseStarted(runningExecution);

                AutomationExecutionRunner.RunnerResult result =
                        automationExecutionRunner.execute(
                                runningExecution.executionId(),
                                job.generatedScript().className(),
                                job.generatedScript().source(),
                                chunk -> {
                                    persistenceService.appendLiveLog(
                                            runningExecution.id(),
                                            chunk
                                    );

                                    logStreamService.publishLog(
                                            runningExecution.id(),
                                            chunk
                                    );

                                    structuredEventService.acceptOutput(
                                            runningExecution,
                                            chunk
                                    );
                                }
                        );

                AutomationExecutionResponse finishedExecution =
                        persistenceService.finishExecution(
                                runningExecution.id(),
                                result
                        );

                structuredEventService.executionFinished(finishedExecution);

                logStreamService.publishCompleted(
                        runningExecution.id(),
                        finishedExecution.status().name()
                );
    }

    private void publishCompletedRunIfFinished(Long runId) {
        AutomationRunResponse run = automationRunService.getById(runId);

        if (run.status() != AutomationRunStatus.RUNNING) {
            runEventStreamService.publishRunCompleted(run);
        }
    }

    private record ExecutionJob(
            Long scriptId,
            GeneratedScriptResponse generatedScript
    ) {
    }
}
