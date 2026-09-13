package com.testforge.testforge_backend.automation.service;

import com.testforge.testforge_backend.automation.dto.AutomationResultResponse;
import com.testforge.testforge_backend.automation.dto.AutomationResultSummaryResponse;
import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.entity.AutomationScript;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.TestCase;
import com.testforge.testforge_backend.repository.AutomationExecutionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutomationResultServiceTest {

    private AutomationExecutionRepository
            automationExecutionRepository;

    private AutomationResultService
            automationResultService;

    @BeforeEach
    void setUp() {

        automationExecutionRepository =
                mock(
                        AutomationExecutionRepository.class
                );

        automationResultService =
                new AutomationResultService(
                        automationExecutionRepository
                );
    }

    /*
     * =========================================================
     * ALL RESULTS
     * =========================================================
     */

    @Test
    void shouldExcludeRunningExecutionsFromAllResults() {

        AutomationExecution passed =
                createExecution(
                        1L,
                        "EXEC-PASSED",
                        AutomationExecutionStatus.PASSED,
                        0,
                        null
                );

        AutomationExecution running =
                createExecution(
                        2L,
                        "EXEC-RUNNING",
                        AutomationExecutionStatus.RUNNING,
                        null,
                        null
                );

        AutomationExecution failed =
                createExecution(
                        3L,
                        "EXEC-FAILED",
                        AutomationExecutionStatus.FAILED,
                        1,
                        "Assertion failed"
                );

        when(
                automationExecutionRepository
                        .findAllByOrderByStartedAtDesc()
        ).thenReturn(
                List.of(
                        passed,
                        running,
                        failed
                )
        );

        List<AutomationResultSummaryResponse> results =
                automationResultService
                        .getAllResults(
                                null
                        );

        assertEquals(
                2,
                results.size()
        );

        assertEquals(
                "EXEC-PASSED",
                results.get(0)
                        .executionId()
        );

        assertEquals(
                "EXEC-FAILED",
                results.get(1)
                        .executionId()
        );
    }

    @Test
    void shouldFilterResultsByStatus() {

        AutomationExecution passed =
                createExecution(
                        1L,
                        "EXEC-PASSED",
                        AutomationExecutionStatus.PASSED,
                        0,
                        null
                );

        AutomationExecution failed =
                createExecution(
                        2L,
                        "EXEC-FAILED",
                        AutomationExecutionStatus.FAILED,
                        1,
                        "Assertion failed"
                );

        AutomationExecution error =
                createExecution(
                        3L,
                        "EXEC-ERROR",
                        AutomationExecutionStatus.ERROR,
                        null,
                        "Browser failed"
                );

        when(
                automationExecutionRepository
                        .findAllByOrderByStartedAtDesc()
        ).thenReturn(
                List.of(
                        passed,
                        failed,
                        error
                )
        );

        List<AutomationResultSummaryResponse> results =
                automationResultService
                        .getAllResults(
                                AutomationExecutionStatus.FAILED
                        );

        assertEquals(
                1,
                results.size()
        );

        assertEquals(
                "EXEC-FAILED",
                results.get(0)
                        .executionId()
        );

        assertEquals(
                AutomationExecutionStatus.FAILED,
                results.get(0)
                        .status()
        );

        assertFalse(
                results.get(0)
                        .successful()
        );
    }

    /*
     * =========================================================
     * RESULT DETAILS
     * =========================================================
     */

    @Test
    void shouldReturnCompletedResultDetails() {

        AutomationExecution execution =
                createExecution(
                        10L,
                        "EXEC-DETAIL-001",
                        AutomationExecutionStatus.PASSED,
                        0,
                        null
                );

        when(
                automationExecutionRepository
                        .findByExecutionId(
                                "EXEC-DETAIL-001"
                        )
        ).thenReturn(
                Optional.of(
                        execution
                )
        );

        AutomationResultResponse result =
                automationResultService
                        .getResult(
                                "EXEC-DETAIL-001"
                        );

        assertEquals(
                "EXEC-DETAIL-001",
                result.executionId()
        );

        assertEquals(
                AutomationExecutionStatus.PASSED,
                result.status()
        );

        assertEquals(
                "AUTOSCRIPT-001",
                result.automationScriptBusinessId()
        );

        assertEquals(
                "TC-001",
                result.testCaseBusinessId()
        );

        assertEquals(
                "Valid Login",
                result.testCaseName()
        );

        assertEquals(
                "generated.testforge.GeneratedAutomationTest",
                result.generatedClassName()
        );

        assertEquals(
                "BUILD SUCCESS",
                result.logOutput()
        );

        assertTrue(
                result.successful()
        );
    }

    @Test
    void shouldTrimExecutionIdBeforeRepositoryLookup() {

        AutomationExecution execution =
                createExecution(
                        11L,
                        "EXEC-TRIM-001",
                        AutomationExecutionStatus.PASSED,
                        0,
                        null
                );

        when(
                automationExecutionRepository
                        .findByExecutionId(
                                "EXEC-TRIM-001"
                        )
        ).thenReturn(
                Optional.of(
                        execution
                )
        );

        automationResultService
                .getResult(
                        "  EXEC-TRIM-001  "
                );

        verify(
                automationExecutionRepository
        ).findByExecutionId(
                "EXEC-TRIM-001"
        );
    }

    @Test
    void shouldRejectRunningExecutionResultDetails() {

        AutomationExecution execution =
                createExecution(
                        12L,
                        "EXEC-RUNNING-001",
                        AutomationExecutionStatus.RUNNING,
                        null,
                        null
                );

        when(
                automationExecutionRepository
                        .findByExecutionId(
                                "EXEC-RUNNING-001"
                        )
        ).thenReturn(
                Optional.of(
                        execution
                )
        );

        AutomationConflictException exception =
                assertThrows(
                        AutomationConflictException.class,
                        () ->
                                automationResultService
                                        .getResult(
                                                "EXEC-RUNNING-001"
                                        )
                );

        assertEquals(
                "Automation execution is still running and does not have a final result yet",
                exception.getMessage()
        );
    }

    @Test
    void shouldThrowNotFoundForUnknownExecution() {

        when(
                automationExecutionRepository
                        .findByExecutionId(
                                "EXEC-MISSING"
                        )
        ).thenReturn(
                Optional.empty()
        );

        AutomationNotFoundException exception =
                assertThrows(
                        AutomationNotFoundException.class,
                        () ->
                                automationResultService
                                        .getResult(
                                                "EXEC-MISSING"
                                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains(
                                "EXEC-MISSING"
                        )
        );
    }

    @Test
    void shouldRejectBlankExecutionId() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        automationResultService
                                .getResult(
                                        " "
                                )
        );
    }

    /*
     * =========================================================
     * SCRIPT SCOPED RESULTS
     * =========================================================
     */

    @Test
    void shouldReturnCompletedResultsByAutomationScript() {

        AutomationExecution passed =
                createExecution(
                        20L,
                        "EXEC-SCRIPT-PASSED",
                        AutomationExecutionStatus.PASSED,
                        0,
                        null
                );

        AutomationExecution running =
                createExecution(
                        21L,
                        "EXEC-SCRIPT-RUNNING",
                        AutomationExecutionStatus.RUNNING,
                        null,
                        null
                );

        when(
                automationExecutionRepository
                        .findByAutomationScript_IdOrderByStartedAtDesc(
                                100L
                        )
        ).thenReturn(
                List.of(
                        passed,
                        running
                )
        );

        List<AutomationResultSummaryResponse> results =
                automationResultService
                        .getResultsByAutomationScript(
                                100L
                        );

        assertEquals(
                1,
                results.size()
        );

        assertEquals(
                "EXEC-SCRIPT-PASSED",
                results.get(0)
                        .executionId()
        );

        verify(
                automationExecutionRepository
        ).findByAutomationScript_IdOrderByStartedAtDesc(
                100L
        );
    }

    @Test
    void shouldRejectNullAutomationScriptId() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        automationResultService
                                .getResultsByAutomationScript(
                                        null
                                )
        );
    }

    /*
     * =========================================================
     * TEST CASE SCOPED RESULTS
     * =========================================================
     */

    @Test
    void shouldReturnCompletedResultsByTestCase() {

        AutomationExecution failed =
                createExecution(
                        30L,
                        "EXEC-TC-FAILED",
                        AutomationExecutionStatus.FAILED,
                        1,
                        "Expected dashboard"
                );

        AutomationExecution running =
                createExecution(
                        31L,
                        "EXEC-TC-RUNNING",
                        AutomationExecutionStatus.RUNNING,
                        null,
                        null
                );

        when(
                automationExecutionRepository
                        .findByTestCase_IdOrderByStartedAtDesc(
                                200L
                        )
        ).thenReturn(
                List.of(
                        failed,
                        running
                )
        );

        List<AutomationResultSummaryResponse> results =
                automationResultService
                        .getResultsByTestCase(
                                200L
                        );

        assertEquals(
                1,
                results.size()
        );

        assertEquals(
                "EXEC-TC-FAILED",
                results.get(0)
                        .executionId()
        );

        assertFalse(
                results.get(0)
                        .successful()
        );

        verify(
                automationExecutionRepository
        ).findByTestCase_IdOrderByStartedAtDesc(
                200L
        );
    }

    @Test
    void shouldRejectNullTestCaseId() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        automationResultService
                                .getResultsByTestCase(
                                        null
                                )
        );
    }

    /*
     * =========================================================
     * TEST DATA
     * =========================================================
     */

    private AutomationExecution createExecution(
            Long id,
            String executionId,
            AutomationExecutionStatus status,
            Integer exitCode,
            String errorMessage
    ) {

        LocalDateTime generatedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        20,
                        0
                );

        LocalDateTime startedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        20,
                        5
                );

        LocalDateTime finishedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        13,
                        20,
                        5,
                        10
                );

        TestCase testCase =
                mock(
                        TestCase.class
                );

        when(
                testCase.getId()
        ).thenReturn(
                200L
        );

        when(
                testCase.getTestCaseId()
        ).thenReturn(
                "TC-001"
        );

        when(
                testCase.getName()
        ).thenReturn(
                "Valid Login"
        );

        AutomationScript script =
                mock(
                        AutomationScript.class
                );

        when(
                script.getId()
        ).thenReturn(
                100L
        );

        when(
                script.getAutomationScriptId()
        ).thenReturn(
                "AUTOSCRIPT-001"
        );

        AutomationExecution execution =
                mock(
                        AutomationExecution.class
                );

        when(
                execution.getId()
        ).thenReturn(
                id
        );

        when(
                execution.getExecutionId()
        ).thenReturn(
                executionId
        );

        when(
                execution.getAutomationScript()
        ).thenReturn(
                script
        );

        when(
                execution.getTestCase()
        ).thenReturn(
                testCase
        );

        when(
                execution.getStatus()
        ).thenReturn(
                status
        );

        when(
                execution.getGeneratedClassName()
        ).thenReturn(
                "generated.testforge.GeneratedAutomationTest"
        );

        when(
                execution.getGeneratedAt()
        ).thenReturn(
                generatedAt
        );

        when(
                execution.getExitCode()
        ).thenReturn(
                exitCode
        );

        when(
                execution.getLogOutput()
        ).thenReturn(
                "BUILD SUCCESS"
        );

        when(
                execution.getErrorMessage()
        ).thenReturn(
                errorMessage
        );

        when(
                execution.getStartedAt()
        ).thenReturn(
                startedAt
        );

        when(
                execution.getFinishedAt()
        ).thenReturn(
                status
                        == AutomationExecutionStatus.RUNNING
                        ? null
                        : finishedAt
        );

        when(
                execution.getDurationMs()
        ).thenReturn(
                status
                        == AutomationExecutionStatus.RUNNING
                        ? null
                        : 10_000L
        );

        return execution;
    }
}