package com.testforge.testforge_backend.automation.entity;

import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "automation_run",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_automation_run_run_id",
                        columnNames = "run_id"
                )
        }
)
public class AutomationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "run_id", nullable = false, length = 64)
    private String runId;

    @Enumerated(EnumType.STRING)
    @Column(name = "run_type", nullable = false, length = 30)
    private AutomationRunType runType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AutomationRunStatus status;

    @Column(name = "total_executions", nullable = false)
    private int totalExecutions;

    @Column(name = "completed_executions", nullable = false)
    private int completedExecutions;

    @Column(name = "passed_executions", nullable = false)
    private int passedExecutions;

    @Column(name = "failed_executions", nullable = false)
    private int failedExecutions;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected AutomationRun() {
    }

    public AutomationRun(
            String runId,
            AutomationRunType runType,
            AutomationRunStatus status,
            int totalExecutions,
            LocalDateTime startedAt
    ) {
        this.runId = runId;
        this.runType = runType;
        this.status = status;
        this.totalExecutions = totalExecutions;
        this.completedExecutions = 0;
        this.passedExecutions = 0;
        this.failedExecutions = 0;
        this.startedAt = startedAt;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getRunId() { return runId; }
    public AutomationRunType getRunType() { return runType; }
    public AutomationRunStatus getStatus() { return status; }
    public int getTotalExecutions() { return totalExecutions; }
    public int getCompletedExecutions() { return completedExecutions; }
    public int getPassedExecutions() { return passedExecutions; }
    public int getFailedExecutions() { return failedExecutions; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public Long getDurationMs() { return durationMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void finishSingleExecution(
            AutomationRunStatus finalStatus,
            LocalDateTime finishedAt,
            Long durationMs,
            boolean passed
    ) {
        this.status = finalStatus;
        this.completedExecutions = 1;
        this.passedExecutions = passed ? 1 : 0;
        this.failedExecutions = passed ? 0 : 1;
        this.finishedAt = finishedAt;
        this.durationMs = durationMs;
    }

    public void recordExecutionFinished(
            boolean passed,
            LocalDateTime executionFinishedAt
    ) {
        if (completedExecutions >= totalExecutions) {
            return;
        }

        completedExecutions++;

        if (passed) {
            passedExecutions++;
        } else {
            failedExecutions++;
        }

        if (completedExecutions < totalExecutions) {
            status = AutomationRunStatus.RUNNING;
            return;
        }

        finishedAt = executionFinishedAt != null
                ? executionFinishedAt
                : LocalDateTime.now();

        durationMs = Math.max(
                0L,
                Duration.between(startedAt, finishedAt).toMillis()
        );

        if (passedExecutions == totalExecutions) {
            status = AutomationRunStatus.PASSED;
        } else if (failedExecutions == totalExecutions) {
            status = AutomationRunStatus.FAILED;
        } else {
            status = AutomationRunStatus.PARTIAL;
        }
    }

    public void markInfrastructureError(LocalDateTime finishedAt) {
        this.status = AutomationRunStatus.ERROR;
        this.finishedAt = finishedAt != null ? finishedAt : LocalDateTime.now();
        this.durationMs = Math.max(
                0L,
                Duration.between(startedAt, this.finishedAt).toMillis()
        );
    }
}
