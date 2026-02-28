import { useState, useEffect } from 'react'
import { Card, Input, Select, Button, EmptyState } from '../components/UI'
import { IconPlus, IconTruck } from '../components/Icons'
import { createEntry, getEntries } from '../lib/database'
import { todayLocal, formatDate, formatVolume, formatCurrency, isFutureDate } from '../lib/utils'

export default function EntradasPage({ user, showToast }) {
  const [form, setForm] = useState({
    date: todayLocal(),
    product: 'Diesel',
    volume: '',
    supplier: '',
    price_per_liter: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState([])

  const loadEntries = async () => {
    try {
      const { data } = await getEntries({ limit: 10 })
      setEntries(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { loadEntries() }, [])

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Requerido'
    if (isFutureDate(form.date)) e.date = 'No puede ser fecha futura'
    if (!form.volume || parseFloat(form.volume) <= 0) e.volume = 'Debe ser mayor que 0'
    if (!form.supplier.trim()) e.supplier = 'Requerido'
    if (!form.price_per_liter || parseFloat(form.price_per_liter) <= 0) e.price_per_liter = 'Debe ser mayor que 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await createEntry({ ...form, created_by: user.id })
      setForm({ date: todayLocal(), product: 'Diesel', volume: '', supplier: '', price_per_liter: '' })
      setErrors({})
      showToast('Entrada registrada correctamente')
      loadEntries()
    } catch (err) {
      showToast(err.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="animate-fade-in">
      <h2 className="text-[22px] font-extrabold tracking-tight mb-1">
        <span className="text-olive-500">+</span> Entrada de Combustible
      </h2>
      <p className="text-[13px] text-gray-500 mb-5">
        Registro de abastecimiento de depósitos
      </p>

      <Card className="mb-5">
        <Input label="Fecha" type="date" value={form.date} max={todayLocal()}
          error={errors.date} onChange={set('date')} />

        <Select label="Producto" value={form.product} onChange={set('product')}
          options={[
            { value: 'Diesel', label: 'Diesel' },
            { value: 'Diesel Agrícola', label: 'Diesel Agrícola' },
          ]} />

        <Input label="Volumen (litros)" type="number" step="0.1" min="0"
          placeholder="0.0" value={form.volume} error={errors.volume} onChange={set('volume')} />

        <Input label="Proveedor" type="text" placeholder="Nombre del suministrador"
          value={form.supplier} error={errors.supplier} onChange={set('supplier')} />

        <Input label="Precio por litro (€)" type="number" step="0.001" min="0"
          placeholder="0.000" value={form.price_per_liter} error={errors.price_per_liter}
          onChange={set('price_per_liter')} />

        <Button fullWidth onClick={handleSubmit} loading={loading}>
          <IconPlus size={18} /> Registrar Entrada
        </Button>
      </Card>

      {entries.length > 0 && (
        <Card title="Últimas Entradas" icon={<IconTruck size={18} />}>
          <div className="flex flex-col gap-2">
            {entries.map((en) => (
              <div key={en.id} className="flex justify-between items-center p-3 bg-dark rounded-lg">
                <div>
                  <div className="text-sm font-semibold">{en.supplier}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(en.date)} · {en.product} · {formatCurrency(en.price_per_liter)}€/L
                  </div>
                </div>
                <div className="text-base font-bold text-olive-400 font-mono">
                  +{formatVolume(en.volume)}L
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
