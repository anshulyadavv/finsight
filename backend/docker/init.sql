-- FinIQ database initialisation
-- Runs once on first container start.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fast ILIKE / text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- multi-column GIN indexes

-- Ensure the finiq user has full access
GRANT ALL PRIVILEGES ON DATABASE finiq_db TO finiq;

-- Useful for future full-text search on transaction descriptions
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tx_desc_trgm
--   ON transactions USING GIN (description gin_trgm_ops);
