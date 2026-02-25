import { supabase, isSupabaseConfigured } from './supabase'

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════
// Usa el teléfono como identificador único
// Internamente crea email ficticio: {telefono}@aceitestapia.com
// La contraseña es el propio teléfono (simplificado para operarios)

function phoneToEmail(phone) {
  const cleaned = phone.replace(/\s+/g, '')
  return `${cleaned}@aceitestapia.com`
}

// ─── Login ───
export async function loginWithPhone(phone) {
  const cleaned = phone.replace(/\s+/g, '')

  if (!cleaned || cleaned.length < 6) {
    throw new Error('Introduce un número de teléfono válido')
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado. Revisa las variables de entorno.')
  }

  const email = phoneToEmail(cleaned)

  // Intentar login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: cleaned,
  })

  if (error) {
    // Comprobar si el usuario existe en la tabla de perfiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, phone')
      .eq('phone', cleaned)
      .single()

    if (!profile) {
      throw new Error('Teléfono no registrado. Contacta con el administrador.')
    }

    throw new Error('Error de acceso. Inténtalo de nuevo.')
  }

  // Obtener perfil completo
  const profile = await getProfile(data.user.id)
  return { user: data.user, profile }
}

// ─── Logout ───
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Obtener sesión actual ───
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const profile = await getProfile(session.user.id)
  return { user: session.user, profile }
}

// ─── Obtener perfil ───
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// ─── Crear usuario (solo admin) ───
export async function createUser({ name, phone, plates = [] }) {
  const cleaned = phone.replace(/\s+/g, '')
  const email = phoneToEmail(cleaned)

  // 1. Crear usuario en Supabase Auth via Edge Function o admin API
  //    Como usamos la clave anon, primero hacemos signup normal
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: cleaned,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new Error('Este teléfono ya está registrado')
    }
    throw authError
  }

  // 2. Crear/actualizar perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      name: name.trim(),
      phone: cleaned,
      role: 'operario',
      plates: plates,
    })
    .select()
    .single()

  if (profileError) throw profileError
  return profile
}

// ─── Listener de cambios de autenticación ───
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
