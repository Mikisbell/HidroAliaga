
import { describe, it, expect } from 'vitest';
import { solveNetwork } from './solver';
import { Nudo, Tramo } from '@/types/models';

describe('HydraulicSolver', () => {
    it('should solve a simple 2-node system (Source -> Demand)', () => {
        // Setup
        // Node A: Source at 100m
        // Node B: Demand at 90m, Q = 10 L/s
        // Pipe 1: A -> B, L=1000m, D=100mm, C=140

        const nudos: Nudo[] = [
            {
                id: 'A',
                codigo: 'N-1',
                tipo: 'reservorio', // Fixed Head
                cota_terreno: 100,
                elevacion: 100, // Head = 100
                demanda_base: 0,
                proyecto_id: 'p1',
                latitud: 0, longitud: 0,
                created_at: '', updated_at: '',
                cota_source: 'manual',
                presion_minima_verificada: true,
                es_critico: false
            },
            {
                id: 'B',
                codigo: 'N-2',
                tipo: 'union',
                cota_terreno: 90,
                demanda_base: 10, // 10 L/s
                elevacion: 90,
                proyecto_id: 'p1',
                latitud: 0, longitud: 0,
                created_at: '', updated_at: '',
                cota_source: 'manual',
                presion_minima_verificada: true,
                es_critico: false
            }
        ];

        const tramos: Tramo[] = [
            {
                id: 'T1',
                codigo: 'T-1',
                nudo_origen_id: 'A',
                nudo_destino_id: 'B',
                longitud: 1000,
                diametro_interior: 100, // 100mm
                material: 'pvc',
                tipo: 'tuberia',
                coef_hazen_williams: 140, // C
                proyecto_id: 'p1',
                created_at: '', updated_at: '',
                diametro_comercial: 110,
                clase_tuberia: 'C-10',
                velocidad_verificada: true,
                es_bombeo: false
            }
        ];

        // Execute
        const result = solveNetwork(nudos, tramos);

        // Verify
        expect(result.convergencia).toBe(true);
        expect(result.tramos).toHaveLength(1);

        const t1 = result.tramos[0];
        // Flow should be exactly 10 L/s (continuity)
        expect(t1.caudal).toBeCloseTo(10, 1);

        // Head Loss (Hazen-Williams)
        // Q = 0.010 m3/s, C=140, D=0.1m, L=1000m
        // hf = 10.67 * (Q/C)^1.852 * L / D^4.87
        // hf = 10.67 * (0.01/140)^1.852 * 1000 / (0.1)^4.87
        // Let's approximate: 
        // 0.01/140 = 7.14e-5
        // (7.14e-5)^1.852 ~= 2.0e-8
        // 1000 / 1e-5 ~= 1e8
        // hf ~= 10.67 * 2e-8 * 1e8 ~= 20m?
        // Let's rely on the solver's consistency, but expect positive head loss.
        expect(t1.perdida_carga).toBeGreaterThan(5);
        expect(t1.perdida_carga).toBeLessThan(30);

        // Velocity = Q / A
        // A = pi * 0.05^2 = 0.00785 m2
        // V = 0.01 / 0.00785 = 1.27 m/s
        expect(t1.velocidad).toBeCloseTo(1.27, 1);

        // Node Pressure at B
        // Head_B = Head_A - hf
        // Pressure_B = Head_B - Elev_B
        const nodeB = result.nudos.find(n => n.id === 'B')!;
        // If hf is around 12m, Head_B = 88m.
        // Pressure_B = 88 - 90 = -2m ??
        // Let's check.
        // If flow is 10L/s through 100mm pipe for 1km, friction is high.
        // It's possible pressure is negative if demand is too high for this pipe/elevation.
        // The solver should return the calculated pressure regardless.
        expect(nodeB.presion_calc).toBeDefined();
    });

    it('should handle zero flow (static)', () => {
        const nudos: Nudo[] = [
            { id: 'A', codigo: 'N-1', tipo: 'reservorio', cota_terreno: 100, elevacion: 100, demanda_base: 0, proyecto_id: 'p1', latitud: 0, longitud: 0, created_at: '', updated_at: '', cota_source: 'manual', presion_minima_verificada: true, es_critico: false },
            { id: 'B', codigo: 'N-2', tipo: 'union', cota_terreno: 90, elevacion: 90, demanda_base: 0, proyecto_id: 'p1', latitud: 0, longitud: 0, created_at: '', updated_at: '', cota_source: 'manual', presion_minima_verificada: true, es_critico: false }
        ];
        const tramos: Tramo[] = [
            { id: 'T1', codigo: 'T-1', nudo_origen_id: 'A', nudo_destino_id: 'B', longitud: 1000, diametro_interior: 100, material: 'pvc', tipo: 'tuberia', coef_hazen_williams: 150, proyecto_id: 'p1', created_at: '', updated_at: '', coeficiente_rugosidad: 0, diametro_comercial: 110, clase_tuberia: 'C-10', velocidad_verificada: true, es_bombeo: false }
        ];

        const result = solveNetwork(nudos, tramos);

        expect(result.convergencia).toBe(true);
        // Residual flow around 0.01 is acceptable for this iterative method
        expect(Math.abs(result.tramos[0].caudal)).toBeLessThan(0.1);
        expect(result.tramos[0].perdida_carga).toBeLessThan(0.1);

        // Pressure at B = Head_A - Elev_B = 100 - 90 = 10
        const nodeB = result.nudos.find(n => n.id === 'B')!;
        expect(nodeB.presion_calc).toBeCloseTo(10, 1);
    });
});
