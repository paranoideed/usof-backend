-- +migrate Up
CREATE TABLE comment (
    id        UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    post_id   UUID NOT NULL,
    user_id   UUID NOT NULL,
    parent_id UUID DEFAULT NULL, -- nested comment

    content    VARCHAR(4096) NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_post_id ON comment (post_id);
CREATE INDEX idx_comment_user_id ON comment (user_id);

-- +migrate Down
DROP INDEX IF EXISTS idx_comment_post_id;
DROP INDEX IF EXISTS idx_comment_user_id;
DROP TABLE IF EXISTS comment CASCADE;