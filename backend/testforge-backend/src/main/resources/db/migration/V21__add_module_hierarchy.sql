CREATE SEQUENCE IF NOT EXISTS module_business_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE module (
    id BIGSERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL UNIQUE,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_module_project FOREIGN KEY (project_id) REFERENCES project(id),
    CONSTRAINT uk_module_project_name UNIQUE (project_id, name)
);

CREATE INDEX idx_module_project_id ON module(project_id);

INSERT INTO module (module_id, project_id, name, description, created_at, updated_at)
SELECT
    'MOD-' || LPAD(nextval('module_business_id_seq')::text, 6, '0'),
    project_row.id,
    'Migrated Requirements',
    'Automatically created to preserve existing Requirements.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM project project_row
WHERE EXISTS (
    SELECT 1
    FROM requirement requirement_row
    JOIN test_plan test_plan_row ON test_plan_row.id = requirement_row.test_plan_id
    WHERE test_plan_row.project_id = project_row.id
)
ORDER BY project_row.id;

ALTER TABLE requirement ADD COLUMN module_id BIGINT;

UPDATE requirement requirement_row
SET module_id = module_row.id
FROM test_plan test_plan_row
JOIN module module_row
    ON module_row.project_id = test_plan_row.project_id
   AND module_row.name = 'Migrated Requirements'
WHERE requirement_row.test_plan_id = test_plan_row.id;

ALTER TABLE requirement ALTER COLUMN module_id SET NOT NULL;
ALTER TABLE requirement ALTER COLUMN test_plan_id DROP NOT NULL;

ALTER TABLE requirement
    ADD CONSTRAINT fk_requirement_module
        FOREIGN KEY (module_id) REFERENCES module(id);

CREATE INDEX idx_requirement_module_id ON requirement(module_id);
