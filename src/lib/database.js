import { supabase } from './supabase'

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE DATOS — COMBUSTIBLE (Ecosistema Unificado)
// ═══════════════════════════════════════════════════════════════
// Tablas: staff, fuel_entries, fuel_exits
// Instancia: ylbwewlvovyfxoerhrnf.supabase.co (compartida)

// ─── ENTRADAS (Abastecimiento) ───

export async function createEntry({ date, product, volume, supplier, price_per_liter, created_by }) {
  const { data, error } = await supabase
    .from('fuel_entries')
    .insert({
      date,
      product,
      volume: parseFloat(volume),
      supplier: supplier.trim(),
      price_per_liter: parseFloat(price_per_liter),
      created_by,  // staff.id del admin que registra
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

export async function createExit({ staff_id, staff_name, date, product, volume, refuel_type, plate }) {
  const { data, error } = await supabase
    .from('fuel_exits')
    .insert({
      staff_id,
      staff_name,
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

export async function getExits({ limit = 50, offset = 0, staffId = null, product = null, refuelType = null } = {}) {
  let query = supabase
    .from('fuel_exits')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })

  if (staffId) query = query.eq('staff_id', staffId)
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

// ─── PERSONAL (Staff) ───

export async function getStaffMembers() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function updateStaffMember(id, updates) {
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deactivateStaffMember(id) {
  const { data, error } = await supabase
    .from('staff')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── ESTADÍSTICAS (Dashboard) ───

export async function getStats() {
  const { data: entries } = await supabase
    .from('fuel_entries')
    .select('product, volume')

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
