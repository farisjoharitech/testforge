CREATE TABLE app_metadata (
    id BIGSERIAL PRIMARY KEY,
    metadata_key VARCHAR(100) NOT NULL UNIQUE,
    metadata_value VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_metadata (
    metadata_key,
    metadata_value
)
VALUES (
    'schema_version',
    '1'
);