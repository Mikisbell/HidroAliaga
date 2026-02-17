
import { create } from 'zustand'

import { Nudo, Tramo, Project, Scenario, CurvaCaracteristica } from '@/types/models';
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

    // Scenario Management
    scenarios: Scenario[];
    activeScenarioId: string | null;
    createScenario: (name: string, parentId?: string | null) => void;
    switchScenario: (id: string) => void;
    deleteScenario: (id: string) => void;

    // Demand Patterns
    patrones: import('@/types/models').PatronDemanda[];
    addPattern: (patron: import('@/types/models').PatronDemanda) => void;
    updatePattern: (patron: import('@/types/models').PatronDemanda) => void;
    deletePattern: (id: string) => void;
    assignPatternToNode: (nodeId: string, patternId: string | null) => void;

    // Curvas Caracteristicas
    curvas: CurvaCaracteristica[];
    addCurve: (curva: CurvaCaracteristica) => void;
    updateCurve: (curva: CurvaCaracteristica) => void;
    deleteCurve: (id: string) => void;
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

    // Validations & Engine
    simulationResults: null,
    setSimulationResults: (results) => set({ simulationResults: results }),
    simulationAlerts: [],
    setSimulationAlerts: (alerts) => set({ simulationAlerts: alerts }),

    // Curvas Caracteristicas
    curvas: [],
    addCurve: async (curva) => {
        set((state) => ({ curvas: [...state.curvas, curva] }));
        const { currentProject } = get();
        const projectId = currentProject?.id;
        if (!projectId) return;
        try {
            await import("@/app/actions/curves").then(async ({ addCurve }) => {
                const { success, data } = await addCurve(projectId, curva);
                if (!success || !data) {
                    throw new Error("Failed to add curve");
                }
                set((state) => ({
                    curvas: state.curvas.map(c => c.id === curva.id ? data : c)
                }));
            });
        } catch (error) {
            set((state) => ({ curvas: state.curvas.filter(c => c.id !== curva.id) }));
            import("sonner").then(({ toast }) => toast.error("Error al guardar la curva"));
        }
    },
    updateCurve: async (curva) => {
        const previousCurvas = get().curvas;
        set((state) => ({
            curvas: state.curvas.map((c) => (c.id === curva.id ? curva : c))
        }));
        const { currentProject } = get();
        const projectId = currentProject?.id;
        if (!projectId) return;
        try {
            await import("@/app/actions/curves").then(async ({ updateCurve }) => {
                const { success } = await updateCurve(projectId, curva.id, curva);
                if (!success) {
                    throw new Error("Failed to update curve");
                }
            });
        } catch (error) {
            set({ curvas: previousCurvas });
            import("sonner").then(({ toast }) => toast.error("Error al actualizar la curva"));
        }
    },
    deleteCurve: async (id) => {
        const previousCurvas = get().curvas;
        set((state) => ({ curvas: state.curvas.filter((c) => c.id !== id) }));
        const { currentProject } = get();
        const projectId = currentProject?.id;
        if (!projectId) return;
        try {
            await import("@/app/actions/curves").then(async ({ deleteCurve }) => {
                const { success } = await deleteCurve(projectId, id);
                if (!success) {
                    throw new Error("Failed to delete curve");
                }
            });
        } catch (error) {
            set({ curvas: previousCurvas });
            import("sonner").then(({ toast }) => toast.error("Error al eliminar la curva"));
        }
    },

    // Actions
    setProject: (project) => {
        let scenarios = project.settings?.scenarios || [];
        if (!scenarios.some(s => s.is_base)) {
            scenarios = [{
                id: crypto.randomUUID(),
                name: 'Base',
                parent_id: null,
                is_base: true,
                created_at: new Date().toISOString()
            }, ...scenarios];
        }
        set({ currentProject: project, scenarios, activeScenarioId: null, error: null });

        // Load Patterns
        if (project.id) {
            import("@/app/actions/patterns").then(async ({ getPatterns }) => {
                const { success, data } = await getPatterns(project.id);
                if (success && data) {
                    set({ patrones: data });
                }
            });
        }
    },
    setElements: (nudos, tramos) => set({ nudos, tramos }),

    addNudo: async (nudo) => {
        // Optimistic Update
        set((state) => ({ nudos: [...state.nudos, nudo] }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.post(`/proyectos/${projectId}/nudos`, nudo)
            );
        } catch (error) {
            // Rollback
            set((state) => ({ nudos: state.nudos.filter(n => n.id !== nudo.id) }));
            import("sonner").then(({ toast }) => toast.error("Error al guardar el nudo"));
        }
    },

    removeNudo: async (id) => {
        // Snapshot for rollback
        const previousNudos = get().nudos;
        // Optimistic Update
        set((state) => ({ nudos: state.nudos.filter(n => n.id !== id) }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.delete(`/proyectos/${projectId}/nudos/${id}`)
            );
        } catch (error) {
            // Rollback
            set({ nudos: previousNudos });
            import("sonner").then(({ toast }) => toast.error("Error al eliminar el nudo"));
        }
    },

    replaceNudo: (tempId, realNudo) => set((state) => ({
        nudos: state.nudos.map(n => n.id === tempId ? realNudo : n)
    })),

    updateNudo: async (nudo) => {
        // Snapshot
        const previousNudos = get().nudos;
        // Optimistic
        set((state) => ({
            nudos: state.nudos.map((n) => (n.id === nudo.id ? { ...n, ...nudo } : n))
        }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.put(`/proyectos/${projectId}/nudos/${nudo.id}`, nudo)
            );
        } catch (error) {
            set({ nudos: previousNudos });
            // Don't toast on every drag update, might be too noisy. Maybe debounce?
            // For now, silent fail on drag, or specific error handling.
            console.error("Error updating node", error);
        }
    },

    addTramo: async (tramo) => {
        set((state) => ({ tramos: [...state.tramos, tramo] }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.post(`/proyectos/${projectId}/tramos`, tramo)
            );
        } catch (error) {
            set((state) => ({ tramos: state.tramos.filter(t => t.id !== tramo.id) }));
            import("sonner").then(({ toast }) => toast.error("Error al guardar el tramo"));
        }
    },

    removeTramo: async (id) => {
        const previousTramos = get().tramos;
        set((state) => ({ tramos: state.tramos.filter(t => t.id !== id) }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.delete(`/proyectos/${projectId}/tramos/${id}`)
            );
        } catch (error) {
            set({ tramos: previousTramos });
            import("sonner").then(({ toast }) => toast.error("Error al eliminar el tramo"));
        }
    },

    updateTramo: async (tramo) => {
        const previousTramos = get().tramos;
        set((state) => ({
            tramos: state.tramos.map((t) => (t.id === tramo.id ? { ...t, ...tramo } : t))
        }));
        const { currentProject, activeScenarioId } = get();
        if (activeScenarioId) return;

        const projectId = currentProject?.id;
        if (!projectId) return;

        try {
            await import("@/lib/api-client").then(({ api }) =>
                api.put(`/proyectos/${projectId}/tramos/${tramo.id}`, tramo)
            );
        } catch (error) {
            set({ tramos: previousTramos });
            console.error("Error updating pipe", error);
        }
    },

    reorderTramos: (newOrder) => set((state) => {
        if (!state.currentProject) return {};
        const newSettings = {
            ...state.currentProject.settings,
            tramo_order: newOrder
        };
        // Ideally, we should also call the backend here to persist
        // For now, optimistic update is enough for UI
        import("@/app/actions/proyectos").then(async ({ updateProject }) => {
            if (state.currentProject?.id) {
                const res = await updateProject(state.currentProject.id, { settings: newSettings });
                if (!res.success) {
                    console.error("Failed to update project settings:", res.message);
                    // Minimal error handling for background save
                }
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
            // Use simulationStep as time (hour)
            const result = solveNetwork(state.nudos, state.tramos, state.patrones, state.curvas, state.simulationStep);

            // Merge results
            const newNudos = state.nudos.map(n => {
                const res = result.nudos.find(rn => rn.id === n.id);
                // Also update demand? For now just pressure.
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



    // Scenario Management
    scenarios: [],
    activeScenarioId: null,

    createScenario: (name, parentId) => set((state) => {
        const parent = parentId
            ? state.scenarios.find(s => s.id === parentId)
            : state.scenarios.find(s => s.is_base);

        // Deep copy parent data
        const isParentActive = (parent?.id === state.activeScenarioId) || (parent?.is_base && state.activeScenarioId === null);

        const sourceData = isParentActive
            ? { nudos: state.nudos, tramos: state.tramos }
            : parent?.snapshot || { nudos: [], tramos: [] };

        const newScenario: Scenario = {
            id: crypto.randomUUID(),
            name,
            parent_id: parent?.id || null,
            is_base: false,
            created_at: new Date().toISOString(),
            snapshot: JSON.parse(JSON.stringify(sourceData))
        };

        const updatedScenarios = [...state.scenarios, newScenario];

        // Persist to Backend
        if (state.currentProject?.id) {
            import("@/app/actions/proyectos").then(({ updateProject }) => {
                updateProject(state.currentProject!.id, {
                    settings: { ...state.currentProject!.settings, scenarios: updatedScenarios }
                });
            });
        }

        return { scenarios: updatedScenarios };
    }),

    switchScenario: (id) => set((state) => {
        if (id === state.activeScenarioId) return {};

        // Snapshot current
        const currentId = state.activeScenarioId || state.scenarios.find(s => s.is_base)?.id;

        const currentData = { nudos: state.nudos, tramos: state.tramos };

        const updatedScenarios = state.scenarios.map(s =>
            s.id === currentId ? { ...s, snapshot: currentData } : s
        );

        const target = updatedScenarios.find(s => s.id === id);
        if (!target) return {};

        // Persist snapshots to Backend
        if (state.currentProject?.id) {
            import("@/app/actions/proyectos").then(({ updateProject }) => {
                updateProject(state.currentProject!.id, {
                    settings: {
                        ...state.currentProject!.settings,
                        scenarios: updatedScenarios,
                        active_scenario_id: id // Also persist active state? Useful for reload.
                    }
                });
            });
        }

        return {
            scenarios: updatedScenarios,
            activeScenarioId: id,
            nudos: target.snapshot?.nudos || [],
            tramos: target.snapshot?.tramos || [],
            selectedElement: null
        };
    }),

    deleteScenario: (id) => set((state) => {
        if (state.activeScenarioId === id) return {};
        const updatedScenarios = state.scenarios.filter(s => s.id !== id);

        // Persist
        if (state.currentProject?.id) {
            import("@/app/actions/proyectos").then(({ updateProject }) => {
                updateProject(state.currentProject!.id, {
                    settings: { ...state.currentProject!.settings, scenarios: updatedScenarios }
                });
            });
        }

        return { scenarios: updatedScenarios };
        return { scenarios: updatedScenarios };
    }),

    // Demand Patterns
    patrones: [],

    addPattern: async (patron) => {
        set((state) => ({ patrones: [...state.patrones, patron] }));

        // Persist to Server
        try {
            await import("@/app/actions/patterns").then(({ createPattern }) =>
                createPattern(patron)
            );
        } catch (error) {
            set((state) => ({ patrones: state.patrones.filter(p => p.id !== patron.id) }));
            console.error("Failed to create pattern", error);
        }
    },

    updatePattern: async (patron) => {
        const prevPatterns = get().patrones;
        set((state) => ({
            patrones: state.patrones.map(p => p.id === patron.id ? patron : p)
        }));

        try {
            await import("@/app/actions/patterns").then(({ updatePattern }) =>
                updatePattern(patron.id, patron)
            );
        } catch (error) {
            set({ patrones: prevPatterns });
            console.error("Failed to update pattern", error);
        }
    },

    deletePattern: async (id) => {
        const prevPatterns = get().patrones;
        set((state) => ({
            patrones: state.patrones.filter(p => p.id !== id),
            // Also clear assignments from nodes locally? Optional, maybe keep ID ref.
            nudos: state.nudos.map(n => n.patron_demanda_id === id ? { ...n, patron_demanda_id: null } : n)
        }));

        try {
            await import("@/app/actions/patterns").then(({ deletePattern }) =>
                deletePattern(id)
            );
        } catch (error) {
            set({ patrones: prevPatterns });
            console.error("Failed to delete pattern", error);
        }
    },

    assignPatternToNode: async (nodeId, patternId) => {
        const prevNudos = get().nudos;
        set((state) => ({
            nudos: state.nudos.map(n => n.id === nodeId ? { ...n, patron_demanda_id: patternId } : n)
        }));

        const project = get().currentProject;
        if (!project) return;

        try {
            await import("@/app/actions/nudos").then(({ updateNudo }) =>
                updateNudo(nodeId, { patron_demanda_id: patternId })
            );
        } catch (error) {
            set({ nudos: prevNudos });
            console.error("Failed to assign pattern", error);
        }
    }
}));
