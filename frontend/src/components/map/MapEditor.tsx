import { useEffect, useState, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ImageOverlay, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Nudo, Tramo } from "@/types/models"
import { PlanoManager, PlanoConfig } from "./PlanoManager"
import { CRPHelper } from "./CRPHelper"
import { ProfileGraphModal, ProfileDataPoint } from "./ProfileGraphModal"
import { Button } from "@/components/ui/button"
import { LineChart } from "lucide-react"
import { useTheme } from "next-themes"
import { useProjectStore } from "@/store/project-store"

// Componente interno para manejar el cambio de tiles según el tema
function ThemeAwareTileLayer() {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const currentTheme = theme === 'system' ? systemTheme : theme
    const isDark = currentTheme === 'dark'

    return (
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={isDark
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
        />
    )
}

// Configurar iconos de Leaflet (fix next.js issue)
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Icon for calibration corners
const cornerIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: '<div class="w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md hover:scale-125 transition-transform cursor-move"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
})

L.Marker.prototype.options.icon = defaultIcon

// Custom Icons Definition using pure CSS/HTML markers for performance and flexibility
const createCustomIcon = (type: string, code: string, isSelected: boolean) => {
    let iconHtml = ''
    let containerClass = ''
    let labelClass = "absolute left-6 top-0 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold border border-gray-200 shadow-sm whitespace-nowrap dark:bg-black/90 dark:border-gray-800 pointer-events-none"

    switch (type) {
        case 'reservorio':
            // Square Blue with R
            containerClass = 'bg-blue-600 rounded-sm' // Square
            iconHtml = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-[10px]">R</div>`
            break
        case 'camara_rompe_presion':
            // Small Yellow Square
            containerClass = 'bg-yellow-500 rounded-sm'
            iconHtml = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-[8px]">CRP</div>`
            break
        default: // union/consumo
            // Small Circle or Dot
            containerClass = 'bg-white border-2 border-black dark:border-white rounded-full'
            iconHtml = ``
            // Label is bigger for nodes
            labelClass = "absolute left-4 -top-2 text-sm font-bold text-black drop-shadow-md bg-white/60 px-1 rounded dark:text-white dark:bg-black/60 pointer-events-none"
            break
    }

    const sizeClass = type === 'reservorio' || type === 'camara_rompe_presion' ? 'w-6 h-6' : 'w-3 h-3'
    const ringClass = isSelected ? 'ring-4 ring-primary/40' : ''

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `
            <div class="relative group">
                <div class="${sizeClass} ${containerClass} flex items-center justify-center shadow-md transform transition-transform hover:scale-110 ${ringClass}">
                    ${iconHtml}
                </div>
                <div class="${labelClass}">
                    ${code}
                </div>
            </div>
        `,
        iconSize: [24, 24], // Base size, content flows out
        iconAnchor: [12, 12], // Centered
    })
}

interface MapEditorProps {
    nudos: Nudo[]
    tramos: Tramo[]
    proyectoId: string
    initialPlanoConfig?: PlanoConfig | null
    onNudoClick?: (nudo: Nudo) => void
    onNudoDragEnd?: (id: string, lat: number, lng: number) => void
    onMapClick?: (lat: number, lng: number) => void
    onCreatePipe?: (origenId: string, destinoId: string) => void
    center?: [number, number]
    zoom?: number
}

// Componente para ajustar el mapa a los límites de los nudos
function MapAdjuster({ nudos }: { nudos: Nudo[] }) {
    const map = useMap()

    useEffect(() => {
        if (nudos.length > 0) {
            const bounds = L.latLngBounds(nudos.map(n => [n.latitud || 0, n.longitud || 0]))
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [nudos, map])

    return null
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMap().on('click', (e) => {
        onClick(e.latlng.lat, e.latlng.lng)
    })
    return null
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null, zoom?: number }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 18, { duration: 1.5 })
        }
    }, [center, map, zoom])
    return null
}


