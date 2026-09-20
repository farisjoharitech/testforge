DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM requirement requirement_row
        JOIN module module_row ON module_row.id = requirement_row.module_id
        WHERE requirement_row.test_plan_id IS NOT NULL
          AND requirement_row.test_plan_id <> module_row.test_plan_id
    ) THEN
        RAISE EXCEPTION 'Cannot remove requirement.test_plan_id: Requirement and Module Test Plan ownership is inconsistent';
    END IF;
END $$;

ALTER TABLE requirement
    DROP CONSTRAINT fk_requirement_test_plan;

ALTER TABLE requirement
    DROP COLUMN test_plan_id;
