import { useCallback, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Badge, Button, Card, CardHeader, Empty, Progress, Select, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'

function formatBytes(bytes: number) {
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

export default function ImportPage() {
  const qc = useQueryClient()
  const { push } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mode, setMode] = useState<'full' | 'incremental'>('full')

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['importJobs'],
    queryFn: () => api.import.list(),
    refetchInterval: 5000,
  })

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        push({ title: 'Formato inválido', desc: 'Use arquivos .xlsx, .xls ou .csv', tone: 'error' })
        return
      }
      setUploading(true)
      setUploadProgress(0)
      try {
        const result = await api.import.upload(file, mode, (pct) => setUploadProgress(pct))
        const { jobId } = result

        qc.invalidateQueries({ queryKey: ['importJobs'] })

        const url = api.import.progressUrl(jobId)
        const es = new EventSource(url)
        es.onmessage = (e) => {
          const data = JSON.parse(e.data)
          if (data.status === 'done' || data.status === 'failed') {
            es.close()
            qc.invalidateQueries({ queryKey: ['importJobs'] })
            push({
              title: data.status === 'done' ? 'Importação concluída' : 'Importação falhou',
              desc: data.status === 'done'
                ? `${data.created ?? 0} criados · ${data.updated ?? 0} atualizados`
                : undefined,
              tone: data.status === 'done' ? 'success' : 'error',
            })
          }
        }
        es.onerror = () => {
          es.close()
          qc.invalidateQueries({ queryKey: ['importJobs'] })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao importar'
        push({ title: 'Erro', desc: msg, tone: 'error' })
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [push, qc, mode],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="h1">Importar planilha</h1>
          <div className="muted text-sm">Importe parceiros em massa a partir de arquivos Excel ou CSV</div>
        </div>
        <div className="page-actions">
          <Select value={mode} onChange={(e) => setMode(e.target.value as 'full' | 'incremental')} style={{ width: 160 }}>
            <option value="full">Substituição total</option>
            <option value="incremental">Incremental</option>
          </Select>
        </div>
      </div>

      <Card>
        <div
          className={`dropzone${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={onInputChange}
          />
          {uploading ? (
            <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
              <div style={{ marginBottom: 12, color: 'var(--accent)' }}><I.upload size={32} /></div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Enviando…</div>
              <Progress value={uploadProgress} />
              <div className="muted text-sm" style={{ marginTop: 8 }}>{uploadProgress}%</div>
            </div>
          ) : (
            <>
              <div style={{ color: 'var(--fg-muted)', marginBottom: 12 }}><I.upload size={32} /></div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                Arraste o arquivo aqui ou clique para selecionar
              </div>
              <div className="muted text-sm">Suporta .xlsx, .xls e .csv · Máx. 10 MB</div>
              <Button variant="outline" size="sm" style={{ marginTop: 16 }}>
                Selecionar arquivo
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Histórico de importações"
          desc="Acompanhe o status das importações anteriores"
        />
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {[...Array(3)].map((_, i) => <Skeleton key={i} h={44} />)}
          </div>
        ) : !jobs?.length ? (
          <Empty
            icon={<I.fileSheet size={28} />}
            title="Nenhuma importação ainda"
            desc="Faça upload de um arquivo para começar"
          />
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tamanho</th>
                <th>Modo</th>
                <th>Criados</th>
                <th>Atualizados</th>
                <th>Erros</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td style={{ fontWeight: 500 }}>{j.fileName}</td>
                  <td className="muted">{formatBytes(j.fileSize)}</td>
                  <td className="muted">{j.mode === 'full' ? 'Total' : 'Incremental'}</td>
                  <td>{j.created ?? '—'}</td>
                  <td>{j.updated ?? '—'}</td>
                  <td style={{ color: j.failed ? 'var(--danger)' : 'inherit' }}>
                    {j.failed ?? '—'}
                  </td>
                  <td>
                    <Badge tone={statusTone(j.status)}>{j.status}</Badge>
                  </td>
                  <td className="muted">
                    {new Date(j.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
