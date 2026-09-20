CREATE TABLE test_suite_run (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
    test_suite_id BIGINT NOT NULL REFERENCES test_suite(id) ON DELETE RESTRICT,
    automation_run_id BIGINT REFERENCES automation_run(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    total INTEGER NOT NULL DEFAULT 0,
    passed INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    skipped INTEGER NOT NULL DEFAULT 0,
    error_details TEXT
);

CREATE TABLE suite_scenario_result (
    id BIGSERIAL PRIMARY KEY,
    suite_run_id BIGINT NOT NULL REFERENCES test_suite_run(id) ON DELETE RESTRICT,
    source_scenario_id BIGINT,
    scenario_business_id_snapshot VARCHAR(50) NOT NULL,
    description_snapshot VARCHAR(2000),
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms BIGINT
);

CREATE TABLE suite_test_case_result (
    id BIGSERIAL PRIMARY KEY,
    scenario_result_id BIGINT NOT NULL REFERENCES suite_scenario_result(id) ON DELETE RESTRICT,
    source_test_case_id BIGINT,
    test_case_business_id_snapshot VARCHAR(50) NOT NULL,
    name_snapshot VARCHAR(255) NOT NULL,
    automation_execution_id BIGINT REFERENCES automation_execution(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    failure_details TEXT,
    assertion_failure_details TEXT,
    screenshot_path VARCHAR(1000),
    artifact_directory VARCHAR(1000),
    trace_path VARCHAR(1000)
);

CREATE TABLE suite_test_step_result (
    id BIGSERIAL PRIMARY KEY,
    test_case_result_id BIGINT NOT NULL REFERENCES suite_test_case_result(id) ON DELETE RESTRICT,
    source_test_step_id BIGINT,
    test_step_business_id_snapshot VARCHAR(50) NOT NULL,
    action_snapshot VARCHAR(1000) NOT NULL,
    expected_result_snapshot VARCHAR(2000),
    step_order INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    failure_details TEXT,
    screenshot_path VARCHAR(1000),
    artifact_reference VARCHAR(1000)
);

CREATE INDEX idx_test_suite_run_suite_started ON test_suite_run(test_suite_id, started_at DESC);
CREATE INDEX idx_suite_scenario_result_run ON suite_scenario_result(suite_run_id);
CREATE INDEX idx_suite_test_case_result_scenario ON suite_test_case_result(scenario_result_id);
CREATE INDEX idx_suite_test_step_result_case ON suite_test_step_result(test_case_result_id);
