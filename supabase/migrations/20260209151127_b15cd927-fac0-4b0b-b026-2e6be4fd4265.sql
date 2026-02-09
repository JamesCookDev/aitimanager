
-- Add pending_command column to devices for remote commands (restart, etc.)
ALTER TABLE public.devices 
ADD COLUMN pending_command text DEFAULT NULL;

-- Add command_sent_at to track when the command was issued
ALTER TABLE public.devices 
ADD COLUMN command_sent_at timestamp with time zone DEFAULT NULL;
