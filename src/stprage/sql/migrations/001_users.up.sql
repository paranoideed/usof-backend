CREATE TABLE users (
    id            CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    role          ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(255) UNIQUE NOT NULL,
    pseudonym     VARCHAR(255),
    reputation    INT          DEFAULT 0 NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT NULL,

   UNIQUE(id, username)
);

CREATE INDEX idx_username ON users (username);
CREATE INDEX idx_email ON users (email);
