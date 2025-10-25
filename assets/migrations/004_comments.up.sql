CREATE TABLE comments (
    id              CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id         CHAR(36)     NOT NULL,
    author_id       CHAR(36)     NOT NULL,
    parent_id       CHAR(36)     DEFAULT NULL,

    replies_count INT NOT NULL DEFAULT 0,

    content    VARCHAR(4096) NOT NULL,
    likes      INT           NOT NULL DEFAULT 0,
    dislikes   INT           NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,

    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_comment_post_id   ON comments (post_id);
CREATE INDEX idx_comment_author_id ON comments (author_id);
CREATE INDEX idx_comment_parent_id ON comments (parent_id);

CREATE TABLE comment_likes (
    id              CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    comment_id      CHAR(36)     NOT NULL,
    author_id       CHAR(36)     NOT NULL,
    type            ENUM('like', 'dislike'),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(comment_id, author_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,

    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- CREATE TRIGGER trg_comments_ai
--     AFTER INSERT ON comments
--     FOR EACH ROW
-- BEGIN
--     IF NEW.parent_id IS NOT NULL THEN
--     UPDATE comments
--     SET replies_count = replies_count + 1
--     WHERE id = NEW.parent_id;
-- END IF;
-- END;
--
-- CREATE TRIGGER trg_comments_ad
--     AFTER DELETE ON comments
--     FOR EACH ROW
-- BEGIN
--     IF OLD.parent_id IS NOT NULL THEN
--     UPDATE comments
--     SET replies_count = GREATEST(replies_count - 1, 0)
--     WHERE id = OLD.parent_id;
-- END IF;
-- END;

CREATE TRIGGER trg_comment_likes_ai
    AFTER INSERT ON comment_likes
    FOR EACH ROW
BEGIN
    UPDATE comments
    SET likes    = likes    + (NEW.`type` = 'like'),
        dislikes = dislikes + (NEW.`type` = 'dislike')
    WHERE id = NEW.comment_id;

    UPDATE users
    SET reputation = reputation + CASE WHEN NEW.`type` = 'like' THEN 1 ELSE -1 END
    WHERE id = (SELECT c.author_id FROM comments c WHERE c.id = NEW.comment_id);
END;

CREATE TRIGGER trg_comment_likes_au
    AFTER UPDATE ON comment_likes
    FOR EACH ROW
BEGIN
    IF NEW.`type` <> OLD.`type` THEN
        UPDATE comments
        SET likes    = GREATEST(likes    + (NEW.`type` = 'like')    - (OLD.`type` = 'like'),    0),
            dislikes = GREATEST(dislikes + (NEW.`type` = 'dislike') - (OLD.`type` = 'dislike'), 0)
        WHERE id = NEW.comment_id;

--         UPDATE users
--         SET reputation = reputation + CASE
--             WHEN OLD.`type` = 'like'    AND NEW.`type` = 'dislike' THEN -2
--             WHEN OLD.`type` = 'dislike' AND NEW.`type` = 'like'    THEN  2
--             ELSE 0
--         END
--         WHERE id = (SELECT c.author_id FROM comments c WHERE c.id = NEW.comment_id);
    END IF;
END;

CREATE TRIGGER trg_comment_likes_ad
    AFTER DELETE ON comment_likes
    FOR EACH ROW
BEGIN
    UPDATE comments
    SET likes    = GREATEST(likes    - (OLD.`type` = 'like'),    0),
        dislikes = GREATEST(dislikes - (OLD.`type` = 'dislike'), 0)
    WHERE id = OLD.comment_id;

--     UPDATE users
--     SET reputation = reputation + CASE WHEN OLD.`type` = 'like' THEN -1 ELSE 1 END
--     WHERE id = (SELECT c.author_id FROM comments c WHERE c.id = OLD.comment_id);
END;

CREATE INDEX idx_comment_likes_comment_id ON comment_likes (comment_id);
