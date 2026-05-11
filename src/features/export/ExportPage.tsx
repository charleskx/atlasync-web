import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, CardHeader, Checkbox, Field, Select, Skeleton, useToast } from '../../components/ui'
import { I } from '../../components/icons'

export default function ExportPage() {
  const { push } = useToast()
  const [format, setFormat] = useState('xlsx')
  const [loading, setLoading] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ['exportColumns'],
    queryFn: async () => {
      const cols = await api.export.getColumns()
      setSelectedColumns(cols)
      return cols
    },
  })

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    )
  }

  const handleExport = async () => {
    if (!selectedColumns.length) {
      push({ title: 'Selecione pelo menos uma coluna', tone: 'error' })
      return
    }
    setLoading(true)
    try {
      const blob = await api.export.download(selectedColumns, format as 'xlsx' | 'csv')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `parceiros.${format}`
      a.click()
      URL.revokeObjectURL(url)
      push({ title: 'Exportação concluída', tone: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao exportar'
      push({ title: 'Erro na exportação', desc: msg, tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="h1">Exportar dados</h1>
          <div className="muted text-sm">Baixe todos os seus parceiros em diferentes formatos</div>
        </div>
      </div>

      <Card style={{ maxWidth: 520 }}>
        <CardHeader
          title="Exportar parceiros"
          desc="Selecione as colunas que deseja incluir na exportação"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
          <Field label="Formato do arquivo">
            <Select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </Select>
          </Field>

          <Field label="Colunas">
            {columnsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...Array(4)].map((_, i) => <Skeleton key={i} h={24} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {columns?.map((col) => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Checkbox
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                    />
                    <span className="text-sm">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </Field>

          <Button
            variant="primary"
            leftIcon={<I.download size={14} />}
            onClick={handleExport}
            disabled={loading || !selectedColumns.length}
          >
            {loading ? 'Exportando…' : `Exportar como ${format.toUpperCase()}`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
