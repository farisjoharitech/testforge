-- TestSuite is the canonical Project-level collection model. Convert every
-- legacy TestSet before removing its Test Plan-scoped tables.
CREATE TEMPORARY TABLE migrated_test_set_suite (
    test_set_id BIGINT PRIMARY KEY,
    test_suite_id BIGINT NOT NULL
) ON COMMIT DROP;

DO $$
DECLARE
    legacy RECORD;
    migrated_suite_id BIGINT;
    migrated_name VARCHAR(255);
    suffix TEXT;
    collision INTEGER;
BEGIN
    FOR legacy IN
        SELECT legacy_set.*, plan.project_id
        FROM test_set legacy_set
        JOIN test_plan plan ON plan.id = legacy_set.test_plan_id
        ORDER BY legacy_set.id
    LOOP
        migrated_name := legacy.name;
        collision := 0;

        WHILE EXISTS (
            SELECT 1
            FROM test_suite suite
            WHERE suite.project_id = legacy.project_id
              AND lower(suite.name) = lower(migrated_name)
        ) LOOP
            collision := collision + 1;
            suffix := ' [' || legacy.test_set_id
                    || CASE WHEN collision > 1 THEN '-' || collision ELSE '' END
                    || ']';
            migrated_name := left(legacy.name, 255 - length(suffix)) || suffix;
        END LOOP;

        INSERT INTO test_suite (
            project_id,
            name,
            description,
            created_at,
            updated_at,
            execution_mode,
            lifecycle_enabled
        ) VALUES (
            legacy.project_id,
            migrated_name,
            legacy.description,
            legacy.created_at,
            legacy.updated_at,
            'SEQUENTIAL',
            TRUE
        ) RETURNING id INTO migrated_suite_id;

        INSERT INTO migrated_test_set_suite (test_set_id, test_suite_id)
        VALUES (legacy.id, migrated_suite_id);
    END LOOP;
END $$;

INSERT INTO test_suite_scenario (test_suite_id, scenario_id, item_order)
SELECT selected.test_suite_id,
       selected.scenario_id,
       (row_number() OVER (
           PARTITION BY selected.test_suite_id
           ORDER BY selected.first_item_order, selected.scenario_id
       ))::INTEGER
FROM (
    SELECT mapping.test_suite_id,
           test_case.scenario_id,
           min(item.item_order) AS first_item_order
    FROM migrated_test_set_suite mapping
    JOIN test_set_item item ON item.test_set_id = mapping.test_set_id
    JOIN test_case ON test_case.id = item.test_case_id
    GROUP BY mapping.test_suite_id, test_case.scenario_id
) selected;

DROP TABLE test_set_item;
DROP TABLE test_set;
DROP SEQUENCE IF EXISTS test_set_business_id_seq;
