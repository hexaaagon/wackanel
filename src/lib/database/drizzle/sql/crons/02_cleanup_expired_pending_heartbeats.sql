-- Cron job to cleanup expired pending heartbeats every 6 hours
-- This job will remove pending heartbeats older than 24 hours directly in SQL

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup_expired_pending_heartbeats');
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if job doesn't exist
END;
$$;

-- Create the cron job
SELECT cron.schedule(
    'cleanup_expired_pending_heartbeats',
    '0 */8 * * *', -- Every 8 hours
    '/* This Cron job will cleanup expired pending heartbeats */ DELETE FROM user_wakatime_pending_heartbeats WHERE time < EXTRACT(EPOCH FROM NOW() - INTERVAL ''24 hours'')::INTEGER;'
);
