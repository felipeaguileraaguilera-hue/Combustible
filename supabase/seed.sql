-- ═══════════════════════════════════════════════════════════════
-- DATOS INICIALES
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar DESPUÉS de que el admin se haya registrado por primera vez
-- a través de la aplicación con su teléfono (683613331)

-- 1. Promover a Felipe como administrador
UPDATE public.profiles
SET
  role = 'admin',
  name = 'Felipe Tapia',
  plates = ARRAY['1234ABC']
WHERE phone = '683613331';

-- 2. Verificar que el admin está configurado
SELECT id, name, phone, role, plates
FROM public.profiles
WHERE phone = '683613331';

-- ═══════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (OPCIONAL - solo para desarrollo)
-- ═══════════════════════════════════════════════════════════════

-- Ejemplo: Insertar una entrada de combustible de prueba
-- INSERT INTO public.fuel_entries (date, product, volume, supplier, price_per_liter)
-- VALUES
--   ('2026-02-20', 'Diesel', 2000, 'Repsol Distribución', 1.385),
--   ('2026-02-15', 'Diesel Agrícola', 3000, 'BP España', 1.120);

-- Ejemplo: Insertar una salida de prueba
-- INSERT INTO public.fuel_exits (user_id, user_name, date, product, volume, refuel_type, plate)
-- VALUES
--   ((SELECT id FROM profiles WHERE phone = '683613331'), 'Felipe Tapia',
--    '2026-02-22 08:30:00+01', 'Diesel', 45.5, 'Vehículo', '1234ABC');
