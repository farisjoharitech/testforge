CREATE SEQUENCE IF NOT EXISTS test_plan_business_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS requirement_business_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS test_scenario_business_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS test_case_business_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS test_step_business_id_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
               'test_plan_business_id_seq',
               COALESCE((
                   SELECT MAX(CAST(substring(test_plan_id FROM '^TP-([0-9]+)$') AS BIGINT))
                   FROM test_plan
                   WHERE test_plan_id ~ '^TP-[0-9]+$'
    ), 0) + 1,
               false
       );

SELECT setval(
               'requirement_business_id_seq',
               COALESCE((
                   SELECT MAX(CAST(substring(requirement_id FROM '^REQ-([0-9]+)$') AS BIGINT))
                   FROM requirement
                   WHERE requirement_id ~ '^REQ-[0-9]+$'
    ), 0) + 1,
               false
       );

SELECT setval(
               'test_scenario_business_id_seq',
               COALESCE((
                   SELECT MAX(CAST(substring(scenario_id FROM '^SCN-([0-9]+)$') AS BIGINT))
                   FROM test_scenario
                   WHERE scenario_id ~ '^SCN-[0-9]+$'
    ), 0) + 1,
               false
       );

SELECT setval(
               'test_case_business_id_seq',
               COALESCE((
                   SELECT MAX(CAST(substring(test_case_id FROM '^TC-([0-9]+)$') AS BIGINT))
                   FROM test_case
                   WHERE test_case_id ~ '^TC-[0-9]+$'
    ), 0) + 1,
               false
       );

SELECT setval(
               'test_step_business_id_seq',
               COALESCE((
                   SELECT MAX(CAST(substring(test_step_id FROM '^STEP-([0-9]+)$') AS BIGINT))
                   FROM test_step
                   WHERE test_step_id ~ '^STEP-[0-9]+$'
    ), 0) + 1,
               false
       );
