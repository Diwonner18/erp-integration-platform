
-- Schedule daily purge of expired audit logs at midnight UTC
SELECT cron.schedule(
  'purge-expired-logs-daily',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://mpuocbbascmfpfmsrdwo.supabase.co/functions/v1/purge-expired-logs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdW9jYmJhc2NtZnBmbXNyZHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzYyNzIsImV4cCI6MjA4ODY1MjI3Mn0.ntxKnXCVBcRmQedY1KhizxKR_2bGITFDRNsrFnEOjhU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
