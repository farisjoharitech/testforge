CREATE TABLE test_suite (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_test_suite_project_name UNIQUE (project_id, name)
);
CREATE TABLE test_suite_scenario (
    id BIGSERIAL PRIMARY KEY,
    test_suite_id BIGINT NOT NULL REFERENCES test_suite(id),
    scenario_id BIGINT NOT NULL REFERENCES test_scenario(id),
    item_order INTEGER NOT NULL,
    CONSTRAINT uk_test_suite_scenario UNIQUE (test_suite_id, scenario_id)
);
CREATE INDEX idx_test_suite_project ON test_suite(project_id);
CREATE INDEX idx_test_suite_scenario_suite ON test_suite_scenario(test_suite_id);
