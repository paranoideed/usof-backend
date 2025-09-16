CREATE TABLE answers (
    id         CHAR(36)       PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id    CHAR(36)       NOT NULL,
    user_id    CHAR(36)       NOT NULL, -- author
    content    TEXT           NOT NULL,
    status     ENUM('accepted', 'rejected', 'proposed') NOT NULL DEFAULT 'proposed',
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_answer_post_id ON answers (post_id);
CREATE INDEX idx_answer_user_id ON answers (user_id);
