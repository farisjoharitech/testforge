CREATE TABLE automation_run
(
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    run_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    total_executions INTEGER NOT NULL DEFAULT 0,
    completed_executions INTEGER NOT NULL DEFAULT 0,
    passed_executions INTEGER NOT NULL DEFAULT 0,
    failed_executions INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    duration_ms BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT uq_automation_run_run_id UNIQUE (run_id)
);

CREATE INDEX idx_automation_run_status
    ON automation_run (status);

CREATE INDEX idx_automation_run_type
    ON automation_run (run_type);

CREATE INDEX idx_automation_run_started_at
    ON automation_run (started_at);

/*
 * Backfill one SINGLE_TEST_CASE run for every historical execution.
 * This preserves all existing execution/result history.
 */
INSERT INTO automation_run
(
    run_id,
    run_type,
    status,
    total_executions,
    completed_executions,
    passed_executions,
    failed_executions,
    started_at,
    finished_at,
    duration_ms,
    created_at,
    updated_at
)
SELECT
    'RUN-' || execution_id,
    'SINGLE_TEST_CASE',
    status,
    1,
    CASE WHEN status = 'RUNNING' THEN 0 ELSE 1 END,
    CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END,
    CASE WHEN status IN ('FAILED', 'TIMED_OUT', 'ERROR') THEN 1 ELSE 0 END,
    started_at,
    finished_at,
    duration_ms,
    created_at,
    updated_at
FROM automation_execution;

ALTER TABLE automation_execution
    ADD COLUMN automation_run_id BIGINT;

UPDATE automation_execution execution
SET automation_run_id = run.id
FROM automation_run run
WHERE run.run_id = 'RUN-' || execution.execution_id;

ALTER TABLE automation_execution
    ALTER COLUMN automation_run_id SET NOT NULL;

ALTER TABLE automation_execution
    ADD CONSTRAINT fk_automation_execution_run
        FOREIGN KEY (automation_run_id)
        REFERENCES automation_run (id);

CREATE INDEX idx_automation_execution_run
    ON automation_execution (automation_run_id);
