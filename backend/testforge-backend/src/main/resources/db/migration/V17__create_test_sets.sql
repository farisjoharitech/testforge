CREATE SEQUENCE IF NOT EXISTS test_set_business_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE test_set (
    id BIGSERIAL PRIMARY KEY,
    test_set_id VARCHAR(50) NOT NULL UNIQUE,
    test_plan_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_test_set_test_plan
        FOREIGN KEY (test_plan_id)
        REFERENCES test_plan(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_test_set_test_plan_id
    ON test_set(test_plan_id);

CREATE TABLE test_set_item (
    id BIGSERIAL PRIMARY KEY,
    test_set_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,
    item_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_test_set_item_test_set
        FOREIGN KEY (test_set_id)
        REFERENCES test_set(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_test_set_item_test_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_case(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_test_set_item_case
        UNIQUE (test_set_id, test_case_id),
    CONSTRAINT uq_test_set_item_order
        UNIQUE (test_set_id, item_order),
    CONSTRAINT ck_test_set_item_order_positive
        CHECK (item_order > 0)
);

CREATE INDEX idx_test_set_item_test_set_id
    ON test_set_item(test_set_id);

CREATE INDEX idx_test_set_item_test_case_id
    ON test_set_item(test_case_id);
