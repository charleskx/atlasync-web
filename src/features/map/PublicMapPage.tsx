import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import L from 'leaflet'
import { api } from '../../lib/api'
import type { MapPin } from '../../types'
import { makeClusterGroup, makePinIcon } from './mapUtils'

export default function PublicMapPage() {
  const { token } = useParams<{ token: string }>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null)
  const [pins, setPins] = useState<MapPin[]>([])
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!token) return
    api.maps.publicPins(token)
      .then((p) => { setPins(p); setReady(true) })
      .catch(() => setError('Mapa não encontrado ou acesso negado.'))
  }, [token])

  // Init map once ready
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return
    mapInstance.current = L.map(mapRef.current, { center: [-15.7942, -47.8825], zoom: 5 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current)
    clusterGroup.current = makeClusterGroup()
    mapInstance.current.addLayer(clusterGroup.current)
  }, [ready])

  // Plot pins once map and data are both available
  useEffect(() => {
    if (!clusterGroup.current || !pins.length) return
    clusterGroup.current.clearLayers()

    const validPins = pins.filter((p) => p.lat && p.lng)
    validPins.forEach((pin) => {
      const marker = L.marker([Number(pin.lat), Number(pin.lng)], {
        icon: makePinIcon(pin.pinType?.color ?? '#6366f1'),
        title: pin.name,
      })
      clusterGroup.current!.addLayer(marker)
    })

    if (validPins.length > 0) {
      const bounds = L.latLngBounds(validPins.map((p) => [Number(p.lat), Number(p.lng)]))
      mapInstance.current?.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
    }
  }, [pins, ready])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🗺️</div>
          <div className="h2">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 20px', background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="sidebar-mark" style={{ width: 28, height: 28 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>atlasync</div>
          <div className="muted text-sm">{pins.length} parceiro{pins.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
