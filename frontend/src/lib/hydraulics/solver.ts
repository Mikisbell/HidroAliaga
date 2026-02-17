

import { Nudo, Tramo, PatronDemanda, CurvaCaracteristica } from "@/types/models";

export interface HydraulicResult {
    tramos: TramoResult[];
    nudos: NodeResult[];
    iterations: number;
    convergencia: boolean;
    error_max: number;
    time?: number;
}

interface TramoResult { id: string; caudal: number; velocidad: number; perdida_carga: number; estado?: string }
interface NodeResult { id: string; presion_calc: number; demanda_actual: number; head: number }

class HydraulicSolver {
    private nodes: Map<string, Nudo & { head: number; currentDemand: number }>;
    private links: Map<string, Tramo & { flow: number }>;
    private adjacency: Map<string, string[]>; // NodeID -> LinkIDs
    private patterns: Map<string, number[]>; // PatternID -> Multipliers
    private curves: Map<string, CurvaCaracteristica>;

    constructor(nudos: Nudo[], tramos: Tramo[], patterns: PatronDemanda[] = [], curves: CurvaCaracteristica[] = []) {
        this.patterns = new Map(patterns.map(p => [p.id, p.multiplicadores]));
        this.curves = new Map(curves.map(c => [c.id, c]));

        this.nodes = new Map(nudos.map(n => [n.id, {
            ...n,
            head: n.tipo === 'reservorio' ? (n.elevacion || (n.cota_terreno || 0)) : ((n.cota_terreno || 0) + 10), // Initial guess
            currentDemand: n.demanda_base || 0
        }]));

        this.links = new Map(tramos.map(t => [t.id, { ...t, flow: 1 }])); // Initial guess 1 L/s

        this.adjacency = new Map();
        nudos.forEach(n => this.adjacency.set(n.id, []));
        tramos.forEach(t => {
            if (this.adjacency.has(t.nudo_origen_id)) this.adjacency.get(t.nudo_origen_id)!.push(t.id);
            if (this.adjacency.has(t.nudo_destino_id)) this.adjacency.get(t.nudo_destino_id)!.push(t.id);
        });
    }

    private getPumpHead(curveId: string | undefined, flow: number): number {
        if (!curveId) return 0; // Default pump curve? Or zero gain.
        const curve = this.curves.get(curveId);
        if (!curve || curve.puntos.length === 0) return 0;

        // Linear interpolation
        // Flow is in L/s, points.x should be in L/s
        const q = Math.abs(flow);
        const points = curve.puntos.sort((a, b) => a.x - b.x);

        if (q <= points[0].x) return points[0].y;
        if (q >= points[points.length - 1].x) return points[points.length - 1].y; // Flat line after max or extrapolate?

        for (let i = 0; i < points.length - 1; i++) {
            if (q >= points[i].x && q <= points[i + 1].x) {
                const slope = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
                return points[i].y + slope * (q - points[i].x);
            }
        }
        return 0;
    }

