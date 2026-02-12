"use client"

import { useCallback, useMemo, useRef, useState, useEffect, DragEvent } from 'react'
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    type Connection,
    type Node,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    Panel,
    type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ReservoirNode from './nodes/ReservoirNode'
import CRPNode from './nodes/CRPNode'
import JunctionNode from './nodes/JunctionNode'
import { PipeEdge } from './edges/PipeEdge'
import { Nudo, Tramo } from '@/types/models'
import { useProjectStore } from '@/store/project-store'

// ==================== NODE TYPES ====================
const nodeTypes: NodeTypes = {
    reservorio: ReservoirNode,
    camara_rompe_presion: CRPNode,
    union: JunctionNode,
    cisterna: ReservoirNode,
    consumo: JunctionNode,
    tanque_elevado: ReservoirNode,
    valvula: JunctionNode,
    bomba: JunctionNode,
}

const edgeTypes: EdgeTypes = {
    pipe: PipeEdge,
}

function nudoToNodeType(tipo: string): string {
    if (nodeTypes[tipo]) return tipo
    return 'union'
}

// ==================== CONVERTERS ====================
function nudosToNodes(nudos: Nudo[]): Node[] {
    return nudos.map((nudo, index) => ({
        id: nudo.id,
        type: nudoToNodeType(nudo.tipo),
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
            tipo: nudo.tipo,
        },
    }))
}

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

// ==================== COMPONENT ====================
interface NetworkDesignerProps {
    nudos: Nudo[]
    tramos: Tramo[]
    onNodeDragStop?: (id: string, x: number, y: number) => void
    onConnect?: (sourceId: string, targetId: string) => void
    onNodeClick?: (nudo: Nudo) => void
    onAddNode?: (x: number, y: number, tipo?: string) => void
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
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore(state => state.setActiveComponentType)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const reactFlowRef = useRef<ReactFlowInstance | null>(null)

    // ================================================================
    // GAME-LOOP ARCHITECTURE:
    //   Source of truth: Zustand store (nudos, tramos)
    //   Local state: synced via useEffect whenever store changes
    //   React Flow: controlled component using this local state
    //
    // Flow:
    //   [User Action] → Zustand store mutation → props change
    //     → useEffect fires → setNodes(derived) → React Flow re-renders
    //
    //   [User Drags Node] → onNodesChange → applyNodeChanges → local state
    //     → onNodeDragStop → persist to DB (optimistic, no re-derive)
    // ================================================================

    const [nodes, setNodes] = useState<Node[]>(() => nudosToNodes(nudos))
    const [edges, setEdges] = useState<Edge[]>(() => tramosToEdges(tramos))

    // ★ KEY: Sync local state whenever Zustand store data changes
    // This is what makes it "real-time" — when addNudo/addTramo updates
    // the store, this effect fires and pushes new data to React Flow.
    useEffect(() => {
        setNodes(prev => {
            const newNodes = nudosToNodes(nudos)
            // Preserve positions of existing nodes (user may have dragged them)
            return newNodes.map(newNode => {
                const existing = prev.find(n => n.id === newNode.id)
                if (existing) {
                    return { ...newNode, position: existing.position }
                }
                return newNode
            })
        })
    }, [nudos])

    useEffect(() => {
        setEdges(tramosToEdges(tramos))
    }, [tramos])

    // Handle React Flow internal changes (drag, select, resize, etc.)
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes(nds => applyNodeChanges(changes, nds))
        },
        []
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges(eds => applyEdgeChanges(changes, eds))
        },
        []
    )

    // Handle new connections
    const onConnect: OnConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                onConnectProp?.(connection.source, connection.target)
                // Edge will appear via store → useEffect sync
            }
        },
        [onConnectProp]
    )

    // Handle node drag end → persist position
    const handleNodeDragStop = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            onNodeDragStop?.(node.id, node.position.x, node.position.y)
        },
        [onNodeDragStop]
    )

    // Handle node click → select in store (no panel navigation!)
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

    // ========== DRAG & DROP ==========
    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            const nodeType = event.dataTransfer.getData('application/reactflow-nodetype')
            if (!nodeType || !reactFlowRef.current) return

            const position = reactFlowRef.current.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            setActiveComponentType(nodeType as Nudo['tipo'])
            setActiveTool('node')
            onAddNode?.(position.x, position.y, nodeType)

            setTimeout(() => {
                setActiveTool('select')
                setActiveComponentType(null)
            }, 100)
        },
        [onAddNode, setActiveTool, setActiveComponentType]
    )

    // ========== PANE CLICK ==========
    const handlePaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (activeTool === 'node' && onAddNode && reactFlowRef.current) {
                const position = reactFlowRef.current.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
                onAddNode(position.x, position.y, activeComponentType || undefined)
                setActiveTool('select')
                setActiveComponentType(null)
            } else {
                setSelectedElement(null)
            }
        },
        [activeTool, activeComponentType, onAddNode, setSelectedElement, setActiveTool, setActiveComponentType]
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
                onDragOver={handleDragOver}
                onDrop={handleDrop}
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
                panOnDrag={activeTool === 'select'}
                panOnScroll={true}
                zoomOnScroll={true}
                preventScrolling={true}
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
