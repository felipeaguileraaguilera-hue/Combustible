import { useState, useEffect } from 'react'
import { Card, Button, Input, Modal, Badge, EmptyState, ConfirmDialog, Spinner } from '../components/UI'
import { IconPlus, IconTrash } from '../components/Icons'
import { getStaffMembers, deactivateStaffMember } from '../lib/database'
import { createStaffMember } from '../lib/auth'

export default function UsuariosPage({ showToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', phone: '', plates: '' })
  const [errors, setErrors] = useState({})
  const [creating, setCreating] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await getStaffMembers()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async () => {
    const e = {}
    if (!newUser.name.trim()) e.name = 'Requerido'
    const cleaned = newUser.phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 6) e.phone = 'Teléfono inválido'
    if (users.find((u) => u.phone === cleaned)) e.phone = 'Teléfono ya registrado'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setCreating(true)
    try {
      const plates = newUser.plates
        .split(',')
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean)

      await createStaffMember({
        name: newUser.name.trim(),
        phone: cleaned,
        plates,
      })

      setShowModal(false)
      setNewUser({ name: '', phone: '', plates: '' })
      setErrors({})
      showToast('Operario creado correctamente')
      loadUsers()
    } catch (err) {
      showToast(err.message || 'Error al crear usuario', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (userId) => {
    try {
      await deactivateStaffMember(userId)
      showToast('Usuario eliminado', 'info')
      loadUsers()
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error')
    }
    setShowConfirm(null)
  }

  if (loading) return <Spinner />

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight">Personal</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button small onClick={() => setShowModal(true)}>
          <IconPlus size={16} /> Nuevo
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 stagger-children">
        {users.map((u) => (
          <Card key={u.id} className="!p-3.5">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base
                  ${u.role === 'admin'
                    ? 'bg-olive-500/12 text-olive-500'
                    : 'bg-surface-alt text-gray-500'
                  }`}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[15px] font-semibold">{u.name}</div>
                  <div className="text-[13px] text-gray-500 font-mono">{u.phone}</div>
                  {u.plates && u.plates.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {u.plates.map((p) => (
                        <Badge key={p} color="gray">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={u.role === 'admin' ? 'olive' : 'blue'}>
                  {u.role === 'admin' ? 'Admin' : 'Operario'}
                </Badge>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => setShowConfirm(u)}
                    className="text-gray-600 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-1"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nuevo Operario */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setErrors({}) }} title="Nuevo Operario">
        <Input label="Nombre completo" placeholder="Juan García López"
          value={newUser.name} error={errors.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

        <Input label="Teléfono" type="tel" placeholder="612 345 678"
          value={newUser.phone} error={errors.phone}
          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />

        <Input label="Matrículas (separadas por coma)" placeholder="1234ABC, 5678DEF"
          value={newUser.plates}
          onChange={(e) => setNewUser({ ...newUser, plates: e.target.value })} />

        <p className="text-xs text-gray-500 mb-4 -mt-2">
          El operario accederá con su número de teléfono
        </p>

        <Button fullWidth onClick={handleCreate} loading={creating}>
          <IconPlus size={18} /> Crear Operario
        </Button>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleDelete(showConfirm.id)}
        title="Eliminar usuario"
        message={`¿Seguro que quieres eliminar a ${showConfirm?.name}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
