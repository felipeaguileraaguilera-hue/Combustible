import { supabase } from './supabase'

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE DATOS - COMBUSTIBLE
// ═══════════════════════════════════════════════════════════════

// ─── ENTRADAS (Abastecimiento) ───

export async function createEntry({ date, product, volume, supplier, price_per_liter }) {
  const { data, error } = await supabase
    .from('fuel_entries')
    .insert({
      date,
      product,
      volume: parseFloat(volume),
      supplier: supplier.trim(),
      price_per_liter: parseFloat(price_per_liter),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEntries({ limit = 50, offset = 0 } = {}) {
  const { data, error, count } = await supabase
    .from('fuel_entries')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count }
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from('fuel_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── SALIDAS (Repostaje) ───

export async function createExit({ staff_id, user_name, date, product, volume, refuel_type, plate }) {
  const { data, error } = await supabase
    .from('fuel_exits')
    .insert({
      staff_id,
      user_name,
      date,
      product,
      volume: parseFloat(volume),
      refuel_type,
      plate: plate ? plate.trim().toUpperCase() : null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getExits({ limit = 50, offset = 0, userId = null, product = null, refuelType = null } = {}) {
  let query = supabase
    .from('fuel_exits')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })

  if (userId) query = query.eq('user_id', userId)
  if (product && product !== 'all') query = query.eq('product', product)
  if (refuelType && refuelType !== 'all') query = query.eq('refuel_type', refuelType)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function deleteExit(id) {
  const { error } = await supabase
    .from('fuel_exits')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── PERFILES / USUARIOS ───

export async function getProfiles() {
  const { data, error } = await supabase
    .from('staff ')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('staff ')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProfile(id) {
  const { error } = await supabase
    .from('staff ')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── ESTADÍSTICAS (Dashboard) ───

export async function getStats() {
  // Total entradas por producto
  const { data: entries } = await supabase
    .from('fuel_entries')
    .select('product, volume')

  // Total salidas por producto
  const { data: exits } = await supabase
    .from('fuel_exits')
    .select('product, volume')

  const stats = {
    diesel: { entries: 0, exits: 0 },
    agricola: { entries: 0, exits: 0 },
  }

  entries?.forEach((e) => {
    if (e.product === 'Diesel') stats.diesel.entries += e.volume
    else stats.agricola.entries += e.volume
  })

  exits?.forEach((e) => {
    if (e.product === 'Diesel') stats.diesel.exits += e.volume
    else stats.agricola.exits += e.volume
  })

  return {
    diesel: {
      stock: stats.diesel.entries - stats.diesel.exits,
      totalIn: stats.diesel.entries,
      totalOut: stats.diesel.exits,
    },
    agricola: {
      stock: stats.agricola.entries - stats.agricola.exits,
      totalIn: stats.agricola.entries,
      totalOut: stats.agricola.exits,
    },
    totalIn: stats.diesel.entries + stats.agricola.entries,
    totalOut: stats.diesel.exits + stats.agricola.exits,
  }
}

// ─── SUSCRIPCIÓN EN TIEMPO REAL ───

export function subscribeToExits(callback) {
  return supabase
    .channel('fuel_exits_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_exits' }, callback)
    .subscribe()
}

export function subscribeToEntries(callback) {
  return supabase
    .channel('fuel_entries_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_entries' }, callback)
    .subscribe()
}
