CREATE SEQUENCE IF NOT EXISTS project_business_id_seq
    START WITH 1
    INCREMENT BY 1;

CREATE TABLE project (
                         id BIGSERIAL PRIMARY KEY,
                         project_id VARCHAR(50) NOT NULL UNIQUE,
                         name VARCHAR(255) NOT NULL UNIQUE,
                         description VARCHAR(1000),
                         status VARCHAR(50) NOT NULL,
                         created_at TIMESTAMP NOT NULL,
                         updated_at TIMESTAMP NOT NULL
);

INSERT INTO project (
    project_id,
    name,
    description,
    status,
    created_at,
    updated_at
)
SELECT
    'PRJ-' || LPAD(
            nextval('project_business_id_seq')::text,
            6,
            '0'
              ),
    legacy_project_name,
    CASE
        WHEN legacy_project_name = 'Unassigned'
            THEN 'Migrated Test Plans that did not have a project name.'
        ELSE NULL
        END,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
         SELECT DISTINCT
             COALESCE(
                     NULLIF(BTRIM(project), ''),
                     'Unassigned'
             ) AS legacy_project_name
         FROM test_plan
     ) legacy_projects
ORDER BY legacy_project_name;

ALTER TABLE test_plan
    ADD COLUMN project_id BIGINT;

UPDATE test_plan test_plan_row
SET project_id = project_row.id
    FROM project project_row
WHERE project_row.name = COALESCE(
    NULLIF(
    BTRIM(test_plan_row.project),
    ''
    ),
    'Unassigned'
    );

ALTER TABLE test_plan
    ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE test_plan
    ADD CONSTRAINT fk_test_plan_project
        FOREIGN KEY (project_id)
            REFERENCES project(id);

CREATE INDEX idx_test_plan_project_id
    ON test_plan(project_id);

ALTER TABLE test_plan
DROP COLUMN project;
