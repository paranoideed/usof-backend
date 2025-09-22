CREATE TABLE categories (
    id          CHAR(36)      PRIMARY KEY NOT NULL DEFAULT (UUID()),
    title       VARCHAR(64)   NOT NULL UNIQUE,
    description VARCHAR(1024) NOT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      DEFAULT NULL
);

CREATE INDEX idx_category_title ON categories (title);
