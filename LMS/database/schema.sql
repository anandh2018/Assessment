-- Library Management System — Database Schema
-- SQLite-compatible SQL

CREATE TABLE IF NOT EXISTS books (
    book_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT    NOT NULL,
    author            TEXT    NOT NULL,
    category          TEXT,
    isbn              TEXT    UNIQUE,
    availability_status TEXT  NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS borrowers (
    borrower_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    borrower_name TEXT    NOT NULL,
    email         TEXT,
    phone         TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER  PRIMARY KEY AUTOINCREMENT,
    book_id        INTEGER  NOT NULL REFERENCES books(book_id),
    borrower_id    INTEGER  NOT NULL REFERENCES borrowers(borrower_id),
    borrow_date    DATETIME NOT NULL DEFAULT (datetime('now')),
    return_date    DATETIME
);
