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

import { createNudo, deleteNudo } from "@/app/actions/nudos"
import { createTramo, deleteTramo } from "@/app/actions/tramos"
import { toast } from "sonner"

import ReservoirNode from './nodes/ReservoirNode'
import CRPNode from './nodes/CRPNode'
import JunctionNode from './nodes/JunctionNode'
import { PipeEdge } from './edges/PipeEdge'
import { NodeEditPopover } from './nodes/NodeEditPopover'
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
        sourceHandle: tramo.source_handle,
        targetHandle: tramo.target_handle,
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
    onConnect?: (sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) => void
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

    // Double-click edit state
    const [editingNode, setEditingNode] = useState<{ nudo: Nudo; position: { x: number; y: number } } | null>(null)

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
    // Update interface for props to accept handles
    // NOTE: onConnectProp signature needs to be updated in the prop definition if we want to pass handles up
    // But since onConnectProp is used for creating tramos, we should pass the handles there.

    // VALIDATION: Prevent multiple connections per handle
    const isValidConnection = useCallback(
        (connection: Connection | Edge) => {
            // Check if source handle is already used
            const targetHandle = 'targetHandle' in connection ? connection.targetHandle : null;
            const sourceHandle = 'sourceHandle' in connection ? connection.sourceHandle : null;

            const sourceUsed = edges.some(e =>
                e.source === connection.source &&
                e.sourceHandle === sourceHandle
            );

            // Check if target handle is already used
            const targetUsed = edges.some(e =>
                e.target === connection.target &&
                e.targetHandle === targetHandle
            );

            // Allow if it's the SAME edge (reconnecting to same handle - unlikely in this call but safe)
            // But validation runs before connection is made.

            // If reconnecting, we need to ignore the edge being reconnected?
            // ReactFlow handles 'reconnect' separate from 'connect' usually?
            // Actually, isValidConnection is called for both.

            // Note: edges state includes the edge being modified? 
            // If reconnecting, the edge is still in 'edges'.

            // We need to know if we are reconnecting (ignoring the current edge)
            // Ideally we'd filter out the edge being dragged.
            // But we don't have the ID of the edge being reconnected easily here unless we track it.

            // Strict Mode: "No deberia ir un tubo al mismo punto"
            return !sourceUsed && !targetUsed;
        },
        [edges]
    );

    const onConnect: OnConnect = useCallback(
        async (connection: Connection) => {
            const currentProj = useProjectStore.getState().currentProject
            if (connection.source && connection.target && currentProj) {
                // 1. Create Tramo on Server
                const response = await createTramo({
                    proyecto_id: currentProj.id,
                    nudo_origen_id: connection.source,
                    nudo_destino_id: connection.target
                })

                if (response.error) {
                    toast.error("Error creating pipe: " + response.error)
                    return
                }

                // 2. Add to Store & Visuals
                // @ts-ignore - Temporary until prop type is updated
                onConnectProp?.(connection.source, connection.target, connection.sourceHandle, connection.targetHandle)

                // If the store action 'addTramo' relies on an ID, we should ideally use response.tramo.id
                // But onConnectProp might be handling ID generation internally.
                // For now, validation is: "It exists on server".
            }
        },
        [onConnectProp] // removed currentProject dep since we read from store
    )

    // RECONNECTION HANDLERS
    const edgeReconnectSuccessful = useRef(false);

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        // Update the edge in the store/backend
        // We need an action like "updateTramoHandles" or use updateTramo
        // oldEdge.id is the tramo ID.

        // Optimistic update
        setEdges((els) => applyEdgeChanges([{ type: 'replace', id: oldEdge.id, item: { ...oldEdge, ...newConnection } } as any], els)); // Simplified

        // Call Backend
        // We need to import updateTramo from actions
        // But wait, updateTramo action needs to support handles. I added them to the interface.
        // We also need to map newConnection.source / target to nudo_origen_id / nudo_destino_id

        import('@/app/actions/tramos').then(({ updateTramo }) => {
            updateTramo({
                id: oldEdge.id,
                nudo_origen_id: newConnection.source || undefined,
                nudo_destino_id: newConnection.target || undefined,
                source_handle: newConnection.sourceHandle || null,
                target_handle: newConnection.targetHandle || null
            } as any);
        });
    }, []);

    const onReconnectEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeReconnectSuccessful.current) {
            // Did not reconnect successfully (dropped in void?)
            // Usually we don't delete on drop-in-void for re-connect unless specified.
        }
        edgeReconnectSuccessful.current = false;
    }, []);

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

    // Handle double-click → open inline edit popover
    const handleNodeDoubleClick = useCallback(
        (event: React.MouseEvent, node: Node) => {
            const nudo = nudos.find(n => n.id === node.id)
            if (nudo) {
                setEditingNode({
                    nudo,
                    position: { x: event.clientX, y: event.clientY }
                })
            }
        },
        [tramos, nudos]
    );

    // DELETION HANDLERS
    const onNodesDelete = useCallback(async (currNodes: Node[]) => {
        // Optimistic update handled by ReactFlow/Store? 
        // No, we need to tell store to remove them?
        // Actually reactflow's onNodesChange usually handles the visual removal if we wire it up.
        // But we need to sync with DB.

        for (const node of currNodes) {
            const nudoId = node.id
            // Call Server
            toast.promise(deleteNudo(nudoId), {
                loading: 'Eliminando nudo...',
                success: 'Nudo eliminado',
                error: 'Error al eliminar nudo'
            })
            // Store removal is handled by onNodesChange -> setNodes?
            // But we need to remove from ProjectStore 'nudos' array too!
            useProjectStore.getState().removeNudo(nudoId)
        }
    }, [])

    const onEdgesDelete = useCallback(async (currEdges: Edge[]) => {
        for (const edge of currEdges) {
            const tramoId = edge.id
            toast.promise(deleteTramo(tramoId), {
                loading: 'Eliminando tramo...',
                success: 'Tramo eliminado',
                error: 'Error al eliminar tramo'
            })
            useProjectStore.getState().removeTramo(tramoId)
        }
    }, [])

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
        async (event: DragEvent) => {
            event.preventDefault()
            const nodeType = event.dataTransfer.getData('application/reactflow-nodetype')
            if (!nodeType || !reactFlowRef.current || !currentProject) return

            const position = reactFlowRef.current.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            setActiveComponentType(nodeType as Nudo['tipo'])
            setActiveTool('node')

            // 1. Create Nudo on Server
            try {
                // Use optimistic temporary handling or await server?
                // Awaiting server ensures ID consistency.
                const { success, nudo, error } = await createNudo(
                    currentProject.id,
                    position.x,
                    position.y,
                    nodeType as Nudo['tipo']
                )

                if (success && nudo) {
                    // 2. Add to Store with REAL ID
                    useProjectStore.getState().addNudo(nudo)
                    toast.success("Nudo creado")
                } else {
                    toast.error("Error creating node: " + error)
                }

            } catch (e) {
                toast.error("Error creating node")
                console.error(e)
            }

            setTimeout(() => {
                setActiveTool('select')
                setActiveComponentType(null)
            }, 100)
        },
        [onAddNode, setActiveTool, setActiveComponentType, currentProject]
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
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                isValidConnection={isValidConnection}
                onNodeDragStop={handleNodeDragStop}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
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

            {/* Double-click edit popover */}
            {editingNode && (
                <NodeEditPopover
                    nudo={editingNode.nudo}
                    position={editingNode.position}
                    onClose={() => setEditingNode(null)}
                />
            )}
        </div>
    )
}
