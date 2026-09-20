CREATE TABLE git_integration_configuration (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE REFERENCES project(id),
    repository_url VARCHAR(1000) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    automation_project_path VARCHAR(500) NOT NULL,
    commit_message_template VARCHAR(500) NOT NULL,
    last_successful_content_hash VARCHAR(64),
    last_sync_status VARCHAR(30) NOT NULL,
    last_sync_at TIMESTAMP,
    last_commit_sha VARCHAR(64),
    last_error_summary VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE git_sync_history (
    id BIGSERIAL PRIMARY KEY,
    configuration_id BIGINT NOT NULL REFERENCES git_integration_configuration(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    commit_sha VARCHAR(64),
    summary VARCHAR(1000),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_git_sync_history_configuration_created
    ON git_sync_history(configuration_id, created_at DESC);
