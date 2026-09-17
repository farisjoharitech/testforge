ALTER TABLE automation_execution
    ADD COLUMN failed_step_order INTEGER,
    ADD COLUMN failed_automation_step_id VARCHAR(100),
    ADD COLUMN failed_action_type VARCHAR(50),
    ADD COLUMN artifact_directory VARCHAR(1000),
    ADD COLUMN failure_screenshot_path VARCHAR(1000),
    ADD COLUMN trace_path VARCHAR(1000);
