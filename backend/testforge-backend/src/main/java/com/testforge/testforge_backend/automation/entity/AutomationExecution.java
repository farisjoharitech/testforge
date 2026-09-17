package com.testforge.testforge_backend.automation.entity;

import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.domain.TestCase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "automation_execution",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_automation_execution_execution_id",
                        columnNames = "execution_id"
                )
        }
)
public class AutomationExecution {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "execution_id",
            nullable = false,
            length = 50
    )
    private String executionId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "automation_run_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_execution_run"
            )
    )
    private AutomationRun automationRun;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "automation_script_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_execution_script"
            )
    )
    private AutomationScript automationScript;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "test_case_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_execution_test_case"
            )
    )
    private TestCase testCase;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private AutomationExecutionStatus status;

    @Column(
            name = "generated_class_name",
            nullable = false,
            length = 255
    )
    private String generatedClassName;

    @Column(
            name = "generated_at"
    )
    private LocalDateTime generatedAt;

    @Column(
            name = "exit_code"
    )
    private Integer exitCode;

    @Column(
            name = "log_output",
            columnDefinition = "TEXT"
    )
    private String logOutput;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;


    @Column(
            name = "failed_step_order"
    )
    private Integer failedStepOrder;

    @Column(
            name = "failed_automation_step_id",
            length = 100
    )
    private String failedAutomationStepId;

    @Column(
            name = "failed_action_type",
            length = 50
    )
    private String failedActionType;

    @Column(
            name = "artifact_directory",
            length = 1000
    )
    private String artifactDirectory;

    @Column(
            name = "failure_screenshot_path",
            length = 1000
    )
    private String failureScreenshotPath;

    @Column(
            name = "trace_path",
            length = 1000
    )
    private String tracePath;

    @Column(
            name = "started_at",
            nullable = false
    )
    private LocalDateTime startedAt;

    @Column(
            name = "finished_at"
    )
    private LocalDateTime finishedAt;

    @Column(
            name = "duration_ms"
    )
    private Long durationMs;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    protected AutomationExecution() {
    }

    public AutomationExecution(
            String executionId,
            AutomationRun automationRun,
            AutomationScript automationScript,
            TestCase testCase,
            AutomationExecutionStatus status,
            String generatedClassName,
            LocalDateTime generatedAt,
            LocalDateTime startedAt
    ) {

        this.executionId =
                executionId;

        this.automationRun =
                automationRun;

        this.automationScript =
                automationScript;

        this.testCase =
                testCase;

        this.status =
                status;

        this.generatedClassName =
                generatedClassName;

        this.generatedAt =
                generatedAt;

        this.startedAt =
                startedAt;
    }

    /**
     * Backward-compatible constructor for existing unit-test fixtures and callers
     * that do not persist the execution. New production executions must use the
     * constructor that supplies an AutomationRun.
     */
    public AutomationExecution(
            String executionId,
            AutomationScript automationScript,
            TestCase testCase,
            AutomationExecutionStatus status,
            String generatedClassName,
            LocalDateTime generatedAt,
            LocalDateTime startedAt
    ) {
        this(
                executionId,
                null,
                automationScript,
                testCase,
                status,
                generatedClassName,
                generatedAt,
                startedAt
        );
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt =
                now;

        updatedAt =
                now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(
            String executionId
    ) {
        this.executionId =
                executionId;
    }


    public AutomationRun getAutomationRun() {
        return automationRun;
    }

    public void setAutomationRun(
            AutomationRun automationRun
    ) {
        this.automationRun = automationRun;
    }

    public AutomationScript getAutomationScript() {
        return automationScript;
    }

    public void setAutomationScript(
            AutomationScript automationScript
    ) {
        this.automationScript =
                automationScript;
    }

    public TestCase getTestCase() {
        return testCase;
    }

    public void setTestCase(
            TestCase testCase
    ) {
        this.testCase =
                testCase;
    }

    public AutomationExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(
            AutomationExecutionStatus status
    ) {
        this.status =
                status;
    }

    public String getGeneratedClassName() {
        return generatedClassName;
    }

    public void setGeneratedClassName(
            String generatedClassName
    ) {
        this.generatedClassName =
                generatedClassName;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(
            LocalDateTime generatedAt
    ) {
        this.generatedAt =
                generatedAt;
    }

    public Integer getExitCode() {
        return exitCode;
    }

    public void setExitCode(
            Integer exitCode
    ) {
        this.exitCode =
                exitCode;
    }

    public String getLogOutput() {
        return logOutput;
    }

    public void setLogOutput(
            String logOutput
    ) {
        this.logOutput =
                logOutput;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(
            String errorMessage
    ) {
        this.errorMessage =
                errorMessage;
    }


    public Integer getFailedStepOrder() {
        return failedStepOrder;
    }

    public void setFailedStepOrder(
            Integer failedStepOrder
    ) {
        this.failedStepOrder = failedStepOrder;
    }

    public String getFailedAutomationStepId() {
        return failedAutomationStepId;
    }

    public void setFailedAutomationStepId(
            String failedAutomationStepId
    ) {
        this.failedAutomationStepId = failedAutomationStepId;
    }

    public String getFailedActionType() {
        return failedActionType;
    }

    public void setFailedActionType(
            String failedActionType
    ) {
        this.failedActionType = failedActionType;
    }

    public String getArtifactDirectory() {
        return artifactDirectory;
    }

    public void setArtifactDirectory(
            String artifactDirectory
    ) {
        this.artifactDirectory = artifactDirectory;
    }

    public String getFailureScreenshotPath() {
        return failureScreenshotPath;
    }

    public void setFailureScreenshotPath(
            String failureScreenshotPath
    ) {
        this.failureScreenshotPath = failureScreenshotPath;
    }

    public String getTracePath() {
        return tracePath;
    }

    public void setTracePath(
            String tracePath
    ) {
        this.tracePath = tracePath;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(
            LocalDateTime startedAt
    ) {
        this.startedAt =
                startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(
            LocalDateTime finishedAt
    ) {
        this.finishedAt =
                finishedAt;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(
            Long durationMs
    ) {
        this.durationMs =
                durationMs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}