import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { I } from '../../components/icons'

export default function GeocodingFailuresBanner() {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const { data: logs = [] } = useQuery({
    queryKey: ['geocodingLogs'],
    queryFn: () => api.geocodingLogs.list(),
    staleTime: 60_000,
  })

  // Count unique partners with failures (geocodeStatus === failed, represented by hasLog or not)
  const failedCount = logs.length

  if (dismissed || failedCount === 0) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      marginBottom: 16,
      borderRadius: 10,
      background: 'color-mix(in srgb, var(--warning) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
    }}>
      {/* Icon */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        flexShrink: 0,
        background: 'color-mix(in srgb, var(--warning) 20%, transparent)',
        color: 'var(--warning)',
        display: 'grid',
        placeItems: 'center',
      }}>
        <I.pin size={15} />
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
          {failedCount} parceiro{failedCount !== 1 ? 's' : ''} com endereço não localizado
        </div>
        <div className="muted text-sm" style={{ marginTop: 2 }}>
          O geocoding falhou para {failedCount !== 1 ? 'esses parceiros' : 'esse parceiro'}. Verifique os endereços e corrija para que apareçam no mapa.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/geocoding-logs')}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--warning)',
            background: 'none',
            border: '1px solid color-mix(in srgb, var(--warning) 40%, transparent)',
            borderRadius: 6,
            padding: '5px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Ver detalhes
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            display: 'flex',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'var(--fg-muted)',
            opacity: 0.7,
          }}
          title="Fechar"
        >
          <I.close size={14} />
        </button>
      </div>
    </div>
  )
}
