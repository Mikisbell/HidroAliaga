"use client"

import { useCallback, useMemo, useRef } from 'react'
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Node,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type OnConnect,
    Panel,
    type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ReservoirNode from './nodes/ReservoirNode' // Default import
import CRPNode from './nodes/CRPNode'
import JunctionNode from './nodes/JunctionNode'
import { PipeEdge } from './edges/PipeEdge' // This one is named export
import { Nudo, Tramo } from '@/types/models'
import { useProjectStore } from '@/store/project-store'

// Register custom node types
const nodeTypes: NodeTypes = {
    reservorio: ReservoirNode,
    camara_rompe_presion: CRPNode,
    union: JunctionNode,
    cisterna: ReservoirNode, // Reuse same visual for now
    consumo: JunctionNode,
    tanque_elevado: ReservoirNode,
    valvula: JunctionNode,
    bomba: JunctionNode,
}

const edgeTypes: EdgeTypes = {
    pipe: PipeEdge,
}

// Map Nudo tipo → ReactFlow node type
function nudoToNodeType(tipo: string): string {
    if (nodeTypes[tipo]) return tipo
    return 'union' // Fallback
}

// Convert Nudo[] → ReactFlow Node[]
function nudosToNodes(nudos: Nudo[]): Node[] {
    return nudos.map((nudo, index) => ({
        id: nudo.id,
        type: nudoToNodeType(nudo.tipo),
        // Use latitud/longitud as X/Y canvas position (or default grid layout)
        position: {
            x: nudo.longitud ? nudo.longitud * 1000 : (index % 5) * 200 + 100,
            y: nudo.latitud ? nudo.latitud * 1000 : Math.floor(index / 5) * 200 + 100,
        },
        data: {
            label: nudo.codigo,
            codigo: nudo.codigo,
            cota_terreno: nudo.cota_terreno,
            demanda_base: nudo.demanda_base,
            numero_viviendas: nudo.numero_viviendas,
            altura_agua: nudo.altura_agua,
            tipo: nudo.tipo, // Pass type for CRP logic
        },
    }))
}

// Convert Tramo[] → ReactFlow Edge[]
function tramosToEdges(tramos: Tramo[]): Edge[] {
    return tramos.map(tramo => ({
        id: tramo.id,
        source: tramo.nudo_origen_id,
        target: tramo.nudo_destino_id,
        type: 'pipe',
        data: {
            codigo: tramo.codigo,
            longitud: tramo.longitud,
            diametro: tramo.diametro_interior,
            material: tramo.material,
        },
    }))
}

interface NetworkDesignerProps {
    nudos: Nudo[]
    tramos: Tramo[]
    onNodeDragStop?: (id: string, x: number, y: number) => void
    onConnect?: (sourceId: string, targetId: string) => void
    onNodeClick?: (nudo: Nudo) => void
    onAddNode?: (x: number, y: number) => void
}

export default function NetworkDesigner({
    nudos,
    tramos,
    onNodeDragStop,
    onConnect: onConnectProp,
    onNodeClick,
    onAddNode,
}: NetworkDesignerProps) {
    const activeTool = useProjectStore(state => state.activeTool)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const reactFlowRef = useRef<ReactFlowInstance | null>(null)

    // Initialize nodes and edges from props
    const initialNodes = useMemo(() => nudosToNodes(nudos), [nudos])
    const initialEdges = useMemo(() => tramosToEdges(tramos), [tramos])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    // Handle new connections (drawing a pipe between two nodes)
    const onConnect: OnConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                // Call server action to create the tramo
                onConnectProp?.(connection.source, connection.target)
                // Optimistically add edge
                setEdges((eds) =>
                    addEdge({ ...connection, type: 'pipe', data: {} }, eds)
                )
            }
        },
        [onConnectProp, setEdges]
    )

    // Handle node drag end → persist position
    const handleNodeDragStop = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            onNodeDragStop?.(node.id, node.position.x, node.position.y)
        },
        [onNodeDragStop]
    )

    // Handle node click → select in store
    const handleNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            const nudo = nudos.find(n => n.id === node.id)
            if (nudo) {
                setSelectedElement({ id: nudo.id, type: 'nudo' })
                onNodeClick?.(nudo)
            }
        },
        [nudos, setSelectedElement, onNodeClick]
    )

    // Handle edge click → select in store
    const handleEdgeClick = useCallback(
        (_event: React.MouseEvent, edge: Edge) => {
            setSelectedElement({ id: edge.id, type: 'tramo' })
        },
        [setSelectedElement]
    )

    // Handle pane click → deselect or add node
    const handlePaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (activeTool === 'node' && onAddNode && reactFlowRef.current) {
                const position = reactFlowRef.current.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
                onAddNode(position.x, position.y)
            } else {
                setSelectedElement(null)
            }
        },
        [activeTool, onAddNode, setSelectedElement]
    )

    return (
        <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border/30">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={handleNodeDragStop}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onPaneClick={handlePaneClick}
                onInit={(instance) => { reactFlowRef.current = instance }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                snapToGrid
                snapGrid={[20, 20]}
                className={activeTool === 'node' ? 'cursor-crosshair' : ''}
                deleteKeyCode={['Delete', 'Backspace']}
                connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                defaultEdgeOptions={{ type: 'pipe' }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    className="!bg-gray-50 dark:!bg-gray-950"
                />
                <Controls
                    showInteractive={false}
                    className="!bg-background/90 !border-border/40 !shadow-xl !rounded-xl"
                />
                <MiniMap
                    className="!bg-background/90 !border-border/40 !shadow-xl !rounded-xl"
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'reservorio': return '#2563eb'
                            case 'camara_rompe_presion': return '#eab308'
                            default: return '#6b7280'
                        }
                    }}
                    maskColor="rgba(0,0,0,0.1)"
                    pannable
                    zoomable
                />

                {/* Mode indicator */}
                {activeTool === 'node' && (
                    <Panel position="top-center">
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2">
                            Modo: Colocar Componente (Haz clic en el lienzo)
                        </div>
                    </Panel>
                )}
                {activeTool === 'pipe' && (
                    <Panel position="top-center">
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2">
                            Modo: Conectar (Arrastra de un nodo a otro)
                        </div>
                    </Panel>
                )}
            </ReactFlow>
        </div>
    )
}
