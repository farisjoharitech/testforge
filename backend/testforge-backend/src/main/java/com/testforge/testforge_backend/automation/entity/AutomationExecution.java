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
            AutomationScript automationScript,
            TestCase testCase,
            AutomationExecutionStatus status,
            String generatedClassName,
            LocalDateTime generatedAt,
            LocalDateTime startedAt
    ) {

        this.executionId =
                executionId;

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