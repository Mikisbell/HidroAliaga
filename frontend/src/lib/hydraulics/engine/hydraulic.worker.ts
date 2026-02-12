import { Project, Workspace } from 'epanet-js';
import { SimulationRequest, SimulationResult } from './types';

// Definimos el contexto del worker
const ctx: Worker = self as any;

// EPANET Constants (Manual Definition)
const EN_ELEVATION = 0;
const EN_BASEDEMAND = 1;
// const EN_PATTERN = 2;
const EN_DIAMETER = 0;
const EN_LENGTH = 1;
const EN_ROUGHNESS = 2;
const EN_MINORLOSS = 3;

const EN_JUNCTION = 0;
const EN_RESERVOIR = 1;

const EN_PIPE = 1;

const EN_FLOW = 8;
const EN_VELOCITY = 9;
const EN_HEADLOSS = 10;
const EN_PRESSURE = 11;
const EN_HEAD = 10;
const EN_DEMAND = 9;

ctx.onmessage = async (event: MessageEvent<SimulationRequest>) => {
    try {
        const { network } = event.data;
        const result = await runSimulation(network);
        ctx.postMessage({ type: 'SUCCESS', result });
    } catch (error: any) {
        console.error("Simulation Error:", error);
        ctx.postMessage({ type: 'ERROR', error: error.message || String(error) });
    }
};

async function runSimulation(network: any): Promise<SimulationResult> {
    const ws = new Workspace();
    const model = new Project(ws) as any; // Cast to any to bypass TS strict checks if definitions are missing

    try {
        // 1. Inicializar Red (report.rpt, out.bin, units=8(LPS), headloss=1(H-W))
        // init usually takes (rptFile, outFile, units, headloss)
        model.init('report.rpt', 'out.bin', 8, 1);

        // 2. Construir Red (Nodes first, then Links)

        // Agregar Nudos
        if (network.nodes && network.nodes.length > 0) {
            for (const node of network.nodes) {
                const id = String(node.id);
                // Determines type index
                const typeIndex = node.type === 'RESERVOIR' ? EN_RESERVOIR : EN_JUNCTION;

                // Add Node
                const index = model.addNode(id, typeIndex);

                // Set Properties
                // Elevation (Cota)
                model.setNodeValue(index, EN_ELEVATION, node.elevation || 0);

                if (node.type !== 'RESERVOIR') {
                    // Base Demand (Demanda Base)
                    model.setNodeValue(index, EN_BASEDEMAND, node.demand || 0);
                } else {
                    // Reservoir Head (Carga Total)
                    // For Reservoirs, Elevation IS the Total Head in basic input
                    // If we have distinct head, we update elevation property
                    if (node.head !== undefined) {
                        model.setNodeValue(index, EN_ELEVATION, node.head);
                    }
                }
            }
        }

        // Agregar Tuberías
        if (network.links && network.links.length > 0) {
            for (const link of network.links) {
                const id = String(link.id);
                const sourceId = String(link.source);
                const targetId = String(link.target);

                try {
                    // Add Link (Pipe)
                    // addLink(id, type, fromNode, toNode)
                    const index = model.addLink(id, EN_PIPE, sourceId, targetId);

                    // Set Properties
                    // Length
                    model.setLinkValue(index, EN_LENGTH, link.length || 10);
                    // Diameter
                    model.setLinkValue(index, EN_DIAMETER, link.diameter || 50);
                    // Roughness
                    model.setLinkValue(index, EN_ROUGHNESS, link.roughness || 140);
                    // Minor Loss
                    model.setLinkValue(index, EN_MINORLOSS, 0);

                } catch (err) {
                    console.warn(`Skipping link ${id}:`, err);
                }
            }
        }

        // 3. Ejecutar Simulación
        // solveCompleteHydraulics wraps ENopenH, ENinitH, ENrunH, ENnextH, ENcloseH
        model.solveCompleteHydraulics();

        // 4. Extraer Resultados
        const nodeResults: Record<string, any> = {};
        const linkResults: Record<string, any> = {};

        // Mapeamos Nudos (Presión, Demanda)
        const nodeIds = model.getNodeIdList();
        for (const nodeId of nodeIds) {
            const index = model.getNodeIndex(nodeId);

            const pressure = model.getNodeValue(index, EN_PRESSURE);
            const head = model.getNodeValue(index, EN_HEAD);
            const demand = model.getNodeValue(index, EN_DEMAND);

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

            const flow = model.getLinkValue(index, EN_FLOW);
            const velocity = model.getLinkValue(index, EN_VELOCITY);
            const headloss = model.getLinkValue(index, EN_HEADLOSS);

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
        try {
            model.close();
            // ws.close(); // Dispose workspace if needed
        } catch (e) {
            // Ignore close errors
        }
    }
}
