// Types for the Simulation Engine
export type IterationStep = {
    step: number
    description: string // "Iteration 1: Error 0.05"
    type: 'info' | 'error' | 'success'
    timestamp: number
    details?: any // Full iteration data for inspection
    affectedNodes?: string[] // IDs of nodes to highlight
    affectedPipes?: string[] // IDs of pipes to highlight
}

export type SimulationState = {
    simulationMode: 'design' | 'simulation'
    simulationStatus: 'stopped' | 'playing' | 'paused'
    simulationSpeed: number // ms delay
    simulationStep: number // current step index
    simulationLog: IterationStep[]
}
