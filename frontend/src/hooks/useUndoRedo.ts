"use client"

import { useCallback, useRef, useEffect } from 'react'
import { useProjectStore } from '@/store/project-store'
import { Nudo, Tramo } from '@/types/models'

interface Snapshot {
    nudos: Nudo[]
    tramos: Tramo[]
}

const MAX_HISTORY = 30

/**
 * Undo/Redo hook for the network designer.
 * Takes snapshots of { nudos, tramos } from the Zustand store.
 * Call `takeSnapshot()` before any mutation.
 */
export function useUndoRedo() {
    const past = useRef<Snapshot[]>([])
    const future = useRef<Snapshot[]>([])

    const setElements = useProjectStore(state => state.setElements)

    const getCurrentSnapshot = useCallback((): Snapshot => {
        const state = useProjectStore.getState()
        return {
            nudos: [...state.nudos],
            tramos: [...state.tramos],
        }
    }, [])

    /** Call BEFORE performing a mutation. Saves current state to undo stack. */
    const takeSnapshot = useCallback(() => {
        const snapshot = getCurrentSnapshot()
        past.current = [...past.current.slice(-MAX_HISTORY + 1), snapshot]
        future.current = [] // Clear redo on new action
    }, [getCurrentSnapshot])

    /** Undo: restore previous state */
    const undo = useCallback(() => {
        if (past.current.length === 0) return

        const current = getCurrentSnapshot()
        future.current = [...future.current, current]

        const previous = past.current[past.current.length - 1]
        past.current = past.current.slice(0, -1)

        setElements(previous.nudos, previous.tramos)
    }, [getCurrentSnapshot, setElements])

    /** Redo: restore next state */
    const redo = useCallback(() => {
        if (future.current.length === 0) return

        const current = getCurrentSnapshot()
        past.current = [...past.current, current]

        const next = future.current[future.current.length - 1]
        future.current = future.current.slice(0, -1)

        setElements(next.nudos, next.tramos)
    }, [getCurrentSnapshot, setElements])

    const canUndo = past.current.length > 0
    const canRedo = future.current.length > 0

    // Auto-snapshot on Zustand store mutations
    // We listen for changes and debounce snapshots
    const lastSnapshotRef = useRef<string>('')

    useEffect(() => {
        const unsub = useProjectStore.subscribe((state) => {
            const key = JSON.stringify({ n: state.nudos.length, t: state.tramos.length })
            if (key !== lastSnapshotRef.current) {
                // Only snapshot if count changed (add/remove, not position updates)
                if (lastSnapshotRef.current !== '') {
                    // Don't snapshot the initial load
                    const prev: Snapshot = {
                        nudos: [...state.nudos],
                        tramos: [...state.tramos],
                    }
                    // Only add if different from last snapshot
                    if (past.current.length === 0 ||
                        JSON.stringify(past.current[past.current.length - 1]) !== JSON.stringify(prev)) {
                        past.current = [...past.current.slice(-MAX_HISTORY + 1), prev]
                        future.current = []
                    }
                }
                lastSnapshotRef.current = key
            }
        })
        return unsub
    }, [])

    return { undo, redo, canUndo, canRedo, takeSnapshot }
}
