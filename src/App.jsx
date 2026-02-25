import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/AppLayout'
import { Spinner } from './components/UI'
import { loginWithPhone, logout, getCurrentSession, onAuthStateChange } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Comprobar si Supabase está configurado
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase no configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
      setLoading(false)
      return
    }

    // Obtener sesión actual
    getCurrentSession()
      .then((s) => setSession(s))
      .catch(console.error)
      .finally(() => setLoading(false))

    // Escuchar cambios de autenticación
    const { data: { subscription } } = onAuthStateChange(async (event, authSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (event === 'SIGNED_IN' && authSession) {
        try {
          const s = await getCurrentSession()
          setSession(s)
        } catch (err) {
          console.error(err)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (phone) => {
    const result = await loginWithPhone(phone)
    setSession(result)
  }

  const handleLogout = async () => {
    await logout()
    setSession(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <AppLayout user={session.profile} onLogout={handleLogout} />
}
