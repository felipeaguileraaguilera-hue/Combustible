import { useState, useCallback, useMemo } from 'react'
import { Toast } from '../components/UI'
import { IconFuel, IconLogout, IconDashboard, IconArrowUp, IconArrowDown, IconUser, IconList } from '../components/Icons'
import DashboardPage from '../pages/DashboardPage'
import SalidasPage from '../pages/SalidasPage'
import EntradasPage from '../pages/EntradasPage'
import UsuariosPage from '../pages/UsuariosPage'
import HistorialPage from '../pages/HistorialPage'

export default function AppLayout({ user, onLogout }) {
  const [view, setView] = useState('salidas')
  const [toast, setToast] = useState(null)
  const isAdmin = user.role === 'admin'

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const navItems = useMemo(() => {
    const items = [
      { id: 'salidas', label: 'Salidas', icon: <IconArrowUp size={18} /> },
    ]
    if (isAdmin) {
      items.unshift({ id: 'dashboard', label: 'Panel', icon: <IconDashboard size={18} /> })
      items.push({ id: 'entradas', label: 'Entradas', icon: <IconArrowDown size={18} /> })
      items.push({ id: 'usuarios', label: 'Personal', icon: <IconUser size={18} /> })
    }
    items.push({ id: 'historial', label: 'Historial', icon: <IconList size={18} /> })
    return items
  }, [isAdmin])

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return isAdmin ? <DashboardPage /> : null
      case 'salidas':
        return <SalidasPage user={user} showToast={showToast} />
      case 'entradas':
        return isAdmin ? <EntradasPage user={user} showToast={showToast} /> : null
      case 'usuarios':
        return isAdmin ? <UsuariosPage showToast={showToast} /> : null
      case 'historial':
        return <HistorialPage user={user} isAdmin={isAdmin} />
      default:
        return <SalidasPage user={user} showToast={showToast} />
    }
  }

  return (
    <div className="min-h-screen bg-dark text-gray-100 pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-dark-border px-5 py-3
        flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-olive-500/12 flex items-center justify-center text-olive-500">
            <IconFuel size={20} />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight">Combustible</div>
            <div className="text-[11px] text-gray-500">
              {user.name} · {isAdmin ? 'Admin' : 'Operario'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer p-2 rounded-lg transition-colors"
        >
          <IconLogout size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="max-w-[640px] mx-auto px-4 py-5">
        {renderView()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-dark-border
        flex justify-around py-2 pb-safe z-[100]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5
              px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors
              ${view === item.id ? 'text-olive-500' : 'text-gray-600 hover:text-gray-400'}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
