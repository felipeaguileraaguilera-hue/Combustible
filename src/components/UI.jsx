import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI REUTILIZABLES
// ═══════════════════════════════════════════════════════════════

// ─── Input ───
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-[13px] text-gray-400 mb-1.5 font-medium">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 bg-dark border rounded-lg text-[15px] text-gray-100
          outline-none transition-colors font-sans
          ${error ? 'border-red-500' : 'border-dark-border focus:border-olive-500'}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── Select ───
export function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-[13px] text-gray-400 mb-1.5 font-medium">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 bg-dark border rounded-lg text-[15px] text-gray-100
          outline-none transition-colors font-sans
          ${error ? 'border-red-500' : 'border-dark-border focus:border-olive-500'}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── Button ───
const buttonVariants = {
  primary: 'bg-olive-500 hover:bg-olive-400 text-white',
  secondary: 'bg-surface-alt hover:bg-dark-border-light text-gray-200 border border-dark-border',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400',
  ghost: 'bg-transparent hover:bg-surface-alt text-gray-400',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  small = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        ${small ? 'px-4 py-2 text-[13px]' : 'px-6 py-3 text-[15px]'}
        rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${buttonVariants[variant]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ─── Card ───
export function Card({ children, title, icon, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-dark-border rounded-xl p-5 ${className}`}
      {...props}
    >
      {title && (
        <div className="flex items-center gap-2.5 mb-4">
          {icon && <span className="text-olive-500">{icon}</span>}
          <h3 className="text-base font-semibold text-gray-100">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Badge ───
const badgeColors = {
  olive: 'text-olive-400 bg-olive-500/15',
  red: 'text-red-400 bg-red-500/15',
  blue: 'text-blue-400 bg-blue-500/15',
  yellow: 'text-yellow-400 bg-yellow-500/15',
  gray: 'text-gray-400 bg-gray-500/15',
}

export function Badge({ children, color = 'olive', className = '' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColors[color]} ${className}`}>
      {children}
    </span>
  )
}

// ─── Modal ───
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-dark-border rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Toast ───
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'border-olive-500 text-olive-400',
    error: 'border-red-500 text-red-400',
    info: 'border-blue-500 text-blue-400',
  }

  return (
    <div className={`fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl bg-surface border
      font-semibold text-sm shadow-2xl animate-slide-in ${colors[type]}`}>
      {message}
    </div>
  )
}

// ─── EmptyState ───
export function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-10 text-gray-600">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <div className="text-[15px] font-semibold text-gray-500 mb-1">{title}</div>
      <div className="text-[13px]">{description}</div>
    </div>
  )
}

// ─── Stat Card ───
export function StatCard({ label, value, unit, color = 'olive', className = '' }) {
  const colorMap = {
    olive: 'bg-olive-500/10 border-olive-700/40 text-olive-300',
    yellow: 'bg-yellow-500/10 border-yellow-700/40 text-yellow-300',
    red: 'bg-red-500/10 border-red-700/40 text-red-300',
    blue: 'bg-blue-500/10 border-blue-700/40 text-blue-300',
  }
  const valueColor = {
    olive: 'text-olive-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }

  return (
    <div className={`border rounded-xl p-4 ${colorMap[color]} ${className}`}>
      <div className={`text-xs font-semibold mb-1 ${valueColor[color]}`}>{label}</div>
      <div className={`text-2xl font-extrabold font-mono ${valueColor[color]}`}>{value}</div>
      {unit && <div className="text-[11px] text-gray-500 mt-0.5">{unit}</div>}
    </div>
  )
}

// ─── Loading Spinner ───
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex justify-center py-8">
      <svg className={`animate-spin ${sizes[size]} text-olive-500`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

// ─── Confirm Dialog ───
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-surface border border-dark-border rounded-2xl p-6 w-full max-w-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-5">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  )
}
