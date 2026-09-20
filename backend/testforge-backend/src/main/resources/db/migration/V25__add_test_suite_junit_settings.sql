ALTER TABLE test_suite
    ADD COLUMN execution_mode VARCHAR(20) NOT NULL DEFAULT 'SEQUENTIAL',
    ADD COLUMN lifecycle_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN junit_tags VARCHAR(1000),
    ADD COLUMN parameter_sets_json TEXT,
    ADD COLUMN junit_extensions VARCHAR(1000);
