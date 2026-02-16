
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjectStore } from '../project-store'
import { Nudo, Project } from '@/types/models'

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => Math.random().toString(36).substring(7)
    }
})

// Mock Server Actions
vi.mock('@/app/actions/proyectos', () => ({
    updateProject: vi.fn().mockResolvedValue({ success: true })
}))


describe('ProjectStore Scenarios', () => {
    beforeEach(() => {
        useProjectStore.getState().clearProject()
        // Initialize valid project state
        useProjectStore.setState({
            currentProject: {
                id: 'proj-1',
                nombre: 'Test Project',
                settings: { scenarios: [] }
            } as any,
            nudos: [],
            tramos: [],
            scenarios: [], // Will be init by setProject logic if we call it, or manually set
            activeScenarioId: null
        })

        // Simulate setProject initialization logic manually or via action if possible
        // But the store action setProject has logic to init scenarios.
        useProjectStore.getState().setProject({
            id: 'proj-1',
            nombre: 'Test Project',
            settings: { scenarios: [] }
        } as any)
    })

    it('should initialize with a Base scenario', () => {
        const { scenarios, activeScenarioId } = useProjectStore.getState()
        expect(scenarios).toHaveLength(1)
        expect(scenarios[0].is_base).toBe(true)
        expect(scenarios[0].name).toBe('Base')
        expect(activeScenarioId).toBeNull() // Null means Base is active
    })

    const createMockNode = (id: string, codigo: string): Nudo => ({
        id,
        codigo,
        tipo: 'union',
        proyecto_id: 'p1',
        cota_source: 'manual',
        demanda_base: 0,
        elevacion: 0,
        presion_minima_verificada: false,
        es_critico: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })

    it('should create a child scenario', () => {
        const store = useProjectStore.getState()
        const baseId = store.scenarios[0].id

        store.createScenario('Child A', baseId)

        // Fetch fresh state
        const { scenarios } = useProjectStore.getState()
        expect(scenarios).toHaveLength(2)
        const child = scenarios.find(s => s.name === 'Child A')
        expect(child).toBeDefined()
        expect(child?.parent_id).toBe(baseId)
    })

    it('should inherit data when creating child', () => {
        // Setup Base Data
        const node1 = createMockNode('n1', 'J-1')
        useProjectStore.setState({ nudos: [node1] })

        // Create Child
        useProjectStore.getState().createScenario('Child B')

        // Switch to Child
        const freshScenarios = useProjectStore.getState().scenarios
        const childId = freshScenarios.find(s => s.name === 'Child B')!.id
        useProjectStore.getState().switchScenario(childId)

        // Verify loaded data
        const { nudos, activeScenarioId } = useProjectStore.getState()
        expect(activeScenarioId).toBe(childId)
        expect(nudos).toHaveLength(1)
        expect(nudos[0].id).toBe('n1')
    })

    it('should isolate changes in child scenario', () => {
        // Setup Base
        const nodeBase = createMockNode('base-1', 'B-1')
        useProjectStore.setState({ nudos: [nodeBase] })

        // Create & Switch to Child
        useProjectStore.getState().createScenario('Child C')
        const childId = useProjectStore.getState().scenarios.find(s => s.name === 'Child C')!.id
        useProjectStore.getState().switchScenario(childId)

        // Add Node to Child
        const nodeChild = createMockNode('child-1', 'C-1')
        useProjectStore.getState().addNudo(nodeChild)

        // Verify Child State
        expect(useProjectStore.getState().nudos).toHaveLength(2)

        // Switch back to Base
        const baseId = useProjectStore.getState().scenarios.find(s => s.is_base)!.id
        useProjectStore.getState().switchScenario(baseId)

        // Verify Base State
        const stateArgs = useProjectStore.getState()
        // If logic sets it to null for Base, we check that.
        // Let's assume implementation in store sets activeScenarioId based on passed ID.
        // If passed ID is baseId, then activeScenarioId should be baseId (or null if logic normalizes it).
        // My implementation: switchScenario(id) => set({ activeScenarioId: id }).

        expect(stateArgs.nudos).toHaveLength(1)
        expect(stateArgs.nudos[0].id).toBe('base-1')

        // Switch back to Child
        useProjectStore.getState().switchScenario(childId)
        expect(useProjectStore.getState().nudos).toHaveLength(2)
    })

    it('should handle multi-level inheritance', () => {
        // Base: 1 node
        useProjectStore.setState({ nudos: [createMockNode('n1', 'N1')] })

        // Child 1
        useProjectStore.getState().createScenario('Child 1')
        const child1 = useProjectStore.getState().scenarios.find(s => s.name === 'Child 1')!
        useProjectStore.getState().switchScenario(child1.id)
        useProjectStore.getState().addNudo(createMockNode('n2', 'N2')) // Total 2

        // Child 2 (of Child 1)
        useProjectStore.getState().createScenario('Child 2', child1.id)
        const child2 = useProjectStore.getState().scenarios.find(s => s.name === 'Child 2')!
        useProjectStore.getState().switchScenario(child2.id)

        // Verify Child 2 starts with 2 nodes (inherited from Child 1)
        expect(useProjectStore.getState().nudos).toHaveLength(2)

        // Modify Child 2
        useProjectStore.getState().addNudo(createMockNode('n3', 'N3')) // Total 3

        // Verify
        expect(useProjectStore.getState().nudos).toHaveLength(3)

        // Switch to Child 1
        useProjectStore.getState().switchScenario(child1.id)
        expect(useProjectStore.getState().nudos).toHaveLength(2)

        // Switch to Base
        const base = useProjectStore.getState().scenarios.find(s => s.is_base)!
        useProjectStore.getState().switchScenario(base.id)
        expect(useProjectStore.getState().nudos).toHaveLength(1)
    })
})
