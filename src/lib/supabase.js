import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SUPABASE
// ═══════════════════════════════════════════════════════════════
// Reemplazar con las credenciales reales de tu proyecto Supabase
// Se pueden encontrar en: Settings → API en el dashboard de Supabase

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-ANON-KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ═══════════════════════════════════════════════════════════════
// Helper: comprobar si Supabase está configurado
// ═══════════════════════════════════════════════════════════════
export function isSupabaseConfigured() {
  return (
    supabaseUrl !== 'https://TU-PROYECTO.supabase.co' &&
    supabaseAnonKey !== 'TU-ANON-KEY'
  )
}
