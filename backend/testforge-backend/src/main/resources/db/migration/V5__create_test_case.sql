CREATE TABLE test_case (
    id BIGSERIAL PRIMARY KEY,

    test_case_id VARCHAR(50) NOT NULL UNIQUE,

    scenario_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    preconditions VARCHAR(2000),

    test_data VARCHAR(2000),

    expected_result VARCHAR(2000) NOT NULL,

    priority VARCHAR(50) NOT NULL,

    test_type VARCHAR(50) NOT NULL,

    automatable BOOLEAN NOT NULL DEFAULT FALSE,

    automation_type VARCHAR(50) NOT NULL,

    automation_status VARCHAR(50) NOT NULL,

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_case_scenario
        FOREIGN KEY (scenario_id)
        REFERENCES test_scenario(id)
);