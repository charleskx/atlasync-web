import L from 'leaflet'
import 'leaflet.markercluster'

/** SVG pin shape (teardrop) com a cor passada */
export function makePinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

/** Cria um MarkerClusterGroup com estilo customizado */
export function makeClusterGroup() {
  return L.markerClusterGroup({
    maxClusterRadius: 50,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount()
      const size = count < 10 ? 36 : count < 100 ? 44 : 52
      return L.divIcon({
        className: '',
        html: `
          <div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:var(--accent,#6366f1);
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.3);
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:${size < 44 ? 13 : 15}px;
            font-family:var(--font-sans,sans-serif);
          ">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
    },
  })
}
