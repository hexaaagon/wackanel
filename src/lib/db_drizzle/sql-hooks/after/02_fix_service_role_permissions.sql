-- Fix service role permissions on existing tables
-- This ensures service role can bypass RLS on all custom tables

-- Grant permissions on all existing tables in public schema to service_role
-- Using DO block to handle potential permission errors gracefully
DO $$
BEGIN
    -- Grant permissions on all existing tables in public schema to service_role
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    
    -- Ensure service_role has usage on schema
    GRANT USAGE ON SCHEMA public TO service_role;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but continue (permissions might already exist)
        RAISE NOTICE 'Service role permissions already exist or error occurred: %', SQLERRM;
END
$$;
