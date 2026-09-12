CREATE TABLE requirement (
    id BIGSERIAL PRIMARY KEY,

    requirement_id VARCHAR(50) NOT NULL UNIQUE,

    test_plan_id BIGINT NOT NULL,

    description VARCHAR(1000) NOT NULL,

    priority VARCHAR(50) NOT NULL,

    status VARCHAR(50) NOT NULL,

    automatable BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_requirement_test_plan
        FOREIGN KEY (test_plan_id)
        REFERENCES test_plan(id)
);