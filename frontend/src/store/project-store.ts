
import { create } from 'zustand';

import { Nudo, Tramo } from '@/types/models';

interface Project {
    id: string;
    nombre: string;
    descripcion?: string;
    ambito: string;
    estado: string;
    created_at: string;
    updated_at: string;
    usuario_id: string;
    // Add other fields as needed matching DB schema
}

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

    // Actions
    setProject: (project: Project) => void;
    setElements: (nudos: Nudo[], tramos: Tramo[]) => void; // Batch update
    addNudo: (nudo: Nudo) => void;
    updateNudo: (nudo: Nudo) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearProject: () => void;
    calculateHydraulics: () => void;
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

    setProject: (project) => set({ currentProject: project, error: null }),
    setElements: (nudos, tramos) => set({ nudos, tramos }),
    addNudo: (nudo) => set((state) => ({ nudos: [...state.nudos, nudo] })),
    updateNudo: (nudo) => set((state) => ({
        nudos: state.nudos.map((n) => (n.id === nudo.id ? { ...n, ...nudo } : n))
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
        }).catch(err => {
            console.error(err);
            set({ error: "Error en cálculo hidráulico", isLoading: false });
        });
    }
}));
