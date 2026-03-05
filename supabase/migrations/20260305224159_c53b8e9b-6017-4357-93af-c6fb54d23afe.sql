ALTER TABLE public.devices ADD COLUMN hardware_id text UNIQUE;
CREATE INDEX idx_devices_hardware_id ON public.devices (hardware_id) WHERE hardware_id IS NOT NULL;