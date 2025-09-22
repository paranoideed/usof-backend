CREATE TABLE posts (
    id         CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    user_id    CHAR(36)     NOT NULL, -- author
    title      VARCHAR(255) NOT NULL,
    status     ENUM('active', 'hidden', 'deleted') NOT NULL DEFAULT 'active',

    content    TEXT         NOT NULL,
    likes      INT          NOT NULL DEFAULT 0,
    dislikes   INT          NOT NULL DEFAULT 0,

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

CREATE TABLE post_likes (
    id         CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id    CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    type       ENUM('like', 'dislike'),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AFTER INSERT
CREATE TRIGGER trg_post_likes_ai
    AFTER INSERT ON post_likes
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes    = likes    + (NEW.`type` = 'like'),
        dislikes = dislikes + (NEW.`type` = 'dislike')
    WHERE id = NEW.post_id;
END;

-- AFTER UPDATE (перенос 1 из одного счётчика в другой, если тип поменялся)
CREATE TRIGGER trg_post_likes_au
    AFTER UPDATE ON post_likes
    FOR EACH ROW
BEGIN
    IF NEW.`type` <> OLD.`type` THEN
    UPDATE posts
    SET likes    = GREATEST(likes    + (NEW.`type` = 'like')    - (OLD.`type` = 'like'),    0),
        dislikes = GREATEST(dislikes + (NEW.`type` = 'dislike') - (OLD.`type` = 'dislike'), 0)
    WHERE id = NEW.post_id;
END IF;
END;

-- AFTER DELETE
CREATE TRIGGER trg_post_likes_ad
    AFTER DELETE ON post_likes
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes    = GREATEST(likes    - (OLD.`type` = 'like'),    0),
        dislikes = GREATEST(dislikes - (OLD.`type` = 'dislike'), 0)
    WHERE id = OLD.post_id;
END;


CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);
CREATE INDEX idx_post_likes_post_id ON post_likes (post_id);