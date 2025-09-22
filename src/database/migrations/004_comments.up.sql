-- comments (чуть подправлено)
CREATE TABLE comments (
    id         CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id    CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    parent_id  CHAR(36) DEFAULT NULL, -- nested comment

    content    VARCHAR(4096) NOT NULL,
    likes      INT           NOT NULL DEFAULT 0,
    dislikes   INT           NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_post_id   ON comments (post_id);
CREATE INDEX idx_comment_user_id   ON comments (user_id);
CREATE INDEX idx_comment_parent_id ON comments (parent_id);

CREATE TABLE comment_likes (
    id          CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    comment_id  CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    type        ENUM('like', 'dislike'),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- AFTER INSERT: инкремент нужного счётчика
CREATE TRIGGER trg_comment_likes_ai
    AFTER INSERT ON comment_likes
    FOR EACH ROW
BEGIN
    UPDATE comments
    SET likes    = likes    + (NEW.`type` = 'like'),
        dislikes = dislikes + (NEW.`type` = 'dislike')
    WHERE id = NEW.comment_id;
END;

-- AFTER UPDATE: если тип изменился, переносим единицу между колонками
CREATE TRIGGER trg_comment_likes_au
    AFTER UPDATE ON comment_likes
    FOR EACH ROW
BEGIN
    IF NEW.`type` <> OLD.`type` THEN
    UPDATE comments
    SET likes    = GREATEST(likes    + (NEW.`type` = 'like')    - (OLD.`type` = 'like'),    0),
        dislikes = GREATEST(dislikes + (NEW.`type` = 'dislike') - (OLD.`type` = 'dislike'), 0)
    WHERE id = NEW.comment_id;
END IF;
END;

-- AFTER DELETE: декремент соответствующего счётчика
CREATE TRIGGER trg_comment_likes_ad
    AFTER DELETE ON comment_likes
    FOR EACH ROW
BEGIN
    UPDATE comments
    SET likes    = GREATEST(likes    - (OLD.`type` = 'like'),    0),
        dislikes = GREATEST(dislikes - (OLD.`type` = 'dislike'), 0)
    WHERE id = OLD.comment_id;
END;


CREATE INDEX idx_comment_likes_comment_id ON comment_likes (comment_id);
