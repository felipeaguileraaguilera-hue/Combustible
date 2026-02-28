import { supabase, isSupabaseConfigured } from './supabase'

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE AUTENTICACIÓN — ECOSISTEMA UNIFICADO
// ═══════════════════════════════════════════════════════════════
// Usa la tabla 'staff' de la instancia principal de Supabase.
// Login por teléfono: busca en staff, luego autentica con Supabase Auth.
//
// Flujo:
//   1. Usuario introduce su teléfono
//   2. Buscamos en staff el registro con ese teléfono
//   3. Si tiene auth_user_id → login con email/password
//   4. Si no tiene auth_user_id (primer acceso) → signup + vincular

function phoneToEmail(phone) {
  const cleaned = phone.replace(/\s+/g, '')
  return `staff-${cleaned}@aceitestapia.com`
}

// ─── Login por teléfono ───
export async function loginWithPhone(phone) {
  const cleaned = phone.replace(/\s+/g, '')

  if (!cleaned || cleaned.length < 6) {
    throw new Error('Introduce un número de teléfono válido')
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado. Revisa las variables de entorno.')
  }

  // 1. Buscar empleado en staff
  const { data: member, error: findError } = await supabase
    .from('staff')
    .select('*')
    .eq('phone', cleaned)
    .eq('is_active', true)
    .single()

  if (findError || !member) {
    throw new Error('Teléfono no registrado. Contacta con el administrador.')
  }

  const email = phoneToEmail(cleaned)

  // 2. Si ya tiene auth vinculado → login directo
  if (member.auth_user_id) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: cleaned,
    })

    if (error) throw new Error('Error de acceso. Inténtalo de nuevo.')
    return { user: data.user, profile: member }
  }

  // 3. Primer acceso: crear auth user y vincular
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: cleaned,
  })

  if (signUpError) {
    // Auth user ya existía (migración previa) → login + vincular
    if (signUpError.message.includes('already registered')) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: cleaned,
      })
      if (loginError) throw new Error('Error de acceso. Inténtalo de nuevo.')

      await supabase.from('staff').update({ auth_user_id: loginData.user.id }).eq('id', member.id)
      member.auth_user_id = loginData.user.id
      return { user: loginData.user, profile: member }
    }
    throw signUpError
  }

  // Vincular auth_user_id
  await supabase.from('staff').update({ auth_user_id: signUpData.user.id }).eq('id', member.id)
  member.auth_user_id = signUpData.user.id
  return { user: signUpData.user, profile: member }
}

// ─── Logout ───
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Sesión actual ───
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const profile = await getStaffProfile(session.user.id)
  if (!profile) return null
  return { user: session.user, profile }
}

// ─── Perfil de staff por auth_user_id ───
async function getStaffProfile(authUserId) {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

// ─── Crear empleado (solo admin) ───
export async function createStaffMember({ name, phone, role = 'operario', plates = [] }) {
  const cleaned = phone.replace(/\s+/g, '')

  const { data, error } = await supabase
    .from('staff')
    .insert({
      name: name.trim(),
      phone: cleaned,
      role,
      plates,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      throw new Error('Este teléfono ya está registrado')
    }
    throw error
  }
  return data
}

// ─── Listener ───
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
