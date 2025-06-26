-- Create database functions to get/set the current user ID in PostgreSQL session variables
-- These functions allow us to store and retrieve the current user ID within a database session

-- Function to get the current user ID from session variables
CREATE OR REPLACE FUNCTION current_user_id() RETURNS text AS $$
  SELECT current_setting('app.user_id', true);
$$ LANGUAGE sql STABLE;

-- Function to set the current user ID in session variables
CREATE OR REPLACE FUNCTION set_user_id(user_id text) RETURNS void AS $$
  SELECT set_config('app.user_id', user_id, false);
$$ LANGUAGE sql;

-- Optional: Function to check if a user ID is set
CREATE OR REPLACE FUNCTION has_user_id() RETURNS boolean AS $$
  SELECT current_setting('app.user_id', true) IS NOT NULL AND current_setting('app.user_id', true) != '';
$$ LANGUAGE sql STABLE;
