CREATE TABLE test_step (
    id BIGSERIAL PRIMARY KEY,

    test_step_id VARCHAR(50) NOT NULL UNIQUE,

    test_case_id BIGINT NOT NULL,

    step_order INTEGER NOT NULL,

    action VARCHAR(1000) NOT NULL,

    target VARCHAR(500),

    input_value VARCHAR(2000),

    expected_result VARCHAR(2000),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_step_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_case(id),

    CONSTRAINT uq_test_step_order
        UNIQUE (test_case_id, step_order),

    CONSTRAINT chk_test_step_order_positive
        CHECK (step_order > 0)
);