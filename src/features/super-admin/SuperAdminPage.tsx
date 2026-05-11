import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { Badge, Button, Input, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import { useNavigate } from 'react-router-dom'

export default function SuperAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { push } = useToast()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tenants', search],
    queryFn: () => api.admin.tenants({ search: search || undefined }),
    enabled: user?.role === 'super_admin',
  })

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
          <div className="muted text-sm">Painel de administração da plataforma</div>
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
              <th>Parceiros</th>
              <th>Usuários</th>
              <th>Criado em</th>
              <th>Status</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {data?.data.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.name}</td>
                <td>
                  <Badge tone={t.plan === 'trial' ? 'warning' : 'success'}>{t.plan}</Badge>
                </td>
                <td className="muted">{t.partnerCount ?? 0}</td>
                <td className="muted">{t.userCount ?? 0}</td>
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
