-- V20 migrated eligibility to test_scenario; it is now authoritative.
-- Do not copy stale case flags back over subsequent Scenario edits.
ALTER TABLE test_case DROP COLUMN automatable;

-- Automation and collection membership must never disappear as a side effect
-- of deleting their source test design. Services report dependencies first;
-- these restrictive FKs also protect concurrent writes and other callers.
ALTER TABLE automation_step DROP CONSTRAINT fk_automation_step_test_step;
ALTER TABLE automation_step ADD CONSTRAINT fk_automation_step_test_step
    FOREIGN KEY (test_step_id) REFERENCES test_step(id);

ALTER TABLE test_set DROP CONSTRAINT fk_test_set_test_plan;
ALTER TABLE test_set ADD CONSTRAINT fk_test_set_test_plan
    FOREIGN KEY (test_plan_id) REFERENCES test_plan(id);

ALTER TABLE test_set_item DROP CONSTRAINT fk_test_set_item_test_case;
ALTER TABLE test_set_item ADD CONSTRAINT fk_test_set_item_test_case
    FOREIGN KEY (test_case_id) REFERENCES test_case(id);

-- Keep the owned Test Set -> membership cleanup and historical SET NULL FKs.
