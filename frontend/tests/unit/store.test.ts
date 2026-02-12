import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '@/store/project-store'

describe('useProjectStore', () => {
    beforeEach(() => {
        // Reset store between tests
        useProjectStore.getState().clearProject()
    })

    it('should initialize with empty state', () => {
        const state = useProjectStore.getState()
        expect(state.currentProject).toBeNull()
        expect(state.nudos).toHaveLength(0)
        expect(state.tramos).toHaveLength(0)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
    })

    it('should set project data', () => {
        const project = {
            id: 'p1',
            nombre: 'Test Project',
            ambito: 'urbano',
            estado: 'borrador',
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            usuario_id: 'u1',
            settings: {} as any
        }

        useProjectStore.getState().setProject(project)

        const state = useProjectStore.getState()
        expect(state.currentProject).toEqual(project)
        expect(state.error).toBeNull()
    })

    it('should set elements (nudos and tramos)', () => {
        const nudos = [
            { id: 'n1', codigo: 'N-1', tipo: 'nudo', proyecto_id: 'p1' },
            { id: 'n2', codigo: 'N-2', tipo: 'reservorio', proyecto_id: 'p1' },
        ] as any[]

        const tramos = [
            { id: 't1', codigo: 'T-1', nudo_origen_id: 'n1', nudo_destino_id: 'n2', proyecto_id: 'p1' },
        ] as any[]

        useProjectStore.getState().setElements(nudos, tramos)

        const state = useProjectStore.getState()
        expect(state.nudos).toHaveLength(2)
        expect(state.tramos).toHaveLength(1)
        expect(state.nudos[0].codigo).toBe('N-1')
    })

    it('should add a nudo', () => {
        const nudo = { id: 'n1', codigo: 'N-1', tipo: 'nudo', proyecto_id: 'p1' } as any
        useProjectStore.getState().addNudo(nudo)

        expect(useProjectStore.getState().nudos).toHaveLength(1)
        expect(useProjectStore.getState().nudos[0].codigo).toBe('N-1')
    })

    it('should update an existing nudo', () => {
        const nudo = { id: 'n1', codigo: 'N-1', tipo: 'nudo', cota_terreno: 100 } as any
        useProjectStore.getState().addNudo(nudo)

        const updatedNudo = { ...nudo, cota_terreno: 200 }
        useProjectStore.getState().updateNudo(updatedNudo)

        expect(useProjectStore.getState().nudos[0].cota_terreno).toBe(200)
    })

    it('should clear project and reset all state', () => {
        const project = {
            id: 'p1', nombre: 'Test', ambito: 'rural', estado: 'activo',
            created_at: '', updated_at: '', usuario_id: 'u1',
            settings: {} as any
        }
        useProjectStore.getState().setProject(project)
        useProjectStore.getState().addNudo({ id: 'n1', codigo: 'N-1' } as any)
        useProjectStore.getState().setError('some error')

        useProjectStore.getState().clearProject()

        const state = useProjectStore.getState()
        expect(state.currentProject).toBeNull()
        expect(state.nudos).toHaveLength(0)
        expect(state.tramos).toHaveLength(0)
        expect(state.error).toBeNull()
        expect(state.isLoading).toBe(false)
    })

    it('should handle loading state', () => {
        useProjectStore.getState().setLoading(true)
        expect(useProjectStore.getState().isLoading).toBe(true)

        useProjectStore.getState().setLoading(false)
        expect(useProjectStore.getState().isLoading).toBe(false)
    })

    it('should handle error state', () => {
        useProjectStore.getState().setError('Network error')
        expect(useProjectStore.getState().error).toBe('Network error')

        useProjectStore.getState().setError(null)
        expect(useProjectStore.getState().error).toBeNull()
    })
})
