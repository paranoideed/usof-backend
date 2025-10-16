CREATE TABLE posts (
    id              CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    author_id       CHAR(36)     NOT NULL,
    author_username VARCHAR(255) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    status          ENUM('active', 'inactive', 'hidden') NOT NULL DEFAULT 'active',

    content    TEXT         NOT NULL,
    likes      INT          NOT NULL DEFAULT 0,
    dislikes   INT          NOT NULL DEFAULT 0,

    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     DEFAULT NULL,

    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id, author_username)
            REFERENCES users (id, username)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
);

CREATE TABLE post_categories (
    post_id     CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,

    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE post_likes (
    id              CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    post_id         CHAR(36)     NOT NULL,
    author_id       CHAR(36)     NOT NULL,
    author_username VARCHAR(255) NOT NULL,
    type            ENUM('like', 'dislike'),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(post_id, author_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,

    CONSTRAINT fk_post_likes_author
        FOREIGN KEY (author_id, author_username)
            REFERENCES users (id, username)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
);

CREATE TRIGGER trg_post_likes_after_insert
    AFTER INSERT ON post_likes
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes    = likes    + CASE WHEN NEW.type = 'like'    THEN 1 ELSE 0 END,
        dislikes = dislikes + CASE WHEN NEW.type = 'dislike' THEN 1 ELSE 0 END
    WHERE id = NEW.post_id;

    UPDATE users
    SET reputation = reputation + CASE WHEN NEW.type = 'like' THEN 1 ELSE -1 END
    WHERE id = (SELECT p.author_id FROM posts p WHERE p.id = NEW.post_id);
END;

CREATE TRIGGER trg_post_likes_after_update
    AFTER UPDATE ON post_likes
    FOR EACH ROW
BEGIN
    IF OLD.type <> NEW.type THEN
        UPDATE posts
        SET likes    = GREATEST(likes    + CASE WHEN NEW.type = 'like'    THEN 1 ELSE -1 END, 0),
            dislikes = GREATEST(dislikes + CASE WHEN NEW.type = 'dislike' THEN 1 ELSE -1 END, 0)
        WHERE id = NEW.post_id;

        UPDATE users
        SET reputation = reputation + CASE
            WHEN OLD.type = 'like'    AND NEW.type = 'dislike' THEN -2
            WHEN OLD.type = 'dislike' AND NEW.type = 'like'    THEN  2
            ELSE 0
        END
        WHERE id = (SELECT p.author_id FROM posts p WHERE p.id = NEW.post_id);
    END IF;
END;

CREATE TRIGGER trg_post_likes_after_delete
    AFTER DELETE ON post_likes
    FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes    = GREATEST(likes    - CASE WHEN OLD.type = 'like'    THEN 1 ELSE 0 END, 0),
        dislikes = GREATEST(dislikes - CASE WHEN OLD.type = 'dislike' THEN 1 ELSE 0 END, 0)
    WHERE id = OLD.post_id;

    UPDATE users
    SET reputation = reputation + CASE WHEN OLD.type = 'like' THEN -1 ELSE 1 END
    WHERE id = (SELECT p.author_id FROM posts p WHERE p.id = OLD.post_id);
END;


CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);
CREATE INDEX idx_post_likes_post_id ON post_likes (post_id);