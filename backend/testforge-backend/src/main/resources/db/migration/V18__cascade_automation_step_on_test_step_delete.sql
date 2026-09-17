ALTER TABLE automation_step
    DROP CONSTRAINT IF EXISTS fk_automation_step_test_step;

ALTER TABLE automation_step
    ADD CONSTRAINT fk_automation_step_test_step
        FOREIGN KEY (test_step_id)
        REFERENCES test_step(id)
        ON DELETE CASCADE;
