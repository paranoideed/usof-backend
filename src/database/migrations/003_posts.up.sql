CREATE TABLE posts (
    id         CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    user_id    CHAR(36)     NOT NULL, -- author
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    status     ENUM('active', 'hidden', 'deleted') NOT NULL DEFAULT 'active',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE post_categories (
    post_id     CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,

    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);
