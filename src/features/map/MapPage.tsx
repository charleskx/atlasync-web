import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import L from 'leaflet'
import { api } from '../../lib/api'
import { Badge, Card, Select } from '../../components/ui'
import { I } from '../../components/icons'
import type { MapPin } from '../../types'
import { makeClusterGroup, makePinIcon } from './mapUtils'

interface InfoPopupProps {
  pin: MapPin
  onClose: () => void
}

function InfoPopup({ pin, onClose }: InfoPopupProps) {
  return (
    <Card
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 280,
        zIndex: 1000,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontWeight: 600 }}>{pin.name}</div>
          <button className="icon-btn" onClick={onClose}><I.x size={14} /></button>
        </div>
        {pin.address && <div className="muted text-sm">{pin.address}</div>}
        {pin.city && (
          <div className="muted text-sm">{[pin.city, pin.state].filter(Boolean).join(' / ')}</div>
        )}
        {pin.pinType && (
          <Badge style={{ marginTop: 4, background: (pin.pinType.color ?? '#888') + '22', color: pin.pinType.color ?? undefined }}>
            {pin.pinType.name}
          </Badge>
        )}
      </div>
    </Card>
  )
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [selectedMapId, setSelectedMapId] = useState<string>('')

  const { data: maps } = useQuery({
    queryKey: ['maps'],
    queryFn: () => api.maps.list(),
  })

  useEffect(() => {
    if (maps?.length && !selectedMapId) setSelectedMapId(maps[0].id)
  }, [maps, selectedMapId])

  const { data: pins } = useQuery({
    queryKey: ['mapPins', selectedMapId],
    queryFn: () => api.maps.pins(selectedMapId),
    enabled: !!selectedMapId,
  })

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const map = L.map(mapRef.current, { center: [-15.7942, -47.8825], zoom: 5 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    const cluster = makeClusterGroup()
    map.addLayer(cluster)
    mapInstance.current = map
    clusterGroup.current = cluster
    setMapReady(true)

    return () => {
      map.remove()
      mapInstance.current = null
      clusterGroup.current = null
      setMapReady(false)
    }
  }, [])

  // Update markers when pins change — waits for map to be ready
  useEffect(() => {
    if (!mapReady || !clusterGroup.current) return
    clusterGroup.current.clearLayers()
    setSelectedPin(null)
    if (!pins?.length) return

    const validPins = pins.filter((p) => p.lat && p.lng)
    validPins.forEach((pin) => {
      const marker = L.marker([Number(pin.lat), Number(pin.lng)], {
        icon: makePinIcon(pin.pinType?.color ?? '#6366f1'),
        title: pin.name,
      })
      marker.on('click', () => setSelectedPin(pin))
      clusterGroup.current!.addLayer(marker)
    })

    if (validPins.length > 0) {
      const bounds = L.latLngBounds(validPins.map((p) => [Number(p.lat), Number(p.lng)]))
      mapInstance.current?.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
    }
  }, [pins, mapReady])

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="h1">Mapa interno</h1>
          <div className="muted text-sm">{pins?.length ?? 0} parceiro{pins?.length !== 1 ? 's' : ''} no mapa</div>
        </div>
        {maps && maps.length > 1 && (
          <div className="page-actions">
            <Select value={selectedMapId} onChange={(e) => setSelectedMapId(e.target.value)} style={{ width: 200 }}>
              {maps.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 500, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        {selectedPin && <InfoPopup pin={selectedPin} onClose={() => setSelectedPin(null)} />}
      </div>
    </div>
  )
}