// Helper: Calculate Static Pressure
function calculateStaticPressures(nudos: Nudo[], tramos: Tramo[]): { pressures: Record<string, number>, parents: Record<string, string>, heads: Record<string, number> } {
    const pressures: Record<string, number> = {}
    const heads: Record<string, number> = {}
    const parents: Record<string, string> = {}
    const adj: Record<string, string[]> = {}

    // 1. Initialize roots (Reservoirs & CRPs & Cisterns)
    const queue: { id: string, head: number }[] = []

    nudos.forEach(n => {
        if (n.cota_terreno !== undefined && (n.tipo === 'reservorio' || n.tipo === 'cisterna' || n.tipo === 'camara_rompe_presion')) {
            const head = n.cota_terreno
            pressures[n.id] = 0 // Static pressure at free surface is 0
            heads[n.id] = head
            queue.push({ id: n.id, head })
        }
        adj[n.id] = []
    })

    // 2. Build adjacency
    tramos.forEach(t => {
        if (!adj[t.nudo_origen_id]) adj[t.nudo_origen_id] = []
        if (!adj[t.nudo_destino_id]) adj[t.nudo_destino_id] = []

        adj[t.nudo_origen_id].push(t.nudo_destino_id)
        adj[t.nudo_destino_id].push(t.nudo_origen_id)
    })

    // 3. BFS Traversal
    const visited = new Set<string>()
    queue.forEach(q => visited.add(q.id))

    while (queue.length > 0) {
        const { id, head } = queue.shift()!
        const neighbors = adj[id] || []

        for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId)
                parents[neighborId] = id // Track parent for path reconstruction

                const node = nudos.find(n => n.id === neighborId)

                if (node && node.cota_terreno !== undefined) {
                    const currentStaticPressure = head - node.cota_terreno
                    pressures[node.id] = currentStaticPressure
                    heads[node.id] = head

                    // If not separate source, propagate head
                    if (node.tipo !== 'reservorio' && node.tipo !== 'cisterna' && node.tipo !== 'camara_rompe_presion') {
                        queue.push({ id: neighborId, head })
                    }
                }
            }
        }
    }

    return { pressures, parents, heads }
}

