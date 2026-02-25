import { useState, useEffect } from 'react'
import { Card, StatCard, EmptyState, Spinner } from '../components/UI'
import { IconList } from '../components/Icons'
import { getStats, getExits, subscribeToExits, subscribeToEntries } from '../lib/database'
import { formatDateTime, formatVolume } from '../lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentExits, setRecentExits] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [statsData, exitsData] = await Promise.all([
        getStats(),
        getExits({ limit: 10 }),
      ])
      setStats(statsData)
      setRecentExits(exitsData.data || [])
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Suscripción en tiempo real
    const exitsSub = subscribeToExits(() => loadData())
    const entriesSub = subscribeToEntries(() => loadData())

    return () => {
      exitsSub.unsubscribe()
      entriesSub.unsubscribe()
    }
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="animate-fade-in">
      <h2 className="text-[22px] font-extrabold tracking-tight mb-5">
        Panel de Control
      </h2>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard
            label="Diesel"
            value={formatVolume(stats.diesel.stock)}
            unit="litros disponibles"
            color="olive"
          />
          <StatCard
            label="Diesel Agrícola"
            value={formatVolume(stats.agricola.stock)}
            unit="litros disponibles"
            color="yellow"
          />
          <StatCard
            label="Total Entradas"
            value={`+${formatVolume(stats.totalIn)}L`}
            color="olive"
          />
          <StatCard
            label="Total Salidas"
            value={`-${formatVolume(stats.totalOut)}L`}
            color="red"
          />
        </div>
      )}

      {/* Recent Exits */}
      <Card title="Últimos Repostajes" icon={<IconList size={18} />}>
        {recentExits.length === 0 ? (
          <EmptyState
            icon="⛽"
            title="Sin movimientos"
            description="Aún no se han registrado salidas de combustible"
          />
        ) : (
          <div className="flex flex-col gap-2 stagger-children">
            {recentExits.map((ex) => (
              <div
                key={ex.id}
                className="flex justify-between items-center p-3 bg-dark rounded-lg"
              >
                <div>
                  <div className="text-sm font-semibold">{ex.user_name}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(ex.date)} · {ex.product} · {ex.refuel_type}
                    {ex.plate ? ` · ${ex.plate}` : ''}
                  </div>
                </div>
                <div className="text-base font-bold text-red-400 font-mono">
                  -{ex.volume}L
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
