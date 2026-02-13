
import { create } from 'zustand'

import { Nudo, Tramo, Project } from '@/types/models';
import { IterationStep } from "@/types/simulation"

interface ProjectState {
    currentProject: Project | null;
    nudos: Nudo[];
    tramos: Tramo[];
    isLoading: boolean;
    error: string | null;

    // Interaction State
    activeTool: 'select' | 'node' | 'pipe';
    setActiveTool: (tool: 'select' | 'node' | 'pipe') => void;
    activeComponentType: Nudo['tipo'] | null;
    setActiveComponentType: (type: Nudo['tipo'] | null) => void;
    startNodeId: string | null;
    setStartNodeId: (id: string | null) => void;
    selectedElement: { id: string; type: 'nudo' | 'tramo' } | null;
    setSelectedElement: (element: { id: string; type: 'nudo' | 'tramo' } | null) => void;

    // Simulation State
    simulationMode: 'design' | 'simulation';
    simulationStatus: 'stopped' | 'playing' | 'paused';
    simulationSpeed: number;
    simulationStep: number;
    simulationLog: IterationStep[];

    // UI/Layout State
    activeView: 'design' | 'data' | 'simulation';
    isGridOpen: boolean;
    setActiveView: (view: 'design' | 'data' | 'simulation') => void;
    setGridOpen: (isOpen: boolean) => void;

    // Simulation Actions
    setSimulationMode: (mode: 'design' | 'simulation') => void;
    setSimulationStatus: (status: 'stopped' | 'playing' | 'paused') => void;
    setSimulationStep: (step: number) => void;
    setSimulationLog: (log: IterationStep[]) => void;
    resetSimulation: () => void;

    // Actions
    setProject: (project: Project) => void;
    setElements: (nudos: Nudo[], tramos: Tramo[]) => void; // Batch update
    addNudo: (nudo: Nudo) => void;
    removeNudo: (id: string) => void;
    replaceNudo: (tempId: string, realNudo: Nudo) => void;
    updateNudo: (nudo: Nudo) => void;
    reorderTramos: (newOrder: string[]) => void;
    addTramo: (tramo: Tramo) => void;
    removeTramo: (id: string) => void;
    updateTramo: (tramo: Tramo) => void;
    updateProjectSettings: (settings: import('@/types/models').ProjectSettings) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearProject: () => void;
    calculateHydraulics: () => void;
    // New Hydraulic Engine State
    simulationResults: import('@/lib/hydraulics/engine/types').SimulationResult | null;
    setSimulationResults: (results: import('@/lib/hydraulics/engine/types').SimulationResult | null) => void;

    // Validation State (The Referee)
    simulationAlerts: import('@/lib/hydraulics/validator').ValidationResult[];
    setSimulationAlerts: (alerts: import('@/lib/hydraulics/validator').ValidationResult[]) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    currentProject: null,
    nudos: [],
    tramos: [],
    isLoading: false,
    error: null,

    // Interaction State
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool }),
    activeComponentType: null,
    setActiveComponentType: (type) => set({ activeComponentType: type }),
    startNodeId: null,
    setStartNodeId: (id) => set({ startNodeId: id }),
    selectedElement: null,
    setSelectedElement: (element) => set({ selectedElement: element }),

    // Simulation Defaults
    simulationMode: 'design',
    simulationStatus: 'stopped',
    simulationSpeed: 1000,
    simulationStep: 0,
    simulationLog: [],

    // UI Defaults
    activeView: 'design',
    isGridOpen: true,
    setActiveView: (view) => set({ activeView: view }),
    setGridOpen: (isOpen) => set({ isGridOpen: isOpen }),

    setSimulationMode: (mode) => set({ simulationMode: mode }),
    setSimulationStatus: (status) => set({ simulationStatus: status }),
    setSimulationStep: (step) => set({ simulationStep: step }),
    setSimulationLog: (log) => set({ simulationLog: log }),
    resetSimulation: () => set({
        simulationStatus: 'stopped',
        simulationStep: 0,
        simulationLog: [],
        simulationMode: 'design'
    }),

    setProject: (project) => set({ currentProject: project, error: null }),
    setElements: (nudos, tramos) => set({ nudos, tramos }),
    addNudo: (nudo) => set((state) => ({ nudos: [...state.nudos, nudo] })),
    removeNudo: (id) => set((state) => ({ nudos: state.nudos.filter(n => n.id !== id) })),
    replaceNudo: (tempId, realNudo) => set((state) => ({
        nudos: state.nudos.map(n => n.id === tempId ? realNudo : n)
    })),
    updateNudo: (nudo) => set((state) => ({
        nudos: state.nudos.map((n) => (n.id === nudo.id ? { ...n, ...nudo } : n))
    })),
    addTramo: (tramo) => set((state) => ({ tramos: [...state.tramos, tramo] })),
    removeTramo: (id) => set((state) => ({ tramos: state.tramos.filter(t => t.id !== id) })),
    updateTramo: (tramo) => set((state) => ({
        tramos: state.tramos.map((t) => (t.id === tramo.id ? { ...t, ...tramo } : t))
    })),
    reorderTramos: (newOrder) => set((state) => {
        if (!state.currentProject) return {};
        const newSettings = {
            ...state.currentProject.settings,
            tramo_order: newOrder
        };
        // Ideally, we should also call the backend here to persist
        // For now, optimistic update is enough for UI
        import("@/app/actions/proyectos").then(({ updateProject }) => {
            if (state.currentProject?.id) {
                updateProject(state.currentProject.id, { settings: newSettings });
            }
        });

        return {
            currentProject: { ...state.currentProject, settings: newSettings }
        };
    }),
    updateProjectSettings: (settings) => set((state) => ({
        currentProject: state.currentProject ? { ...state.currentProject, settings } : null
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearProject: () => set({ currentProject: null, nudos: [], tramos: [], error: null, isLoading: false }),

    calculateHydraulics: () => {
        set({ isLoading: true });
        // Import dynamically to avoid SSR issues if any, though solver is pure JS.
        import('@/lib/hydraulics/solver').then(({ solveNetwork }) => {
            const state = get();
            const result = solveNetwork(state.nudos, state.tramos);

            // Merge results
            const newNudos = state.nudos.map(n => {
                const res = result.nudos.find(rn => rn.id === n.id);
                return res ? { ...n, presion_calc: res.presion_calc } : n;
            });

            const newTramos = state.tramos.map(t => {
                const res = result.tramos.find(rt => rt.id === t.id);
                return res ? { ...t, caudal: res.caudal, velocidad: res.velocidad, perdida_carga: res.perdida_carga } : t;
            });

            set({ nudos: newNudos, tramos: newTramos, isLoading: false });

            // === FASE 3: EL ÁRBITRO (VALIDACIÓN) ===
            import('@/lib/hydraulics/validator').then(({ validateHydraulics }) => {
                const currentProject = get().currentProject;
                if (currentProject) {
                    const alerts = validateHydraulics(currentProject, newNudos, newTramos);
                    set({ simulationAlerts: alerts });
                }
            });

        }).catch(err => {
            console.error(err);
            set({ error: "Error en cálculo hidráulico", isLoading: false });
        });
    },

    // New Hydraulic Engine
    simulationResults: null,
    setSimulationResults: (results) => set({ simulationResults: results }),

    // Validation (The Referee)
    simulationAlerts: [],
    setSimulationAlerts: (alerts) => set({ simulationAlerts: alerts })
}));
