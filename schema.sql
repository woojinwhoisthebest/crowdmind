-- Run this SQL in your Cloudflare D1 database console.
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options_json TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Fun',
  creator TEXT NOT NULL DEFAULT 'Anonymous',
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_votes INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(poll_id, voter_id),
  FOREIGN KEY (poll_id) REFERENCES polls(id)
);
CREATE TABLE IF NOT EXISTS poll_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_polls_created ON polls(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_poll ON votes(poll_id);
