export type SimulationStatus = 'idle' | 'running' | 'completed' | 'error';

export interface SimulationRequest {
    network: {
        nodes: any[];
        links: any[];
        options?: any;
    };
}

export interface SimulationResult {
    nodeResults: Record<string, NodeResult>;
    linkResults: Record<string, LinkResult>;
    errors?: string[];
}

export interface NodeResult {
    id: string;
    pressure: number;
    head: number;
    demand: number;
    quality?: number;
}

export interface LinkResult {
    id: string;
    flow: number;
    velocity: number;
    headloss: number;
    status: number;
}
