import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Partner } from '../../types'
import { Button, Field, Input, Select, Sheet, useToast } from '../../components/ui'

interface PartnerSheetProps {
  open: boolean
  onClose: () => void
  partner?: Partner | null
}

const BLANK = {
  name: '',
  address: '',
  pinTypeId: '',
  visibility: 'internal' as 'public' | 'internal',
}

export default function PartnerSheet({ open, onClose, partner }: PartnerSheetProps) {
  const qc = useQueryClient()
  const { push } = useToast()
  const [form, setForm] = useState(BLANK)

  const { data: pinTypes } = useQuery({
    queryKey: ['pinTypes'],
    queryFn: () => api.pinTypes.list(),
    enabled: open,
  })

  useEffect(() => {
    if (partner) {
      setForm({
        name: partner.name,
        address: partner.address ?? '',
        pinTypeId: partner.pinTypeId ?? '',
        visibility: partner.visibility ?? 'internal',
      })
    } else {
      setForm(BLANK)
    }
  }, [partner, open])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        name: data.name,
        address: data.address,
        pinTypeId: data.pinTypeId || undefined,
        visibility: data.visibility,
      }
      return partner ? api.partners.update(partner.id, payload) : api.partners.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partners'] })
      push({ title: partner ? 'Parceiro atualizado' : 'Parceiro criado', tone: 'success' })
      onClose()
    },
    onError: (err: Error) => {
      push({ title: 'Erro ao salvar', desc: err.message, tone: 'error' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={partner ? 'Editar parceiro' : 'Novo parceiro'}
      subtitle={partner ? `ID: ${partner.id}` : 'Preencha os dados do parceiro'}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={mutation.isPending || !form.name}>
            {mutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={set('name')} placeholder="Nome do parceiro" required />
        </Field>

        <Field label="Endereço" hint="Endereço completo para geocodificação">
          <Input value={form.address} onChange={set('address')} placeholder="Rua, número, cidade, estado" />
        </Field>

        <Field label="Tipo de pin">
          <Select value={form.pinTypeId} onChange={set('pinTypeId')}>
            <option value="">Selecione um tipo</option>
            {pinTypes?.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Visibilidade">
          <Select value={form.visibility} onChange={set('visibility')}>
            <option value="internal">Interno</option>
            <option value="public">Público</option>
          </Select>
        </Field>
      </form>
    </Sheet>
  )
}
