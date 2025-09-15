-- +migrate Up
CREATE TYPE "post_status" AS ENUM (
    'accepted',
    'rejected',
    'proposed'
);

CREATE TABLE answer (
    id         CHAR(36)       PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id    UUID           NOT NULL,
    user_id    UUID           NOT NULL, -- author
    content    VARCHAR(32768) NOT NULL,
    status     post_status    DEFAULT 'proposed',
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_answer_post_id ON answer (post_id);
CREATE INDEX idx_answer_user_id ON answer (user_id);

-- +migrate Down
DROP INDEX IF EXISTS idx_answer_post_id;
DROP INDEX IF EXISTS idx_answer_user_id;

DROP TABLE IF EXISTS answer CASCADE;

DROP TYPE IF EXISTS post_status;