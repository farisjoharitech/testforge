CREATE TABLE automation_execution
(
    id BIGSERIAL PRIMARY KEY,

    execution_id VARCHAR(50) NOT NULL,

    automation_script_id BIGINT NOT NULL,

    test_case_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL,

    generated_class_name VARCHAR(255) NOT NULL,

    generated_at TIMESTAMP,

    exit_code INTEGER,

    log_output TEXT,

    error_message TEXT,

    started_at TIMESTAMP NOT NULL,

    finished_at TIMESTAMP,

    duration_ms BIGINT,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT uq_automation_execution_execution_id
        UNIQUE (execution_id),

    CONSTRAINT fk_automation_execution_script
        FOREIGN KEY (automation_script_id)
        REFERENCES automation_script (id),

    CONSTRAINT fk_automation_execution_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_case (id)
);

CREATE INDEX idx_automation_execution_script
    ON automation_execution (automation_script_id);

CREATE INDEX idx_automation_execution_test_case
    ON automation_execution (test_case_id);

CREATE INDEX idx_automation_execution_status
    ON automation_execution (status);

CREATE INDEX idx_automation_execution_started_at
    ON automation_execution (started_at);