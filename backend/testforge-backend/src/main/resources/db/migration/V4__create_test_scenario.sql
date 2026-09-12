CREATE TABLE test_scenario (
    id BIGSERIAL PRIMARY KEY,

    scenario_id VARCHAR(50) NOT NULL UNIQUE,

    requirement_id BIGINT NOT NULL,

    description VARCHAR(1000) NOT NULL,

    test_type VARCHAR(50) NOT NULL,

    automatable BOOLEAN NOT NULL DEFAULT FALSE,

    priority VARCHAR(50) NOT NULL,

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_scenario_requirement
        FOREIGN KEY (requirement_id)
        REFERENCES requirement(id)
);