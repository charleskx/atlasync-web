import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { Badge, Button, ConfirmDialog, Empty, Field, Input, Modal, Select, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  employee: 'Colaborador',
}

const ROLE_TONES: Record<string, 'accent' | 'info' | undefined> = {
  owner: 'accent',
  admin: 'info',
  employee: undefined,
}

export default function TeamPage() {
  const qc = useQueryClient()
  const { push } = useToast()
  const { user } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('employee')

  const { data: members, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.team.list(),
  })

  const inviteMutation = useMutation({
    mutationFn: () => api.team.invite(inviteEmail, inviteName, inviteRole as 'admin' | 'employee'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      push({ title: 'Convite enviado', desc: `E-mail enviado para ${inviteEmail}`, tone: 'success' })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteName('')
      setInviteRole('employee')
    },
    onError: (err: Error) => push({ title: 'Erro ao convidar', desc: err.message, tone: 'error' }),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.team.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      push({ title: 'Membro removido', tone: 'success' })
    },
    onError: () => push({ title: 'Erro ao remover membro', tone: 'error' }),
  })

  const handleRemove = (id: string, name: string) => setConfirmTarget({ id, name })

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="h1">Equipe</h1>
          <div className="muted text-sm">
            {members?.length ?? 0} membro{members?.length !== 1 ? 's' : ''} no workspace
          </div>
        </div>
        <div className="page-actions">
          <Button variant="primary" leftIcon={<I.plus size={14} />} onClick={() => setInviteOpen(true)}>
            Convidar membro
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} h={56} />)}
        </div>
      ) : !members?.length ? (
        <Empty
          icon={<I.users size={28} />}
          title="Nenhum membro"
          desc="Convide colaboradores para o seu workspace"
          action={<Button variant="primary" onClick={() => setInviteOpen(true)}>Convidar membro</Button>}
        />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Membro</th>
              <th>E-mail</th>
              <th>Função</th>
              <th>Status</th>
              <th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const initials = m.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              const isSelf = m.id === user?.id
              const isOwner = m.role === 'owner'

              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--bg-elev)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {m.name}
                        {isSelf && <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>(você)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="muted">{m.email}</td>
                  <td>
                    <Badge tone={ROLE_TONES[m.role]}>{ROLE_LABELS[m.role] ?? m.role}</Badge>
                  </td>
                  <td>
                    <Badge tone={m.emailVerified ? 'success' : 'warning'} dot>
                      {m.emailVerified ? 'Ativo' : 'Pendente'}
                    </Badge>
                  </td>
                  <td>
                    {!isSelf && !isOwner && (
                      <button
                        className="icon-btn"
                        onClick={() => handleRemove(m.id, m.name)}
                        title="Remover membro"
                        style={{ color: 'var(--danger)' }}
                      >
                        <I.trash size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={`Remover "${confirmTarget?.name}" da equipe?`}
        desc="O membro perderá o acesso ao workspace."
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmTarget) removeMutation.mutate(confirmTarget.id)
          setConfirmTarget(null)
        }}
        onCancel={() => setConfirmTarget(null)}
      />

      <Modal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteEmail(''); setInviteName(''); setInviteRole('employee') }}
        title="Convidar membro"
        desc="O convite será enviado por e-mail"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!inviteEmail || !inviteName || inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
            >
              {inviteMutation.isPending ? 'Enviando…' : 'Enviar convite'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nome">
            <Input
              placeholder="Nome do colaborador"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="E-mail">
            <Input
              type="email"
              placeholder="colaborador@empresa.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </Field>
          <Field label="Função">
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="employee">Colaborador</option>
              <option value="admin">Administrador</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
