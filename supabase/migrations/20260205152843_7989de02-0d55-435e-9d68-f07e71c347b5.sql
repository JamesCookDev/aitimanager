-- NEXUS FLEET COMMAND - Database Schema

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin');

-- 2. Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. Devices table (the IoT totems)
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  api_key UUID NOT NULL DEFAULT gen_random_uuid(),
  last_ping TIMESTAMPTZ,
  current_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Device versions table (for 3D model updates)
CREATE TABLE public.device_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  model_url TEXT NOT NULL,
  version_notes TEXT,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key for current_version_id after device_versions exists
ALTER TABLE public.devices 
ADD CONSTRAINT devices_current_version_fkey 
FOREIGN KEY (current_version_id) REFERENCES public.device_versions(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_versions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's org_id helper function
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for organizations
CREATE POLICY "Super admins can see all orgs"
ON public.organizations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can see their org"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_user_org_id(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for devices
CREATE POLICY "Super admins can see all devices"
ON public.devices FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can see their org devices"
ON public.devices FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Super admins can manage all devices"
ON public.devices FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can manage their org devices"
ON public.devices FOR ALL
TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()));

-- RLS Policies for device_versions
CREATE POLICY "Super admins can see all versions"
ON public.device_versions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can see their device versions"
ON public.device_versions FOR SELECT
TO authenticated
USING (
  device_id IN (
    SELECT id FROM public.devices 
    WHERE org_id = public.get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Super admins can manage all versions"
ON public.device_versions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can manage their device versions"
ON public.device_versions FOR ALL
TO authenticated
USING (
  device_id IN (
    SELECT id FROM public.devices 
    WHERE org_id = public.get_user_org_id(auth.uid())
  )
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models', 'models', true);

-- Storage policies
CREATE POLICY "Anyone can view models"
ON storage.objects FOR SELECT
USING (bucket_id = 'models');

CREATE POLICY "Authenticated users can upload models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'models');

CREATE POLICY "Authenticated users can update models"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'models');

CREATE POLICY "Authenticated users can delete models"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'models');