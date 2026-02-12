import { useState, useCallback } from 'react';
import { hydraulicService } from './HydraulicService';
import { SimulationResult } from './types';
import { toast } from 'sonner';

export function useHydraulicSimulation() {
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState<SimulationResult | null>(null);

    const runSimulation = useCallback(async (projectData: any) => {
        setIsCalculating(true);
        try {
            // In a real scenario, we would transform projectData to the format expected by the worker
            // utilizing a helper like 'projectToInp(projectData)'
            // For now, we pass it directly or as a mock
            const request = {
                network: projectData // Todo: Transform this
            };

            const result = await hydraulicService.runSimulation(request);
            setResults(result);

            if (result.errors && result.errors.length > 0) {
                toast.error(`Error en cálculo: ${result.errors[0]}`);
            } else {
                toast.success("Cálculo finalizado exitosamente");
            }

            return result;
        } catch (error: any) {
            console.error(error);
            toast.error("Error crítico en el motor hidráulico");
            return null;
        } finally {
            setIsCalculating(false);
        }
    }, []);

    return {
        runSimulation,
        isCalculating,
        results
    };
}
