import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { Button, Card, CardHeader, Segmented, Skeleton } from '../../components/ui'
import { I } from '../../components/icons'

const SPARK_STATS = [
  {
    label: 'Parceiros ativos',
    icon: <I.partners />,
    trend: 'up' as const,
    delta: '+12%',
    spark: [3, 5, 4, 6, 7, 5, 8, 7, 9, 11, 10, 12],
  },
  {
    label: 'Geocoding ok',
    icon: <I.pin />,
    trend: 'up' as const,
    delta: '+0.4%',
    spark: [8, 7, 8, 9, 8, 9, 10, 11, 10, 11, 12, 12],
  },
  {
    label: 'Imports este mês',
    icon: <I.upload />,
    trend: 'up' as const,
    delta: '+5',
    spark: [2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 8],
  },
  {
    label: 'Visualizações públicas',
    icon: <I.eye />,
    trend: 'down' as const,
    delta: '−3%',
    spark: [10, 12, 11, 9, 10, 8, 9, 7, 8, 7, 6, 7],
  },
]

const GEO_DATA = [
  { uf: 'SP', count: 412, pct: 33 },
  { uf: 'RJ', count: 248, pct: 20 },
  { uf: 'MG', count: 187, pct: 15 },
  { uf: 'RS', count: 124, pct: 10 },
  { uf: 'PR', count: 98, pct: 8 },
  { uf: 'BA', count: 76, pct: 6 },
  { uf: 'SC', count: 52, pct: 4 },
  { uf: 'PE', count: 28, pct: 2 },
]

const ACTIVITY = [
  { who: 'João Silva', action: 'importou 487 parceiros', when: 'há 12 min', icon: <I.upload />, tone: 'success' },
  { who: 'Sistema', action: 'geocodificou 124 endereços', when: 'há 32 min', icon: <I.pin />, tone: 'info' },
  { who: 'Maria Costa', action: 'editou parceiro "Clínica Vida"', when: 'há 1h', icon: <I.edit />, tone: undefined },
  { who: 'Sistema', action: 'embed gerado para mapa-publico', when: 'há 3h', icon: <I.code />, tone: 'info' },
  { who: 'Pedro Alves', action: 'convidado para a equipe', when: 'há 5h', icon: <I.users />, tone: undefined },
]

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values)
  return (
    <div className="spark">
      {values.map((v, i) => (
        <span
          key={i}
          className={v === max ? 'peak' : ''}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'visitante'

  const { data: summary, isLoading } = useQuery({
    queryKey: ['partners', 'summary'],
    queryFn: () => api.partners.list({ page: 1, limit: 1 }),
  })

  const total = summary?.total ?? 1247

  const stats = [
    { ...SPARK_STATS[0], value: total.toLocaleString('pt-BR') },
    { ...SPARK_STATS[1], value: '98.2%' },
    { ...SPARK_STATS[2], value: '23' },
    { ...SPARK_STATS[3], value: '8.4k' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <div className="eyebrow">Visão geral</div>
          <h1 className="h1">Bom dia, {firstName}</h1>
          <div className="muted text-sm">Workspace · 30 dias de trial restantes</div>
        </div>
        <div className="page-actions">
          <Button variant="outline" leftIcon={<I.download />} onClick={() => navigate('/export')}>
            Exportar
          </Button>
          <Button variant="primary" leftIcon={<I.upload />} onClick={() => navigate('/import')}>
            Importar planilha
          </Button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="stat-grid">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat">
                <Skeleton h={14} w="60%" />
                <Skeleton h={32} w="40%" r={6} />
                <Skeleton h={12} w="50%" />
                <Skeleton h={36} />
              </div>
            ))
          : stats.map((s, i) => (
              <div key={i} className="stat">
                <div className="stat-label">
                  {s.icon}
                  {s.label}
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-delta" data-trend={s.trend}>
                  {s.trend === 'up' ? <I.arrowUp /> : <I.arrowDown />}
                  {s.delta}
                  <span className="muted" style={{ marginLeft: 4 }}>
                    vs último mês
                  </span>
                </div>
                <Spark values={s.spark} />
              </div>
            ))}
      </div>

      {/* Two-column cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
        }}
        className="dash-cols"
      >
        <Card>
          <CardHeader
            title="Distribuição geográfica"
            desc="Parceiros por estado · top 8"
            action={
              <Segmented
                value="estado"
                onChange={() => {}}
                items={[
                  { value: 'estado', label: 'Estado' },
                  { value: 'cidade', label: 'Cidade' },
                  { value: 'tipo', label: 'Tipo' },
                ]}
              />
            }
          />
          <div style={{ padding: '20px 24px' }}>
            {GEO_DATA.map((r) => (
              <div
                key={r.uf}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 60px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                }}
              >
                <div className="mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {r.uf}
                </div>
                <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(r.pct / 33) * 100}%`,
                      background: 'linear-gradient(90deg, var(--accent), oklch(from var(--accent) calc(l - 0.1) c h))',
                    }}
                  />
                </div>
                <div className="mono text-xs" style={{ textAlign: 'right' }}>
                  {r.count.toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Atividade recente" />
          <div style={{ padding: '4px 8px' }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background:
                      a.tone === 'success'
                        ? 'var(--success-soft)'
                        : a.tone === 'info'
                        ? 'var(--info-soft)'
                        : 'var(--bg-subtle)',
                    color:
                      a.tone === 'success'
                        ? 'var(--success)'
                        : a.tone === 'info'
                        ? 'var(--info)'
                        : 'var(--fg-muted)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{a.who}</span>{' '}
                    <span className="muted">{a.action}</span>
                  </div>
                  <div className="muted text-xs" style={{ marginTop: 2 }}>
                    {a.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <style>{`@media (max-width: 960px) { .dash-cols { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