export default function MapEditor({
    nudos, tramos, proyectoId, initialPlanoConfig,
    onNudoClick, onNudoDragEnd, onMapClick, onCreatePipe,
    center = [-12.0464, -77.0428], zoom = 13
}: MapEditorProps) {
    const [mounted, setMounted] = useState(false)
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const startNodeId = useProjectStore(state => state.startNodeId)
    const setStartNodeId = useProjectStore(state => state.setStartNodeId)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null)

    // Profile Graph State
    const [profileNode, setProfileNode] = useState<string | null>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    // Configuración del plano
    const [planoConfig, setPlanoConfig] = useState<PlanoConfig | null>(initialPlanoConfig || null)

    // Cálculos en tiempo real
    const { pressures: staticPressures, parents: nodeParents, heads: piezometricHeads } = useMemo(() => calculateStaticPressures(nudos, tramos), [nudos, tramos])

    // Generate profile data on demand
    const profileData: ProfileDataPoint[] = useMemo(() => {
        if (!profileNode || !nodeParents[profileNode]) return []

        // Trace back from target to source
        const path: string[] = []
        let curr: string | undefined = profileNode
        while (curr) {
            path.unshift(curr)
            curr = nodeParents[curr]
            // Safety break for cycles (though tree structure assumed)
            if (path.length > nudos.length) break
        }

        // Calculate distances
        const dataDetails: ProfileDataPoint[] = []
        let cumulativeDist = 0

        for (let i = 0; i < path.length; i++) {
            const nodeId = path[i]
            const node = nudos.find(n => n.id === nodeId)!

            if (i > 0) {
                const prevId = path[i - 1]
                const tramo = tramos.find(t =>
                    (t.nudo_origen_id === prevId && t.nudo_destino_id === nodeId) ||
                    (t.nudo_destino_id === prevId && t.nudo_origen_id === nodeId)
                )
                if (tramo) {
                    cumulativeDist += tramo.longitud
                }
            }

            dataDetails.push({
                name: node.codigo,
                distance: cumulativeDist,
                elevation: node.cota_terreno || 0,
                hydraulicHead: piezometricHeads[nodeId] || 0,
                staticPressure: staticPressures[nodeId] || 0,
                nodeType: node.tipo
            })
        }

        return dataDetails

    }, [profileNode, nodeParents, nudos, tramos, piezometricHeads, staticPressures])

    const formatProfileDetails = (nudo: Nudo) => {
        setProfileNode(nudo.id)
        setIsProfileOpen(true)
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (initialPlanoConfig) setPlanoConfig(initialPlanoConfig)
    }, [initialPlanoConfig])

    if (!mounted) return null

    // Filtrar recursos válidos para mapa
    const validNudos = nudos.filter(n => n.latitud && n.longitud)
    const validTramos = tramos.filter(t => {
        const origen = nudos.find(n => n.id === t.nudo_origen_id)
        const destino = nudos.find(n => n.id === t.nudo_destino_id)
        return origen?.latitud && origen?.longitud && destino?.latitud && destino?.longitud
    })

    const handleMapClick = (lat: number, lng: number) => {
        if (activeTool === 'node' && onMapClick) {
            onMapClick(lat, lng)
            setActiveTool('select') // Desactivar modo tras agregar
        } else if (activeTool === 'select') {
            setSelectedElement(null)
        }
    }

    const handleNudoClick = (nudo: Nudo) => {
        if (activeTool === 'select') {
            setSelectedElement({ id: nudo.id, type: 'nudo' })
            if (onNudoClick) onNudoClick(nudo)
        } else if (activeTool === 'pipe') {
            if (!startNodeId) {
                setStartNodeId(nudo.id)
                console.log("Start node set:", nudo.codigo)
            } else {
                if (startNodeId !== nudo.id) {
                    console.log("Creating pipe:", startNodeId, "->", nudo.id)
                    if (onCreatePipe) onCreatePipe(startNodeId, nudo.id)
                    setStartNodeId(null)
                    // Optional: setActiveTool('select') or keep drawing? Let's keep drawing for chains if supported, but simple now.
                    setActiveTool('select')
                } else {
                    // Clicked same node, maybe cancel?
                    setStartNodeId(null)
                }
            }
        }
    }

    // Guardar configuración en backend
    const handleSavePlano = async (config: PlanoConfig) => {
        try {
            await fetch(`/api/proyectos/${proyectoId}/plano`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ configuracion_plano: config })
            })
            setPlanoConfig(config) // Ensure local state is sync
        } catch (error) {
            console.error("Error saving plano config", error)
            throw error
        }
    }

    // Inicializar bounds si es nuevo
    const handlePlanoConfigChange = (newConfig: PlanoConfig | null) => {
        if (newConfig && !newConfig.bounds) {
            // Default bounds around center: +/- 0.005 degrees (~500m)
            const c = center
            newConfig.bounds = [
                [c[0] + 0.002, c[1] - 0.002], // TopLeft (NorthWest) - Wait, ImageOverlay uses [TopLeft, BottomRight] or [SouthWest, NorthEast]?
                // Leaflet ImageOverlay bounds: LatLngBoundsExpression: [[south, west], [north, east]] usually.
                [c[0] - 0.002, c[1] + 0.002]  // BottomRight
            ]
        }
        setPlanoConfig(newConfig)
    }

    // Handlers para esquinas de calibración
    const updateCorner = (index: 0 | 1, lat: number, lng: number) => {
        if (!planoConfig || !planoConfig.bounds) return

        const newBounds: [[number, number], [number, number]] = [...planoConfig.bounds]
        newBounds[index] = [lat, lng]
        setPlanoConfig({ ...planoConfig, bounds: newBounds })
    }

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border/30 z-0 group">
            {/* Plano Manager UI */}
            <div className="absolute bottom-6 left-4 z-[400] pointer-events-auto">
                <PlanoManager
                    proyectoId={proyectoId}
                    config={planoConfig}
                    onConfigChange={handlePlanoConfigChange}
                    onSave={handleSavePlano}
                />
            </div>

            {/* CRP Helper UI */}
            <div className="absolute top-4 left-4 z-[400] pointer-events-auto">
                <CRPHelper
                    nudos={nudos}
                    staticPressures={staticPressures}
                    onFocusNode={(lat, lng) => setFocusedLocation([lat, lng])}
                />
            </div>

            {activeTool === 'node' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 pointer-events-none">
                    Modo: Crear Nudo (Haz clic en el mapa)
                </div>
            )}

            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className={`w-full h-full ${activeTool === 'node' ? 'cursor-crosshair' : ''}`}>
                <ThemeAwareTileLayer />

                <MapAdjuster nudos={validNudos} />
                <MapClickHandler onClick={handleMapClick} />
                <MapFlyTo center={focusedLocation} />

                {/* PROFILE GRAPH MODAL */}
                <ProfileGraphModal
                    isOpen={isProfileOpen}
                    onOpenChange={setIsProfileOpen}
                    data={profileData}
                    targetNodeCode={nudos.find(n => n.id === profileNode)?.codigo || 'Red'}
                />

                {/* IMAGE OVERLAY */}
                {planoConfig && planoConfig.bounds && (
                    <>
                        <ImageOverlay
                            url={planoConfig.url}
                            bounds={planoConfig.bounds}
                            opacity={planoConfig.opacity}
                            zIndex={1}
                        />
                        {/* Calibration Handles */}
                        <Marker
                            position={planoConfig.bounds[0]}
                            icon={cornerIcon}
                            draggable={true}
                            eventHandlers={{
                                drag: (e) => {
                                    const { lat, lng } = e.target.getLatLng()
                                    updateCorner(0, lat, lng)
                                }
                            }}
                        />
                        <Marker
                            position={planoConfig.bounds[1]}
                            icon={cornerIcon}
                            draggable={true}
                            eventHandlers={{
                                drag: (e) => {
                                    const { lat, lng } = e.target.getLatLng()
                                    updateCorner(1, lat, lng)
                                }
                            }}
                        />
                    </>
                )}

                {validTramos.map(tramo => {
                    const origen = nudos.find(n => n.id === tramo.nudo_origen_id)!
                    const destino = nudos.find(n => n.id === tramo.nudo_destino_id)!

                    // Check pressures
                    const pStart = staticPressures[origen.id] || 0
                    const pEnd = staticPressures[destino.id] || 0
                    const maxP = Math.max(pStart, pEnd)
                    const isHighPressure = maxP > 50

                    // Hydraulic Results
                    const caudal = tramo.caudal || 0
                    const velocidad = tramo.velocidad || 0
                    const hf = tramo.perdida_carga || 0
                    const hasResults = caudal !== 0

                    // Flow Direction visual (simple color or opacity)
                    const strokeColor = hasResults
                        ? (velocidad > 3 ? '#ef4444' : (velocidad < 0.6 ? '#eab308' : '#22c55e')) // Red>3m/s, Yellow<0.6m/s, Green OK
                        : (isHighPressure ? '#ef4444' : (selectedElement?.id === tramo.id ? '#3b82f6' : 'oklch(0.60 0.15 230)'))

                    const strokeWeight = (hasResults || isHighPressure || selectedElement?.id === tramo.id) ? 6 : 4

                    return (
                        <Polyline
                            key={tramo.id}
                            positions={[
                                [origen.latitud!, origen.longitud!],
                                [destino.latitud!, destino.longitud!]
                            ]}
                            pathOptions={{
                                color: strokeColor,
                                weight: strokeWeight,
                                opacity: selectedElement?.id === tramo.id ? 1 : 0.8
                            }}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e) // Prevent map click
                                    if (activeTool === 'select') {
                                        setSelectedElement({ id: tramo.id, type: 'tramo' })
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong>{tramo.codigo}</strong><br />
                                    L: {tramo.longitud.toFixed(2)}m<br />
                                    Ø: {(tramo.diametro_interior / 25.4).toFixed(1)}" ({tramo.diametro_interior}mm)

                                    {hasResults && (
                                        <>
                                            <hr className="my-1 border-border" />
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                                                <span className="text-muted-foreground">Caudal:</span>
                                                <span className="font-mono">{Math.abs(caudal).toFixed(2)} L/s</span>

                                                <span className="text-muted-foreground">Velocidad:</span>
                                                <span className={`font-mono ${velocidad > 3 || velocidad < 0.6 ? 'text-yellow-600 font-bold' : ''}`}>
                                                    {velocidad.toFixed(2)} m/s
                                                </span>

                                                <span className="text-muted-foreground">Pérdida:</span>
                                                <span className="font-mono">{hf.toFixed(2)} m</span>
                                            </div>
                                        </>
                                    )}

                                    {!hasResults && (
                                        <>
                                            <hr className="my-1 border-border" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">P. Estática (aprox):</span>
                                                <span className={`font-mono font-bold ${isHighPressure ? 'text-red-500' : ''}`}>
                                                    {maxP.toFixed(1)} mca
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {isHighPressure && (
                                        <div className="text-xs text-red-500 font-bold mt-1 bg-red-100 dark:bg-red-900/30 p-1 rounded">
                                            ⚠️ ¡Presión Estática Alta!
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Polyline>
                    )
                })}

                {validNudos.map(nudo => (
                    <DraggableMarker
                        key={nudo.id}
                        nudo={nudo}
                        onDragEnd={onNudoDragEnd}
                        onClick={handleNudoClick}
                        staticPressure={staticPressures[nudo.id]}
                        dynamicPressure={nudo.presion_calc}
                        isStartNode={startNodeId === nudo.id}
                        isSelected={selectedElement?.id === nudo.id && selectedElement?.type === 'nudo'}
                        onViewProfile={() => formatProfileDetails(nudo)}
                    />
                ))}
            </MapContainer>
        </div>
    )
}

function DraggableMarker({
    nudo, onDragEnd, onClick, staticPressure, dynamicPressure, onViewProfile, isStartNode, isSelected
}: {
    nudo: Nudo,
    onDragEnd?: (id: string, lat: number, lng: number) => void,
    onClick?: (n: Nudo) => void,
    staticPressure?: number,
    dynamicPressure?: number,
    onViewProfile?: () => void,
    isStartNode?: boolean,
    isSelected?: boolean
}) {
    const [position, setPosition] = useState<[number, number]>([nudo.latitud!, nudo.longitud!])

    // Update local position if props change (e.g. from server update)
    useEffect(() => {
        if (nudo.latitud && nudo.longitud) {
            setPosition([nudo.latitud, nudo.longitud])
        }
    }, [nudo.latitud, nudo.longitud])

    const eventHandlers = useMemo(
        () => ({
            click: () => onClick?.(nudo),
            dragend: (e: any) => {
                const marker = e.target
                const newPos = marker.getLatLng()
                setPosition([newPos.lat, newPos.lng])
                onDragEnd?.(nudo.id, newPos.lat, newPos.lng)
            },
        }),
        [nudo, onDragEnd, onClick]
    )

    // Determine color based on dynamic pressure if check result is available
    const hasResult = dynamicPressure !== undefined
    const p = dynamicPressure || staticPressure || 0

    // Icon generation (Updated to use code)
    const customIcon = useMemo(() => createCustomIcon(nudo.tipo, nudo.codigo, !!isSelected), [nudo.tipo, nudo.codigo, isSelected])

    // Label for dynamic pressure status
    let statusColor = '#3b82f6'
    if (hasResult) {
        if (p < 0 || p > 50) statusColor = '#ef4444' // Red
        else if (p < 15) statusColor = '#eab308' // Yellow
        else statusColor = '#22c55e' // Green
    } else {
        if ((staticPressure || 0) > 50) statusColor = '#ef4444'
    }

    return (
        <>
            {isStartNode && (
                <Circle
                    center={position}
                    radius={15}
                    pathOptions={{ color: '#22c55e', fillOpacity: 0.3, weight: 2, dashArray: '5, 5' }}
                />
            )}

            <Marker
                position={position}
                icon={customIcon}
                draggable={!!onDragEnd}
                eventHandlers={eventHandlers}
                autoPan={true}
                opacity={isStartNode ? 1 : 0.9}
            >
                <Popup>
                    <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base">{nudo.codigo}</span>
                            <span className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded border">{nudo.tipo.replace('_', ' ')}</span>
                        </div>
                        Cota: {nudo.cota_terreno} m.s.n.m.<br />

                        {hasResult ? (
                            <>
                                <hr className="my-1 border-border" />
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-muted-foreground">Presión Dinámica:</span>
                                    <span className={`font-mono font-bold`} style={{ color: statusColor }}>
                                        {p.toFixed(2)} mca
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">Demanda: {nudo.demanda_base} L/s</div>
                            </>
                        ) : (
                            staticPressure !== undefined && (
                                <>
                                    <br />
                                    P. Estática: <span className={staticPressure > 50 ? "text-red-500 font-bold" : ""}>{staticPressure.toFixed(1)} mca</span>
                                </>
                            )
                        )}

                        <br />
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2 h-6 text-xs"
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewProfile?.()
                            }}
                        >
                            <LineChart className="w-3 h-3 mr-1" />
                            Ver Perfil
                        </Button>
                    </div>
                </Popup>
            </Marker>
        </>
    )
}
