import { useState } from 'react'
import { Card, Input, Select, Button } from '../components/UI'
import { IconFuel, IconUser } from '../components/Icons'
import { createExit } from '../lib/database'
import { nowLocal, isFutureDate } from '../lib/utils'

export default function SalidasPage({ user, showToast }) {
  const [form, setForm] = useState({
    date: nowLocal(),
    product: 'Diesel',
    volume: '',
    refuel_type: 'Vehículo',
    plate: user.plates?.[0] || '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const needsPlate = form.refuel_type === 'Vehículo'

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Requerido'
    if (isFutureDate(form.date)) e.date = 'No puede ser fecha futura'
    if (!form.volume || parseFloat(form.volume) <= 0) e.volume = 'Debe ser mayor que 0'
    if (needsPlate && !form.plate.trim()) e.plate = 'Matrícula requerida para vehículos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await createExit({
        staff_id: user.id,
        staff_name: user.name,
        date: form.date,
        product: form.product,
        volume: form.volume,
        refuel_type: form.refuel_type,
        plate: needsPlate ? form.plate : null,
      })
      setForm({
        date: nowLocal(),
        product: 'Diesel',
        volume: '',
        refuel_type: 'Vehículo',
        plate: user.plates?.[0] || '',
      })
      setErrors({})
      showToast('Salida registrada correctamente')
    } catch (err) {
      showToast(err.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (newType) => {
    setForm({
      ...form,
      refuel_type: newType,
      plate: newType === 'Vehículo' ? (user.plates?.[0] || '') : '',
    })
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="animate-fade-in">
      <h2 className="text-[22px] font-extrabold tracking-tight mb-1">
        <span className="text-red-400">−</span> Salida de Combustible
      </h2>
      <p className="text-[13px] text-gray-500 mb-5">Registro de repostaje</p>

      <Card className="mb-4">
        {/* Operario */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-olive-500/10 rounded-lg mb-4">
          <IconUser size={16} className="text-olive-500" />
          <span className="text-sm font-semibold text-olive-400">{user.name}</span>
        </div>

        <Input label="Fecha y hora" type="datetime-local" value={form.date}
          max={nowLocal()} error={errors.date} onChange={set('date')} />

        <Select label="Producto" value={form.product} onChange={set('product')}
          options={[
            { value: 'Diesel', label: 'Diesel' },
            { value: 'Diesel Agrícola', label: 'Diesel Agrícola' },
          ]} />

        <Input label="Volumen (litros)" type="number" step="0.1" min="0"
          placeholder="0.0" value={form.volume} error={errors.volume} onChange={set('volume')} />

        {/* Tipo de repostaje */}
        <div className="mb-4">
          <label className="block text-[13px] text-gray-400 mb-1.5 font-medium">
            Tipo de repostaje
          </label>
          <div className="flex gap-2">
            {['Vehículo', 'Garrafa', 'Depósito'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex-1 py-2.5 px-3 rounded-lg border text-[13px] font-semibold
                  transition-all cursor-pointer
                  ${form.refuel_type === type
                    ? 'border-olive-500 bg-olive-500/10 text-olive-400'
                    : 'border-dark-border bg-dark text-gray-500 hover:border-dark-border-light'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Matrícula */}
        {needsPlate && (
          <div className="mb-4">
            <label className="block text-[13px] text-gray-400 mb-1.5 font-medium">
              Matrícula
            </label>

            {/* Matrículas guardadas */}
            {user.plates && user.plates.length > 1 && (
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {user.plates.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, plate: p })}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-semibold font-mono
                      border transition-all cursor-pointer
                      ${form.plate === p
                        ? 'border-olive-500 bg-olive-500/10 text-olive-400'
                        : 'border-dark-border bg-dark text-gray-500'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              value={form.plate}
              placeholder="1234ABC"
              onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
              className={`w-full px-3.5 py-2.5 bg-dark border rounded-lg text-[15px] text-gray-100
                font-mono tracking-wider outline-none transition-colors
                ${errors.plate ? 'border-red-500' : 'border-dark-border focus:border-olive-500'}`}
            />
            {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate}</p>}
          </div>
        )}

        <Button fullWidth onClick={handleSubmit} loading={loading}>
          <IconFuel size={18} /> Registrar Salida
        </Button>
      </Card>
    </div>
  )
}
