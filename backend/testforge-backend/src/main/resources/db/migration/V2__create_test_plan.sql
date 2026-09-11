CREATE TABLE test_plan (
    id BIGSERIAL PRIMARY KEY,

    test_plan_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    project VARCHAR(255),
    application VARCHAR(255),
    environment VARCHAR(100),
    prepared_by VARCHAR(255),

    status VARCHAR(50) NOT NULL,
    approval_status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);