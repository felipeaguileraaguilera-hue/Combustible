import { useState, useEffect, useCallback } from 'react'
import { Card, Badge, EmptyState, Spinner } from '../components/UI'
import { getExits } from '../lib/database'
import { formatDateTime, formatVolume } from '../lib/utils'

export default function HistorialPage({ user, isAdmin }) {
  const [exits, setExits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [total, setTotal] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        limit: 100,
        product: productFilter,
        refuelType: filter,
      }
      if (!isAdmin) params.userId = user.id

      const { data, count } = await getExits(params)
      setExits(data || [])
      setTotal(count || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, productFilter, isAdmin, user.id])

  useEffect(() => { loadData() }, [loadData])

  const totalVolume = exits.reduce((s, e) => s + parseFloat(e.volume), 0)

  const TypeFilter = ({ items, active, setActive, color = 'olive' }) => (
    <div className="flex gap-2 flex-wrap">
      {items.map((f) => (
        <button
          key={f.value}
          onClick={() => setActive(f.value)}
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all cursor-pointer
            ${active === f.value
              ? color === 'olive'
                ? 'border-olive-500 bg-olive-500/10 text-olive-400'
                : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
              : 'border-dark-border bg-transparent text-gray-600 hover:border-dark-border-light'
            }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="animate-fade-in">
      <h2 className="text-[22px] font-extrabold tracking-tight mb-1">Historial</h2>
      <p className="text-[13px] text-gray-500 mb-4">
        {isAdmin ? 'Todos los movimientos' : 'Tus repostajes'}
      </p>

      {/* Filters */}
      <div className="mb-4">
        <TypeFilter
          items={[
            { value: 'all', label: 'Todos' },
            { value: 'Vehículo', label: 'Vehículo' },
            { value: 'Garrafa', label: 'Garrafa' },
            { value: 'Depósito', label: 'Depósito' },
          ]}
          active={filter}
          setActive={setFilter}
        />
      </div>
      <div className="mb-5">
        <TypeFilter
          items={[
            { value: 'all', label: 'Ambos' },
            { value: 'Diesel', label: 'Diesel' },
            { value: 'Diesel Agrícola', label: 'Diesel Agrícola' },
          ]}
          active={productFilter}
          setActive={setProductFilter}
          color="yellow"
        />
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center p-3 bg-surface border border-dark-border rounded-xl mb-4">
        <span className="text-[13px] text-gray-500">{exits.length} registros</span>
        <span className="text-base font-bold font-mono text-red-400">
          {formatVolume(totalVolume)}L
        </span>
      </div>

      {/* List */}
      {loading ? (
        <Spinner />
      ) : exits.length === 0 ? (
        <EmptyState icon="📋" title="Sin registros" description="No hay repostajes que coincidan con los filtros" />
      ) : (
        <div className="flex flex-col gap-2 stagger-children">
          {exits.map((ex) => (
            <Card key={ex.id} className="!p-3.5">
              <div className="flex justify-between items-start">
                <div>
                  {isAdmin && (
                    <div className="text-sm font-semibold mb-0.5">{ex.user_name}</div>
                  )}
                  <div className="text-[13px] text-gray-500">
                    {formatDateTime(ex.date)}
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge color={ex.product === 'Diesel' ? 'olive' : 'yellow'}>
                      {ex.product}
                    </Badge>
                    <Badge color="blue">{ex.refuel_type}</Badge>
                    {ex.plate && <Badge color="gray">{ex.plate}</Badge>}
                  </div>
                </div>
                <div className="text-lg font-bold text-red-400 font-mono">
                  {ex.volume}L
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
