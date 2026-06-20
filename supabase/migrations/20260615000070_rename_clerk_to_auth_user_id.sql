ALTER TABLE users RENAME COLUMN clerk_user_id TO auth_user_id;
ALTER INDEX IF EXISTS idx_users_clerk_user_id RENAME TO idx_users_auth_user_id;
