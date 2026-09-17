DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM automation_step
        GROUP BY automation_script_id, test_step_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Cannot add uq_automation_step_script_test_step: duplicate Automation Script + Test Step mappings already exist. Remove the unwanted duplicate mappings, then rerun Flyway.';
    END IF;
END
$$;

ALTER TABLE automation_step
    ADD CONSTRAINT uq_automation_step_script_test_step
        UNIQUE (
            automation_script_id,
            test_step_id
        );
