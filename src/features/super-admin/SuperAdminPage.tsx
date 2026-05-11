import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { Badge, Button, Input, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import { useNavigate } from 'react-router-dom'

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  annual: 'Anual',
  trial: 'Trial',
}

export default function SuperAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { push } = useToast()
  const [search, setSearch] = useState('')

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => api.admin.tenants(),
    enabled: user?.role === 'super_admin',
  })

  const filtered = useMemo(() => {
    if (!tenants) return []
    if (!search) return tenants
    const q = search.toLowerCase()
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q))
  }, [tenants, search])

  const blockMutation = useMutation({
    mutationFn: (id: string) => api.admin.blockTenant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      push({ title: 'Empresa bloqueada', tone: 'success' })
    },
    onError: () => push({ title: 'Erro ao bloquear', tone: 'error' }),
  })

  const unblockMutation = useMutation({
    mutationFn: (id: string) => api.admin.unblockTenant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      push({ title: 'Empresa desbloqueada', tone: 'success' })
    },
    onError: () => push({ title: 'Erro ao desbloquear', tone: 'error' }),
  })

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <I.shield size={40} style={{ color: 'var(--danger)', marginBottom: 16 }} />
        <div className="h2">Acesso negado</div>
        <div className="muted text-sm" style={{ marginTop: 8 }}>Você não tem permissão para acessar esta área.</div>
        <Button variant="primary" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="h1">Super Admin</h1>
          <div className="muted text-sm">{tenants?.length ?? 0} empresas na plataforma</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          icon={<I.search size={14} />}
          placeholder="Buscar empresas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} h={44} />)}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Plano</th>
              <th>Status assinatura</th>
              <th>Criado em</th>
              <th>Status</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  {t.email && <div className="muted text-sm">{t.email}</div>}
                </td>
                <td>
                  <Badge>{PLAN_LABELS[t.planType ?? ''] ?? t.planType ?? '—'}</Badge>
                </td>
                <td>
                  <Badge
                    tone={
                      t.subscriptionStatus === 'active' ? 'success'
                        : t.subscriptionStatus === 'trialing' ? 'warning'
                          : 'danger'
                    }
                  >
                    {t.subscriptionStatus ?? '—'}
                  </Badge>
                </td>
                <td className="muted">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Badge tone={t.active ? 'success' : 'danger'} dot>
                    {t.active ? 'Ativo' : 'Bloqueado'}
                  </Badge>
                </td>
                <td>
                  {t.active ? (
                    <button
                      className="icon-btn"
                      title="Bloquear"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => blockMutation.mutate(t.id)}
                    >
                      <I.shield size={14} />
                    </button>
                  ) : (
                    <button
                      className="icon-btn"
                      title="Desbloquear"
                      onClick={() => unblockMutation.mutate(t.id)}
                    >
                      <I.check size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