    public solve(time: number = 0, maxIterations = 200, tolerance = 0.001): HydraulicResult {
        // 0. Apply Patterns to Demands
        this.nodes.forEach(node => {
            let multiplier = 1.0;
            if (node.patron_demanda_id && this.patterns.has(node.patron_demanda_id)) {
                const p = this.patterns.get(node.patron_demanda_id)!;
                const hourIndex = Math.floor(time) % 24;
                multiplier = p[hourIndex] ?? 1.0;
            }
            node.currentDemand = (node.demanda_base || 0) * multiplier;
        });

        let iter = 0;
        let maxError = 0;

        for (iter = 0; iter < maxIterations; iter++) {
            maxError = 0;

            // Update heads
            this.nodes.forEach(node => {
                if (node.tipo === 'reservorio') return; // Fixed head

                let sumQ_in = 0;
                let sumConductance = 0;

                const connectedLinkIds = this.adjacency.get(node.id) || [];
                connectedLinkIds.forEach(linkId => {
                    const link = this.links.get(linkId)!;
                    const isOrigin = link.nudo_origen_id === node.id;
                    const neighborId = isOrigin ? link.nudo_destino_id : link.nudo_origen_id;
                    const neighbor = this.nodes.get(neighborId)!;

                    let neighborHead = neighbor.head;
                    let canFlow = true;

                    // --- COMPONENT LOGIC ---

                    // 1. PUMPS
                    if (link.tipo === 'bomba') {
                        // Estimate Flow from last iteration or Head Diff
                        // If pumping FROM neighbor TO node: Gain adds to neighborHead
                        // If pumping FROM node TO neighbor: Gain subtracts (but actually we only care about incoming)

                        // Direction: nudo_origen -> nudo_destino
                        const isPumpingIn = link.nudo_destino_id === node.id;

                        // Check Valve Check: Pumps usually have Check Valves
                        if (!isPumpingIn && neighbor.head > node.head) {
                            // Trying to flow Backwards through pump -> Blocked
                            canFlow = false;
                        }

                        if (canFlow) {
                            const q_est = link.flow; // Last iteration flow
                            const headGain = this.getPumpHead(link.curva_bomba_id!, q_est);

                            if (isPumpingIn) {
                                neighborHead += headGain;
                            } else {
                                neighborHead -= headGain;
                            }
                        }
                    }

                    // 2. VALVES (PRV)
                    // Simplified PRV Logic:
                    // If node is Downstream: if UpstreamHead > Setting, effectively connected to reservoir at Setting?
                    if (link.tipo === 'valvula') {
                        const setting = link.consigna_valvula || 0; // Pressure Setting (m)
                        const settingHead = (node.cota_terreno || 0) + setting; // Head

                        // Only consider flow if Open
                        if (link.estado_inicial === 'closed') canFlow = false;

                        if (link.tipo_valvula === 'PRV' && canFlow) {
                            const isDownstream = link.nudo_destino_id === node.id;
                            if (isDownstream) {
                                // PRV controls this node's pressure
                                // If Upstream (Neighbor) Head > Setting Head -> Pipe behaves like it delivers Setting Head
                                // But only if we are the downstream node.
                                if (neighbor.head > settingHead) {
                                    // PRV Active: It "throttles" to deliver exactly SettingHead
                                    // Treat neighbor as if it has SettingHead?
                                    // Or better: Just force this node to SettingHead in a post-step?
                                    // For conductance method: Neighbor appears to have SettingHead
                                    neighborHead = settingHead;
                                } else {
                                    // PRV Open: Acts as pipe
                                }
                            } else {
                                // We are Upstream node. 
                                // Flow depends on downstream. If Check Valve, prevent backflow.
                                if (node.head < neighbor.head) canFlow = false; // Check valve
                            }
                        }
                    }

                    if (!canFlow) return;

                    // --- PIPES (Hazen-Williams) ---
                    const L = link.longitud || 1;
                    const D = (link.diametro_interior || 50) / 1000;
                    const C = link.coef_hazen_williams || 140;

                    // k = 0.2785 * C * D^2.63 * L^-0.54
                    const k = 0.2785 * C * Math.pow(D, 2.63) * Math.pow(L, -0.54);

                    let dH = Math.abs(neighborHead - node.head);
                    if (dH < 0.001) dH = 0.001;

                    // G = k * |dH|^-0.46
                    const G = k * Math.pow(dH, -0.46);

                    sumQ_in += G * neighborHead;
                    sumConductance += G;
                });

                if (sumConductance > 0) {
                    const newHead = (sumQ_in - node.currentDemand) / sumConductance;

                    // Damping
                    const damping = 0.6;
                    const nextHead = node.head * (1 - damping) + newHead * damping;

                    const diff = Math.abs(nextHead - node.head);
                    if (diff > maxError) maxError = diff;

                    node.head = nextHead;
                }
            });

            // Update Link Flows for next iteration
            this.links.forEach(link => {
                const nodeA = this.nodes.get(link.nudo_origen_id)!;
                const nodeB = this.nodes.get(link.nudo_destino_id)!;

                let headA = nodeA.head;
                let headB = nodeB.head;

                // Adjust heads for result calculation if Pump
                // (Flow calc needs real heads + pump gain)
                let addedHead = 0;
                if (link.tipo === 'bomba') {
                    const q_est = link.flow;
                    addedHead = this.getPumpHead(link.curva_bomba_id!, q_est);
                    // If calculating flow A->B, and pump is A->B, then Effective Head A is higher?
                    // DeltaH = (Ha + Hpump) - Hb
                    headA += addedHead;
                }

                // PRV logic for flow calculation... simplified
                if (link.tipo === 'valvula' && link.tipo_valvula === 'PRV') {
                    const settingHead = (nodeB.cota_terreno || 0) + (link.consigna_valvula || 0);
                    if (headA > settingHead) {
                        // Effective head drop across valve ensures Hb = SettingHead
                        // But here we just compute flow based on available head?
                        // Actually PRV makes flow equal to demand downstream.
                        // For simple visualization:
                        if (headB > settingHead) {
                            // Should not happen if solver works, unless heavy demand
                        }
                    }
                }

                const dH = headA - headB;
                const L = link.longitud || 0.1;
                const D = (link.diametro_interior || 50) / 1000;
                const C = link.coef_hazen_williams || 140;
                const k = 0.2785 * C * Math.pow(D, 2.63) * Math.pow(L, -0.54);

                const q = k * Math.pow(Math.abs(dH), 0.54) * Math.sign(dH);
                link.flow = q * 1000; // L/s
            });

            if (maxError < tolerance) break;
        }

        return {
            tramos: Array.from(this.links.values()).map(l => ({
                id: l.id,
                caudal: l.flow,
                velocidad: (Math.abs(l.flow) / 1000) / (Math.PI * Math.pow((l.diametro_interior / 1000) / 2, 2)),
                perdida_carga: Math.abs(this.nodes.get(l.nudo_origen_id)!.head - this.nodes.get(l.nudo_destino_id)!.head),
                estado: l.tipo === 'valvula' ? (l.flow === 0 ? 'Closed' : 'Active') : 'Open'
            })),
            nudos: Array.from(this.nodes.values()).map(n => ({
                id: n.id,
                presion_calc: n.head - (n.cota_terreno || 0),
                demanda_actual: n.currentDemand,
                head: n.head
            })),
            iterations: iter,
            convergencia: maxError < tolerance,
            error_max: maxError,
            time
        };
    }
}

export function solveNetwork(nudos: Nudo[], tramos: Tramo[], patterns: PatronDemanda[] = [], curves: CurvaCaracteristica[] = [], time: number = 0) {
    const solver = new HydraulicSolver(nudos, tramos, patterns, curves);
    return solver.solve(time);
}

export function runExtendedPeriodSimulation(nudos: Nudo[], tramos: Tramo[], patterns: PatronDemanda[], curves: CurvaCaracteristica[]) {
    const solver = new HydraulicSolver(nudos, tramos, patterns, curves);
    const results = [];
    for (let h = 0; h < 24; h++) {
        results.push(solver.solve(h));
    }
    return results;
}

