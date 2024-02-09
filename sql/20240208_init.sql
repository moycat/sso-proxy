CREATE TABLE IF NOT EXISTS clients
(
    client_id       TEXT PRIMARY KEY NOT NULL,
    client_secret   TEXT NOT NULL,
    redirect_uri    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users
(
    id          TEXT PRIMARY KEY NOT NULL,
    username    TEXT,
    email       TEXT,
    name        TEXT,
    picture     TEXT
);
