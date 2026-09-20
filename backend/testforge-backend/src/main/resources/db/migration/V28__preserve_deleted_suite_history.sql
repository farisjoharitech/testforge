ALTER TABLE test_suite_run
    ADD COLUMN test_suite_id_snapshot BIGINT,
    ADD COLUMN test_suite_name_snapshot VARCHAR(255),
    ADD COLUMN project_business_id_snapshot VARCHAR(50),
    ADD COLUMN project_name_snapshot VARCHAR(255),
    ADD COLUMN execution_mode_snapshot VARCHAR(20),
    ADD COLUMN lifecycle_enabled_snapshot BOOLEAN,
    ADD COLUMN junit_tags_snapshot VARCHAR(1000),
    ADD COLUMN parameter_sets_json_snapshot TEXT,
    ADD COLUMN junit_extensions_snapshot VARCHAR(1000);

-- Older runs did not capture this metadata. Preserve the currently available
-- values before allowing the live Suite to disappear. Existing results remain
-- untouched; configuration changes made before this migration cannot be recovered.
UPDATE test_suite_run run
SET test_suite_id_snapshot = suite.id,
    test_suite_name_snapshot = suite.name,
    project_business_id_snapshot = project.project_id,
    project_name_snapshot = project.name,
    execution_mode_snapshot = suite.execution_mode,
    lifecycle_enabled_snapshot = suite.lifecycle_enabled,
    junit_tags_snapshot = suite.junit_tags,
    parameter_sets_json_snapshot = suite.parameter_sets_json,
    junit_extensions_snapshot = suite.junit_extensions
FROM test_suite suite, project
WHERE run.test_suite_id = suite.id AND run.project_id = project.id;

ALTER TABLE test_suite_run
    ALTER COLUMN test_suite_id_snapshot SET NOT NULL,
    ALTER COLUMN test_suite_name_snapshot SET NOT NULL,
    ALTER COLUMN project_business_id_snapshot SET NOT NULL,
    ALTER COLUMN project_name_snapshot SET NOT NULL,
    ALTER COLUMN execution_mode_snapshot SET NOT NULL,
    ALTER COLUMN lifecycle_enabled_snapshot SET NOT NULL,
    ALTER COLUMN test_suite_id DROP NOT NULL;

ALTER TABLE test_suite_run DROP CONSTRAINT test_suite_run_test_suite_id_fkey;
ALTER TABLE test_suite_run ADD CONSTRAINT test_suite_run_test_suite_id_fkey
    FOREIGN KEY (test_suite_id) REFERENCES test_suite(id) ON DELETE SET NULL;

-- Project ownership remains mandatory so historical reporting stays reachable.
CREATE INDEX idx_suite_run_project_suite_snapshot_started
    ON test_suite_run(project_id, test_suite_id_snapshot, started_at DESC);
