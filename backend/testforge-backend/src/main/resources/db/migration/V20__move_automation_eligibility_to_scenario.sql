ALTER TABLE test_scenario
    ADD COLUMN automatable BOOLEAN;

UPDATE test_scenario scenario
SET automatable = EXISTS (
    SELECT 1
    FROM test_case test_case_row
    WHERE test_case_row.scenario_id = scenario.id
      AND test_case_row.automatable = TRUE
);

ALTER TABLE test_scenario
    ALTER COLUMN automatable SET NOT NULL;

ALTER TABLE test_scenario
    ALTER COLUMN automatable SET DEFAULT FALSE;
