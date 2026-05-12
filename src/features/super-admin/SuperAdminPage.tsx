import { useState } from 'react'
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { Badge, Button, Input, Modal, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import { useNavigate } from 'react-router-dom'
import type { ImportJob } from '../../types'

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  annual: 'Anual',
  trial: 'Trial',
}

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'done') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'processing') return 'info'
  return 'warning'
}

function TenantImportsModal({
  tenantId,
  tenantName,
  open,
  onClose,
}: {
  tenantId: string
  tenantName: string
  open: boolean
  onClose: () => void
}) {
  const { push } = useToast()
  const qc = useQueryClient()
  const [confirmJob, setConfirmJob] = useState<ImportJob | null>(null)

  const { data: imports, isLoading } = useQuery({
    queryKey: ['admin', 'imports', tenantId],
    queryFn: () => api.admin.tenantImports(tenantId),
    enabled: open,
  })

  const rollbackMutation = useMutation({
    mutationFn: (jobId: string) => api.admin.rollbackImport(tenantId, jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'imports', tenantId] })
      push({ title: 'Import revertido com sucesso', tone: 'success' })
      setConfirmJob(null)
    },
    onError: () => push({ title: 'Erro ao reverter import', tone: 'error' }),
  })

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Últimos imports — ${tenantName}`}
        desc="Os 10 imports mais recentes desta empresa. Revertendo, parceiros criados serão removidos e parceiros apagados serão restaurados. Atualizações não são revertidas."
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} h={44} />)}
          </div>
        ) : !imports?.length ? (
          <div className="muted text-sm" style={{ textAlign: 'center', padding: '24px 0' }}>
            Nenhuma importação encontrada.
          </div>
        ) : (
          <table className="table" style={{ marginTop: 4, fontSize: 13 }}>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Modo</th>
                <th>Criados</th>
                <th>Removidos</th>
                <th>Status</th>
                <th>Data</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {imports.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.fileName ?? '—'}
                    </div>
                    <div className="muted text-sm">{formatBytes(job.fileSize)}</div>
                  </td>
                  <td className="muted">{job.mode === 'full' ? 'Total' : 'Incremental'}</td>
                  <td>{job.created ?? '—'}</td>
                  <td>{job.removed ?? '—'}</td>
                  <td>
                    {job.rolledBackAt ? (
                      <Badge tone="warning">Revertido</Badge>
                    ) : (
                      <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                    )}
                  </td>
                  <td className="muted">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {job.status === 'done' && !job.rolledBackAt && (
                      <button
                        className="icon-btn"
                        title="Reverter import"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => setConfirmJob(job)}
                      >
                        <I.undo size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* Rollback confirmation */}
      <Modal
        open={!!confirmJob}
        onClose={() => setConfirmJob(null)}
        title="Confirmar reversão do import"
        desc={`Arquivo: ${confirmJob?.fileName ?? '—'} · ${confirmJob?.mode === 'full' ? 'Substituição total' : 'Incremental'}`}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmJob(null)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => confirmJob && rollbackMutation.mutate(confirmJob.id)}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? 'Revertendo…' : 'Sim, reverter'}
            </Button>
          </div>
        }
      >
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          borderRadius: 8, padding: '10px 12px',
        }}>
          <I.alert size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
          <div className="text-sm" style={{ color: 'var(--danger)' }}>
            <strong>{confirmJob?.created ?? 0} parceiros criados</strong> serão removidos e{' '}
            <strong>{confirmJob?.removed ?? 0} parceiros apagados</strong> serão restaurados.
            Atualizações de registros existentes <strong>não</strong> serão desfeitas.
          </div>
        </div>
      </Modal>
    </>
  )
}

export default function SuperAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { push } = useToast()
  const [search, setSearch] = useState('')
  const [importsModal, setImportsModal] = useState<{ id: string; name: string } | null>(null)

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
              <th style={{ width: 100 }} />
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
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button
                      className="icon-btn"
                      title="Ver imports"
                      onClick={() => setImportsModal({ id: t.id, name: t.name })}
                    >
                      <I.fileSheet size={14} />
                    </button>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {importsModal && (
        <TenantImportsModal
          tenantId={importsModal.id}
          tenantName={importsModal.name}
          open={!!importsModal}
          onClose={() => setImportsModal(null)}
        />
      )}
    </div>
  )
}
