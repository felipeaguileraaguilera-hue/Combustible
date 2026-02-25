import { useState } from 'react'
import { IconFuel } from '../components/Icons'
import { Input, Button, Card } from '../components/UI'

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 6) {
      setError('Introduce un número de teléfono válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onLogin(cleaned)
    } catch (err) {
      setError(err.message || 'Error al acceder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-[#141820] to-[#111418] p-5">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-[72px] h-[72px] rounded-2xl bg-olive-500/12 border border-olive-700/40
            flex items-center justify-center mx-auto mb-5 text-olive-500">
            <IconFuel size={36} />
          </div>
          <h1 className="text-[26px] font-extrabold text-gray-100 tracking-tight">
            Combustible
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Aceites Tapia · Control de Gasóleo
          </p>
        </div>

        {/* Form */}
        <Card>
          <Input
            label="Número de teléfono"
            type="tel"
            placeholder="683 613 331"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError('') }}
            error={error}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          <Button fullWidth onClick={handleLogin} loading={loading}>
            {loading ? 'Accediendo...' : 'Acceder'}
          </Button>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6">
          Introduce tu teléfono para acceder al sistema
        </p>
      </div>
    </div>
  )
}
