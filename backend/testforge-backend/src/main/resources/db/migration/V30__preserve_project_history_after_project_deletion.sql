-- Suite Runs already contain immutable Project identity snapshots. The live
-- Project link is optional history metadata and must not prevent deletion.
ALTER TABLE test_suite_run ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE test_suite_run DROP CONSTRAINT test_suite_run_project_id_fkey;
ALTER TABLE test_suite_run ADD CONSTRAINT test_suite_run_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL;

CREATE INDEX idx_suite_run_project_snapshot_started
    ON test_suite_run(project_business_id_snapshot, started_at DESC);
