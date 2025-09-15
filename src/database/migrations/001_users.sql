-- +migrate Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "user_role" AS ENUM (
    'admin',
    'user'
);

CREATE TABLE users (
    id            CHAR(36)     PRIMARY KEY NOT NULL DEFAULT (UUID()),
    role          user_role    DEFAULT 'user'   NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    login         VARCHAR(255) UNIQUE NOT NULL,
    pseudonym     VARCHAR(255) UNIQUE,
    avatar        TEXT,
    reputation    INT          DEFAULT 0        NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE INDEX idx_login ON user (login);
CREATE INDEX idx_email ON user (email);

-- +migrate Down
DROP INDEX IF EXISTS idx_login;
DROP INDEX IF EXISTS idx_email;

DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role;

DROP EXTENSION IF EXISTS "uuid-ossp";
