-- +migrate Up
CREATE TABLE category (
    id          CHAR(36)    PRIMARY KEY NOT NULL DEFAULT (UUID()),
    title       VARCHAR(64) NOT NULL UNIQUE,
    description TEXT        NOT NULL,
    created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_title ON category (title);

-- +migrate Down
DROP INDEX IF EXISTS idx_category_title;
DROP TABLE IF EXISTS category CASCADE;