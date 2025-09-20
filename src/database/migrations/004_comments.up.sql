CREATE TABLE comments (
    id        CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id   CHAR(36) NOT NULL,
    user_id   CHAR(36) NOT NULL,
    parent_id CHAR(36) DEFAULT NULL, -- nested comment

    content    VARCHAR(4096) NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_post_id ON comments (post_id);
CREATE INDEX idx_comment_user_id ON comments (user_id);
