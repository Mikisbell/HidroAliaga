
import { useProjectStore } from "@/store/project-store";
import { Nudo, Tramo } from "@/types/models";
import { useMemo } from "react";

export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ScenarioDiff {
    nodes: Record<string, ChangeType>;
    links: Record<string, ChangeType>;
    hasChanges: boolean;
}

export function useScenarioDiff(): ScenarioDiff {
    const activeScenarioId = useProjectStore(state => state.activeScenarioId);
    const scenarios = useProjectStore(state => state.scenarios);
    const currentNodes = useProjectStore(state => state.nudos);
    const currentLinks = useProjectStore(state => state.tramos);

    return useMemo(() => {
        if (!activeScenarioId) {
            return { nodes: {}, links: {}, hasChanges: false };
        }

        const activeScenario = scenarios.find(s => s.id === activeScenarioId);
        if (!activeScenario || !activeScenario.parent_id) {
            // No parent to compare against (or it's a root scenario acting as base?)
            // Usually base has no parent.
            return { nodes: {}, links: {}, hasChanges: false };
        }

        // Find parent scenario
        const parentScenario = scenarios.find(s => s.id === activeScenario.parent_id);
        if (!parentScenario) {
            return { nodes: {}, links: {}, hasChanges: false };
        }

        // Parent Snapshot
        // If parent is the base scenario, and we are editing it? No, if we are in child, parent is static snapshot.
        const parentNodes = parentScenario.snapshot?.nudos || [];
        const parentLinks = parentScenario.snapshot?.tramos || [];

        const nodeChanges: Record<string, ChangeType> = {};
        const linkChanges: Record<string, ChangeType> = {};
        let hasChanges = false;

        // 1. Compare Nodes
        // Map parent nodes for quick lookup
        const parentNodeMap = new Map(parentNodes.map(n => [n.id, n]));
        const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

        // Check Modified or Added
        currentNodes.forEach(node => {
            const parentNode = parentNodeMap.get(node.id);
            if (!parentNode) {
                nodeChanges[node.id] = 'added';
                hasChanges = true;
            } else {
                // Compare properties (shallow compare of relevant fields)
                if (areNodesDifferent(node, parentNode)) {
                    nodeChanges[node.id] = 'modified';
                    hasChanges = true;
                } else {
                    nodeChanges[node.id] = 'unchanged';
                }
            }
        });

        // Check Removed
        parentNodes.forEach(node => {
            if (!currentNodeMap.has(node.id)) {
                nodeChanges[node.id] = 'removed';
                hasChanges = true;
            }
        });

        // 2. Compare Links
        const parentLinkMap = new Map(parentLinks.map(l => [l.id, l]));
        const currentLinkMap = new Map(currentLinks.map(l => [l.id, l]));

        currentLinks.forEach(link => {
            const parentLink = parentLinkMap.get(link.id);
            if (!parentLink) {
                linkChanges[link.id] = 'added';
                hasChanges = true;
            } else {
                if (areLinksDifferent(link, parentLink)) {
                    linkChanges[link.id] = 'modified';
                    hasChanges = true;
                } else {
                    linkChanges[link.id] = 'unchanged';
                }
            }
        });

        parentLinks.forEach(link => {
            if (!currentLinkMap.has(link.id)) {
                linkChanges[link.id] = 'removed';
                hasChanges = true;
            }
        });

        return { nodes: nodeChanges, links: linkChanges, hasChanges };

    }, [activeScenarioId, scenarios, currentNodes, currentLinks]);
}

function areNodesDifferent(a: Nudo, b: Nudo): boolean {
    // List of fields that constitute a "hydraulic/design" change
    const fields: (keyof Nudo)[] = [
        'nombre', 'tipo', 'elevacion', 'demanda_base', 'patron_demanda_id',
        'cota_terreno'
    ];

    for (const key of fields) {
        // Simple equality
        if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return true;
    }
    return false;
}

function areLinksDifferent(a: Tramo, b: Tramo): boolean {
    const fields: (keyof Tramo)[] = [
        'diametro_interior', 'longitud', 'material',
        'coef_hazen_williams',
        'estado_inicial', 'tipo_valvula'
    ];

    for (const key of fields) {
        if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return true;
    }
    return false;
}
