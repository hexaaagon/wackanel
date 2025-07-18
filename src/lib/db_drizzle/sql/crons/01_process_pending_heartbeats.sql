-- Cron job to process pending heartbeats every minute
-- This job will call the backend scheduler to process any pending heartbeats

DO $$
BEGIN
    PERFORM cron.unschedule('process_pending_heartbeats');
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if job doesn't exist
END;
$$;

-- Create the cron job
SELECT cron.schedule(
    'process_pending_heartbeats',
    '*/30 * * * *', -- Every 30 minutes
    '/* This Cron job will process pending heartbeats */ SELECT net.http_post(url := ''http://{{APP_URL}}/v1/backend/schedule-pending'', headers := JSONB_BUILD_OBJECT(''Authorization'', ''{{APP_PASSWORD}}'', ''Content-Type'', ''application/json'', ''User-Agent'', ''pg_net/1.0'') /* Don''t share this Authorization Key. */, timeout_milliseconds := 10000);'
);
