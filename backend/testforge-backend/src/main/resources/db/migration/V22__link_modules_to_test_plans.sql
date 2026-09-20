ALTER TABLE module ADD COLUMN test_plan_id BIGINT;

UPDATE module module_row
SET test_plan_id = source.test_plan_id
FROM (
    SELECT requirement_row.module_id, MIN(requirement_row.test_plan_id) AS test_plan_id
    FROM requirement requirement_row
    WHERE requirement_row.test_plan_id IS NOT NULL
    GROUP BY requirement_row.module_id
) source
WHERE source.module_id = module_row.id;

UPDATE module module_row
SET test_plan_id = source.test_plan_id
FROM (
    SELECT project_id, MIN(id) AS test_plan_id
    FROM test_plan
    GROUP BY project_id
) source
WHERE module_row.test_plan_id IS NULL
  AND source.project_id = module_row.project_id;

INSERT INTO module (
    module_id, project_id, test_plan_id, name, description, created_at, updated_at
)
SELECT
    'MOD-' || LPAD(nextval('module_business_id_seq')::text, 6, '0'),
    test_plan_row.project_id,
    test_plan_row.id,
    LEFT(module_row.name || ' - ' || test_plan_row.test_plan_id, 255),
    module_row.description,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM module module_row
JOIN requirement requirement_row ON requirement_row.module_id = module_row.id
JOIN test_plan test_plan_row ON test_plan_row.id = requirement_row.test_plan_id
WHERE module_row.test_plan_id <> test_plan_row.id
GROUP BY module_row.id, module_row.name, module_row.description,
         test_plan_row.id, test_plan_row.project_id, test_plan_row.test_plan_id;

UPDATE requirement requirement_row
SET module_id = replacement.id
FROM module original, module replacement, test_plan target_plan
WHERE requirement_row.module_id = original.id
  AND target_plan.id = requirement_row.test_plan_id
  AND replacement.project_id = original.project_id
  AND replacement.test_plan_id = requirement_row.test_plan_id
  AND replacement.name = LEFT(original.name || ' - ' || target_plan.test_plan_id, 255)
  AND original.test_plan_id <> requirement_row.test_plan_id;

ALTER TABLE module
    ADD CONSTRAINT fk_module_test_plan
        FOREIGN KEY (test_plan_id) REFERENCES test_plan(id);

CREATE INDEX idx_module_test_plan_id ON module(test_plan_id);
