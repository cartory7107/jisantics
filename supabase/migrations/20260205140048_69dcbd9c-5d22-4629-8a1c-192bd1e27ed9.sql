-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'vendor', 'shareholder', 'developer', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create permissions enum
CREATE TYPE public.app_permission AS ENUM (
  'manage_users',
  'manage_vendors', 
  'manage_products',
  'manage_orders',
  'manage_categories',
  'view_analytics',
  'manage_settings',
  'manage_roles',
  'manage_permissions',
  'manage_payments',
  'view_reports',
  'manage_inventory'
);

-- Create role_permissions table to map permissions to roles
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission app_permission NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  store_description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission app_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Create function to check if user is any type of admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins with permission can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_roles') OR user_id = auth.uid());

CREATE POLICY "Admins with permission can manage roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'manage_roles'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for role_permissions
CREATE POLICY "Super admins can manage all permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins with permission can view permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_permissions') OR user_id = auth.uid());

CREATE POLICY "Admins with permission can manage permissions"
ON public.role_permissions
FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'manage_permissions'));

-- RLS Policies for vendors
CREATE POLICY "Anyone can view approved vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can manage all vendors"
ON public.vendors
FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_vendors'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_vendors'));

CREATE POLICY "Vendors can view their own store"
ON public.vendors
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Vendors can update their own store"
ON public.vendors
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();