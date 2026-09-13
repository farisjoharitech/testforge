ALTER TABLE automation_script
    ADD COLUMN generated_class_name VARCHAR(255);

ALTER TABLE automation_script
    ADD COLUMN generated_source TEXT;

ALTER TABLE automation_script
    ADD COLUMN generated_step_count INTEGER;

ALTER TABLE automation_script
    ADD COLUMN generated_at TIMESTAMP;