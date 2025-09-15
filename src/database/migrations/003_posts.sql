-- +migrate Up
CREATE TYPE "post_status" AS ENUM (
    'active',
    'hidden'
    'deleted',
);

CREATE TABLE post (
    id         CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    user_id    INT          NOT NULL, -- author
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    status     post_status  DEFAULT 'active',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE post_categories (
    post_id     UUID NOT NULL,
    category_id UUID NOT NULL,

    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);

-- +migrate Down
DROP INDEX IF EXISTS idx_post_categories_post_id;
DROP INDEX IF EXISTS idx_post_categories_category_id;

DROP TABLE IF EXISTS post_categories CASCADE;
DROP TABLE IF EXISTS post CASCADE;

DROP TYPE IF EXISTS post_status;
