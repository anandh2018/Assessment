-- Feedback Management System - Database Schema
-- SQLite compatible

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_name TEXT NOT NULL,
    program_name     TEXT NOT NULL,
    rating           INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments         TEXT,
    submitted_at     DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_feedback_rating       ON feedback (rating);
CREATE INDEX IF NOT EXISTS idx_feedback_program_name ON feedback (program_name);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON feedback (submitted_at DESC);
