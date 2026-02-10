import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import { ArrowLeftIcon, PlayIcon, ChartBarIcon, CogIcon } from '../components/Icons'
import 'leaflet/dist/leaflet.css'

// Fix for leaflet marker icons
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Componente para agregar nudos con clic
function NudoCreator({ onNudoAgregado }) {
  useMapEvents({
    click(e) {
      onNudoAgregado({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }
  })
  return null
}

const nudosEjemplo = [
  { id: 1, codigo: 'N-01', lat: -12.0464, lng: -77.0428, tipo: 'reservorio', elevacion: 150, demanda: 0 },
  { id: 2, codigo: 'N-02', lat: -12.0470, lng: -77.0430, tipo: 'union', elevacion: 145, demanda: 5 },
  { id: 3, codigo: 'N-03', lat: -12.0475, lng: -77.0435, tipo: 'union', elevacion: 142, demanda: 8 },
  { id: 4, codigo: 'N-04', lat: -12.0480, lng: -77.0440, tipo: 'consumo', elevacion: 140, demanda: 12 },
]

const tramosEjemplo = [
  { id: 1, origen: [nudosEjemplo[0].lat, nudosEjemplo[0].lng], destino: [nudosEjemplo[1].lat, nudosEjemplo[1].lng], diametro: 110 },
  { id: 2, origen: [nudosEjemplo[1].lat, nudosEjemplo[1].lng], destino: [nudosEjemplo[2].lat, nudosEjemplo[2].lng], diametro: 90 },
  { id: 3, origen: [nudosEjemplo[2].lat, nudosEjemplo[2].lng], destino: [nudosEjemplo[3].lat, nudosEjemplo[3].lng], diametro: 75 },
]

export default function EditorRed() {
  const { id } = useParams()
  const [nudos, setNudos] = useState(nudosEjemplo)
  const [tramos, setTramos] = useState(tramosEjemplo)
  const [modoEdicion, setModoEdicion] = useState('nudo') // 'nudo' | 'tramo' | 'seleccionar'

  const agregarNudo = (coordenadas) => {
    const nuevoNudo = {
      id: nudos.length + 1,
      codigo: `N-${String(nudos.length + 1).padStart(2, '0')}`,
      lat: coordenadas.lat,
      lng: coordenadas.lng,
      tipo: 'union',
      elevacion: 0,
      demanda: 0
    }
    setNudos([...nudos, nuevoNudo])
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/proyectos" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Red</h1>
            <p className="text-gray-500">Proyecto: {id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/proyectos/${id}/calcular`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            <PlayIcon className="w-4 h-4" />
            Calcular
          </Link>
          <Link
            to={`/proyectos/${id}/optimizar`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600"
          >
            <CogIcon className="w-4 h-4" />
            Optimizar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Panel Lateral */}
        <div className="lg:col-span-1 space-y-4">
          {/* Herramientas */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Herramientas</h3>
            <div className="space-y-2">
              {[
                { id: 'nudo', label: 'Agregar Nudo', icon: '+' },
                { id: 'tramo', label: 'Conectar Tramo', icon: '↔' },
                { id: 'seleccionar', label: 'Seleccionar', icon: '↖' },
              ].each((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setModoEdicion(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    modoEdicion === tool.id
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded">
                    {tool.icon}
                  </span>
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Nudos */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Nudos ({nudos.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nudos.map((nudo) => (
                <div
                  key={nudo.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{nudo.codigo}</p>
                    <p className="text-xs text-gray-500">{nudo.tipo}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{nudo.lat.toFixed(4)}, {nudo.lng.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Tramos */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Tramos ({tramos.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tramos.map((tramo) => (
                <div
                  key={tramo.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">T-{String(tramo.id).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">{tramo.diametro}mm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-3">
          <div className="h-[calc(100vh-250px)] bg-white rounded-xl shadow-sm overflow-hidden">
            <MapContainer
              center={[-12.0464, -77.0428]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <NudoCreator onNudoAgregado={agregarNudo} />
              
              {/* Marcadores de nudos */}
              {nudos.map((nudo) => (
                <Marker
                  key={nudo.id}
                  position={[nudo.lat, nudo.lng]}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">{nudo.codigo}</p>
                      <p className="text-sm">Tipo: {nudo.tipo}</p>
                      <p className="text-sm">Elevación: {nudo.elevacion}m</p>
                      <p className="text-sm">Demanda: {nudo.demanda}l/s</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Líneas de tramos */}
              {tramos.map((tramo) => (
                <Polyline
                  key={tramo.id}
                  positions={[tramo.origen, tramo.destino]}
                  color="#0ea5e9"
                  weight={tramo.diametro / 10}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
