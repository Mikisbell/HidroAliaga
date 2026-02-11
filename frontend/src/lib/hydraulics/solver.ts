
import { Nudo, Tramo } from "@/types/models";

export interface HydraulicResult {
    tramos: { id: string; caudal: number; velocidad: number; perdida_carga: number }[];
    nudos: { id: string; presion_calc: number }[];
    iterations: number;
    convergencia: boolean;
    error_max: number;
}

class HydraulicSolver {
    private nodes: Map<string, Nudo & { head: number; netFlow: number }>;
    private links: Map<string, Tramo & { flow: number }>;
    private adjacency: Map<string, string[]>; // NodeID -> LinkIDs

    constructor(nudos: Nudo[], tramos: Tramo[]) {
        this.nodes = new Map(nudos.map(n => [n.id, {
            ...n,
            head: n.tipo === 'reservorio' ? (n.elevacion || (n.cota_terreno || 0)) : ((n.cota_terreno || 0) + 50),
            netFlow: 0,
            cota_terreno: n.cota_terreno || 0 // Ensure number
        }]));

        this.links = new Map(tramos.map(t => [t.id, { ...t, flow: 0 }]));

        this.adjacency = new Map();
        nudos.forEach(n => this.adjacency.set(n.id, []));
        tramos.forEach(t => {
            if (this.adjacency.has(t.nudo_origen_id)) this.adjacency.get(t.nudo_origen_id)!.push(t.id);
            if (this.adjacency.has(t.nudo_destino_id)) this.adjacency.get(t.nudo_destino_id)!.push(t.id);
        });
    }

    public solve(maxIterations = 100, tolerance = 0.01): HydraulicResult {
        let iter = 0;
        let maxError = 0;

        for (iter = 0; iter < maxIterations; iter++) {
            maxError = 0;

            // 1. Calculate Flows based on current Heads
            this.links.forEach(link => {
                const nodeA = this.nodes.get(link.nudo_origen_id)!;
                const nodeB = this.nodes.get(link.nudo_destino_id)!;

                const dH = nodeA.head - nodeB.head;
                // Hazen-Williams: Q = 0.2785 * C * D^2.63 * S^0.54
                // k = 0.2785 * C * D^2.63 / L^0.54
                // Q = k * |dH|^0.54 * sign(dH)

                const D = link.diametro_interior / 1000;
                const L = link.longitud;
                const C = link.coef_hazen_williams || 140; // FIXED

                // Avoid division by zero or super small flows
                if (Math.abs(dH) < 1e-6) {
                    link.flow = 0;
                } else {
                    const k = 0.2785 * C * Math.pow(D, 2.63) * Math.pow(1 / L, 0.54);
                    const flowM3s = k * Math.pow(Math.abs(dH), 0.54) * Math.sign(dH);
                    link.flow = flowM3s * 1000; // L/s
                }
            });

            // 2. Check Continuity & Update Heads (Newton Step per Node)
            this.nodes.forEach(node => {
                if (node.tipo === 'reservorio') return; // Fixed head

                let sumQ = 0; // Net flow into node (In - Out)
                let sumDQ_dH = 0; // Derivative of Flow wrt Head (conductance)

                const connectedLinkIds = this.adjacency.get(node.id) || [];

                connectedLinkIds.forEach(linkId => {
                    const link = this.links.get(linkId)!;
                    const isOrigin = link.nudo_origen_id === node.id;
                    const neighborId = isOrigin ? link.nudo_destino_id : link.nudo_origen_id;
                    const neighbor = this.nodes.get(neighborId)!;

                    // define flow direction relative to node: Inflow positive
                    const flowIn = isOrigin ? -link.flow : link.flow;
                    sumQ += flowIn;

                    // Derivative dQ/dH
                    // Q = K * (H_neighbor - H_node)^0.54
                    // dQ/dH_node = -0.54 * Q / (H_neighbor - H_node)
                    // Be careful with signs. Basically always negative contribution to sum.
                    // dQ_in/dH_node is negative.

                    const dH = isOrigin ? (node.head - neighbor.head) : (neighbor.head - node.head);
                    // If flow is zero, derivative is problematic. Use small number.
                    if (Math.abs(link.flow) > 1e-6 && Math.abs(dH) > 1e-6) {
                        sumDQ_dH -= 0.54 * Math.abs(link.flow) / Math.abs(dH);
                    } else {
                        // Linearize for small flows to avoid singularity?
                        // Or just a small conductance
                        sumDQ_dH -= 1e-3;
                    }
                });

                const demand = node.demanda_base || 0; // Outflow
                const residual = sumQ - demand; // Continuity Error (should be 0)

                // Newton-Raphson: H_new = H_old - f(H) / f'(H)
                // f(H) = Residual
                // f'(H) = sum(dQ/dH)

                if (Math.abs(sumDQ_dH) < 1e-9) sumDQ_dH = -1e-9; // Avoid div 0

                const dH_correction = residual / sumDQ_dH; // sumDQ_dH is negative, so if residual > 0 (excess in), dH is negative (reduce head)?
                // Wait: residual = In - Out. If In > Out, we have accumulation. Pressure should rise to push water out?
                // If Residual > 0, we have excess water. We need to Increase Head to push more OUT.
                // My deriv dQ_in/dH is negative (increasing H reduces Inflow).
                // So dH = Residual / sumDQ_dH -> Positive / Negative = Negative. 
                // Creating a negative correction reduces Head. Lower head pulls MORE water in. WRONG.

                // Let's check signs.
                // Residual = Sum(Q_in) - Demand.
                // We want Residual = 0.
                // d(Residual)/dH = Sum(dQin/dH).
                // dQin/dH is negative.
                // Newton: DeltaH = - f(H) / f'(H) = - Residual / SumDeriv.
                // = - Positive / Negative = Positive.
                // So Correct: Head Increases.

                const damping = 0.8; // Damping factor to prevent oscillation
                node.head -= damping * (residual / sumDQ_dH);

                if (Math.abs(residual) > maxError) maxError = Math.abs(residual);
            });

            if (maxError < tolerance) break;
        }

        // Format Results
        return {
            tramos: Array.from(this.links.values()).map(l => {
                const diamM = l.diametro_interior / 1000;
                const area = Math.PI * Math.pow(diamM, 2) / 4;
                const v = (Math.abs(l.flow) / 1000) / area;

                // hf
                const nodeA = this.nodes.get(l.nudo_origen_id)!;
                const nodeB = this.nodes.get(l.nudo_destino_id)!;
                const hf = Math.abs(nodeA.head - nodeB.head);

                return {
                    id: l.id,
                    caudal: l.flow,
                    velocidad: v,
                    perdida_carga: hf
                };
            }),
            nudos: Array.from(this.nodes.values()).map(n => ({
                id: n.id,
                presion_calc: n.head - (n.cota_terreno || 0)
            })),
            iterations: iter,
            convergencia: maxError < tolerance,
            error_max: maxError
        };
    }
}

export function solveNetwork(nudos: Nudo[], tramos: Tramo[]) {
    const solver = new HydraulicSolver(nudos, tramos);
    return solver.solve();
}
