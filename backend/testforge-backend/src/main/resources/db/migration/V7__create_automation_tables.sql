CREATE TABLE automation_script (
    id BIGSERIAL PRIMARY KEY,

    automation_script_id VARCHAR(50) NOT NULL,

    test_case_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_automation_script_business_id
        UNIQUE (automation_script_id),

    CONSTRAINT uq_automation_script_test_case
        UNIQUE (test_case_id),

    CONSTRAINT fk_automation_script_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_case(id)
);


CREATE TABLE automation_step (
    id BIGSERIAL PRIMARY KEY,

    automation_step_id VARCHAR(50) NOT NULL,

    automation_script_id BIGINT NOT NULL,

    test_step_id BIGINT NOT NULL,

    step_order INTEGER NOT NULL,

    action_type VARCHAR(50) NOT NULL,

    target VARCHAR(500),

    selector_strategy VARCHAR(50),

    selector_value VARCHAR(2000),

    selector_role VARCHAR(50),

    selector_name VARCHAR(500),

    selector_exact BOOLEAN NOT NULL DEFAULT FALSE,

    input_value VARCHAR(4000),

    expected_value VARCHAR(4000),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_automation_step_business_id
        UNIQUE (automation_step_id),

    CONSTRAINT uq_automation_step_order
        UNIQUE (
            automation_script_id,
            step_order
        ),

    CONSTRAINT fk_automation_step_script
        FOREIGN KEY (automation_script_id)
        REFERENCES automation_script(id),

    CONSTRAINT fk_automation_step_test_step
        FOREIGN KEY (test_step_id)
        REFERENCES test_step(id),

    CONSTRAINT chk_automation_step_order_positive
        CHECK (step_order > 0)
);


CREATE INDEX idx_automation_step_script
    ON automation_step(automation_script_id);


CREATE INDEX idx_automation_step_test_step
    ON automation_step(test_step_id);