-- ═══════════════════════════════════════════════════════════════
-- COMBUSTIBLE - ACEITES TAPIA SL
-- Schema de Base de Datos para Supabase
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar este script en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New Query → Pegar y ejecutar

-- ─── 1. TABLA DE PERFILES ───
-- Extiende la tabla auth.users con datos de negocio
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'operario' CHECK (role IN ('admin', 'operario')),
  plates TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por teléfono
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- ─── 2. TABLA DE ENTRADAS (Abastecimiento) ───
CREATE TABLE IF NOT EXISTS public.fuel_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('Diesel', 'Diesel Agrícola')),
  volume NUMERIC(10,2) NOT NULL CHECK (volume > 0),
  supplier TEXT NOT NULL,
  price_per_liter NUMERIC(8,4) NOT NULL CHECK (price_per_liter > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_fuel_entries_date ON public.fuel_entries(date DESC);

-- ─── 3. TABLA DE SALIDAS (Repostaje) ───
CREATE TABLE IF NOT EXISTS public.fuel_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('Diesel', 'Diesel Agrícola')),
  volume NUMERIC(10,2) NOT NULL CHECK (volume > 0),
  refuel_type TEXT NOT NULL CHECK (refuel_type IN ('Vehículo', 'Garrafa', 'Depósito')),
  plate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_fuel_exits_date ON public.fuel_exits(date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_exits_user ON public.fuel_exits(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_exits_product ON public.fuel_exits(product);

-- ─── 4. FUNCIÓN: Auto-actualizar updated_at ───
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para profiles
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── 5. FUNCIÓN: Auto-crear perfil en signup ───
-- Cuando se registra un usuario nuevo, se crea automáticamente un perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Sin nombre'),
    COALESCE(NEW.raw_user_meta_data->>'phone', REPLACE(SPLIT_PART(NEW.email, '@', 1), ' ', '')),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operario')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 6. ROW LEVEL SECURITY (RLS) ───

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_exits ENABLE ROW LEVEL SECURITY;

-- Helper: comprobar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── Políticas para PROFILES ───

-- Todos los autenticados pueden ver perfiles (necesario para mostrar nombres)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede insertar perfiles
CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin puede actualizar cualquier perfil; operarios solo el suyo
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Solo admin puede eliminar perfiles
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ─── Políticas para FUEL_ENTRIES ───

-- Todos los autenticados pueden ver entradas
CREATE POLICY "fuel_entries_select_authenticated"
  ON public.fuel_entries FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede insertar entradas
CREATE POLICY "fuel_entries_insert_admin"
  ON public.fuel_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Solo admin puede eliminar entradas
CREATE POLICY "fuel_entries_delete_admin"
  ON public.fuel_entries FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ─── Políticas para FUEL_EXITS ───

-- Admin ve todas las salidas; operarios solo las suyas
CREATE POLICY "fuel_exits_select"
  ON public.fuel_exits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Cualquier autenticado puede registrar salidas
CREATE POLICY "fuel_exits_insert_authenticated"
  ON public.fuel_exits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Solo admin puede eliminar salidas
CREATE POLICY "fuel_exits_delete_admin"
  ON public.fuel_exits FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ─── 7. HABILITAR REALTIME ───
-- Para que el dashboard se actualice en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_exits;

-- ─── 8. CREAR USUARIO ADMINISTRADOR INICIAL ───
-- NOTA: Este paso se hace DESPUÉS de registrar al admin desde la app
-- o manualmente actualizando el rol:
--
-- UPDATE public.profiles
-- SET role = 'admin', name = 'Felipe Tapia'
-- WHERE phone = '683613331';

-- ═══════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ═══════════════════════════════════════════════════════════════
