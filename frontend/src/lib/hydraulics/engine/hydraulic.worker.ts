import { Project, Workspace } from 'epanet-js';
import { SimulationRequest, SimulationResult } from './types';

// Definimos el contexto del worker
const ctx: Worker = self as any;

ctx.onmessage = async (event: MessageEvent<SimulationRequest>) => {
    try {
        const { network } = event.data;
        const result = await runSimulation(network);
        ctx.postMessage({ type: 'SUCCESS', result });
    } catch (error: any) {
        ctx.postMessage({ type: 'ERROR', error: error.message });
    }
};

async function runSimulation(network: any): Promise<SimulationResult> {
    const ws = new Workspace();
    const model = new Project(ws);

    try {
        // 1. Inicializar Red
        model.init('H-Redes-Project', 8, 1, 0); // 8=LPS, 1=H-W, 0=DDA

        // 2. Construir Red (INP Builder)

        // Agregar Nudos
        if (network.nodes && network.nodes.length > 0) {
            for (const node of network.nodes) {
                if (node.type === 'RESERVOIR') {
                    // addReservoir(id, elevation, pattern)
                    // Convertimos ID a string seguro
                    const id = String(node.id);
                    model.addReservoir(id, node.elevation, '');

                    // Si hay carga definida (Total Head), la establecemos
                    // Nota: addReservoir toma elevation como Total Head si no hay patrón?
                    // EPANET docs: Para reservorios, parametro 'elevation' ES el Total Head.
                    if (node.head !== undefined) {
                        // model.setNodeValue(index, 0, node.head); // Si fuera necesario
                    }
                } else {
                    // JUNCTION
                    // addJunction(id, elevation, demand, pattern)
                    const id = String(node.id);
                    model.addJunction(id, node.elevation, node.demand || 0, '');
                }
            }
        }

        // Agregar Tuberías
        if (network.links && network.links.length > 0) {
            for (const link of network.links) {
                const id = String(link.id);
                // addPipe(id, fromNode, toNode, length, diameter, roughness, minorLoss)
                model.addPipe(id, String(link.source), String(link.target), link.length, link.diameter, link.roughness, 0);
            }
        }

        // 3. Ejecutar Simulación
        model.solveCompleteHydraulics();

        // 4. Extraer Resultados
        const nodeResults: Record<string, any> = {};
        const linkResults: Record<string, any> = {};

        // Mapeamos Nudos (Presión, Demanda)
        const nodeIds = model.getNodeIdList();
        for (const nodeId of nodeIds) {
            const index = model.getNodeIndex(nodeId);

            // 11 = EN_PRESSURE, 10 = EN_HEAD, 9 = EN_DEMAND
            const pressure = model.getNodeValue(index, 11);
            const head = model.getNodeValue(index, 10);
            const demand = model.getNodeValue(index, 9);

            nodeResults[nodeId] = {
                id: nodeId,
                pressure,
                head,
                demand
            };
        }

        // Mapeamos Tuberías (Flujo, Velocidad, Pérdida)
        const linkIds = model.getLinkIdList();
        for (const linkId of linkIds) {
            const index = model.getLinkIndex(linkId);

            // 8 = EN_FLOW, 9 = EN_VELOCITY, 10 = EN_HEADLOSS
            const flow = model.getLinkValue(index, 8);
            const velocity = model.getLinkValue(index, 9);
            const headloss = model.getLinkValue(index, 10);

            linkResults[linkId] = {
                id: linkId,
                flow,
                velocity,
                headloss,
                status: 1
            };
        }

        return {
            nodeResults,
            linkResults
        };

    } finally {
        model.close();
        // ws.close(); 
    }
}
