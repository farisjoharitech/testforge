ALTER TABLE automation_execution
    ADD COLUMN automation_script_business_id_snapshot VARCHAR(50),
    ADD COLUMN test_case_business_id_snapshot VARCHAR(50),
    ADD COLUMN test_case_name_snapshot VARCHAR(255);

UPDATE automation_execution e
SET automation_script_business_id_snapshot = s.automation_script_id,
    test_case_business_id_snapshot = tc.test_case_id,
    test_case_name_snapshot = tc.name
FROM automation_script s, test_case tc
WHERE e.automation_script_id = s.id
  AND e.test_case_id = tc.id;

ALTER TABLE automation_execution DROP CONSTRAINT fk_automation_execution_script;
ALTER TABLE automation_execution DROP CONSTRAINT fk_automation_execution_test_case;

ALTER TABLE automation_execution ALTER COLUMN automation_script_id DROP NOT NULL;
ALTER TABLE automation_execution ALTER COLUMN test_case_id DROP NOT NULL;

ALTER TABLE automation_execution
    ADD CONSTRAINT fk_automation_execution_script
        FOREIGN KEY (automation_script_id)
        REFERENCES automation_script(id)
        ON DELETE SET NULL;

ALTER TABLE automation_execution
    ADD CONSTRAINT fk_automation_execution_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_case(id)
        ON DELETE SET NULL;
