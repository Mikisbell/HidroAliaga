import { SimulationRequest, SimulationResult, SimulationStatus } from './types';

class HydraulicService {
    private worker: Worker | null = null;
    private status: SimulationStatus = 'idle';
    private currentResolve: ((value: SimulationResult) => void) | null = null;
    private currentReject: ((reason: any) => void) | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initWorker();
        }
    }

    private initWorker() {
        this.worker = new Worker(new URL('./hydraulic.worker.ts', import.meta.url));

        this.worker.onmessage = (event) => {
            const { type, result, error } = event.data;

            if (type === 'SUCCESS') {
                this.status = 'completed';
                if (this.currentResolve) this.currentResolve(result);
            } else {
                this.status = 'error';
                if (this.currentReject) this.currentReject(error);
            }

            this.cleanupRequest();
        };

        this.worker.onerror = (error) => {
            this.status = 'error';
            if (this.currentReject) this.currentReject(error);
            this.cleanupRequest();
        };
    }

    private cleanupRequest() {
        this.currentResolve = null;
        this.currentReject = null;
        // Optional: Terminate worker if idle for too long to save memory
    }

    public async runSimulation(request: SimulationRequest): Promise<SimulationResult> {
        if (this.status === 'running') {
            throw new Error('Simulation already running');
        }

        if (!this.worker) this.initWorker();

        this.status = 'running';

        return new Promise((resolve, reject) => {
            this.currentResolve = resolve;
            this.currentReject = reject;
            this.worker?.postMessage(request);
        });
    }

    public getStatus() {
        return this.status;
    }
}

export const hydraulicService = new HydraulicService();
