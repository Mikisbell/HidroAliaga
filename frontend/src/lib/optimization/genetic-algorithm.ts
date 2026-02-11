import { MotorHidraulico, NudoCalc, TramoCalc } from "@/lib/engine/motor-hidraulico"
import { PIPE_DATABASE } from "./cost-database"

// Configuración del Algoritmo Genético
export interface GeneticConfig {
    populationSize: number
    maxGenerations: number
    mutationRate: number
    crossoverRate: number
    elitismCount: number
    pressureMin: number // m.c.a. (e.g., 15)
    pressureMax: number // m.c.a. (e.g., 50)
    velocityMax: number // m/s (e.g., 3.0)
    velocityMin: number // m/s (e.g., 0.6)
}

export interface Individual {
    genes: number[] // Índices de PIPE_DATABASE para cada tramo
    fitness: number
    cost: number
    penalty: number
    maxPressure: number
    minPressure: number
    maxVelocity: number
}

export class GeneticOptimizer {
    private nudos: Map<string, NudoCalc>
    private tramos: Map<string, TramoCalc>
    private tramoIds: string[] // Mapeo de índice de gen a ID de tramo
    private config: GeneticConfig

    constructor(
        nudos: Map<string, NudoCalc>,
        tramos: Map<string, TramoCalc>,
        config: Partial<GeneticConfig> = {}
    ) {
        this.nudos = nudos
        this.tramos = tramos
        this.tramoIds = Array.from(tramos.keys())

        this.config = {
            populationSize: 50,
            maxGenerations: 100,
            mutationRate: 0.05,
            crossoverRate: 0.8,
            elitismCount: 2,
            pressureMin: 15,
            pressureMax: 50,
            velocityMin: 0.6,
            velocityMax: 3.0,
            ...config
        }
    }

    // Copia profunda de los mapas para evitar efectos colaterales
    private cloneNetwork(): { nudos: Map<string, NudoCalc>, tramos: Map<string, TramoCalc> } {
        const newNudos = new Map<string, NudoCalc>()
        const newTramos = new Map<string, TramoCalc>()

        for (const [id, nudo] of this.nudos) {
            newNudos.set(id, { ...nudo })
        }

        for (const [id, tramo] of this.tramos) {
            newTramos.set(id, { ...tramo })
        }

        return { nudos: newNudos, tramos: newTramos }
    }

    private generateRandomIndividual(): Individual {
        const genes = this.tramoIds.map(() => Math.floor(Math.random() * PIPE_DATABASE.length))
        return {
            genes,
            fitness: Infinity,
            cost: Infinity,
            penalty: Infinity,
            maxPressure: 0,
            minPressure: 0,
            maxVelocity: 0
        }
    }

    private evaluate(individual: Individual): void {
        const { nudos, tramos } = this.cloneNetwork()
        let totalCost = 0

        // 1. Aplicar genes (diámetros) a la red y calcular costo
        individual.genes.forEach((geneIdx, tramoIdx) => {
            const tramoId = this.tramoIds[tramoIdx]
            const tramo = tramos.get(tramoId)!
            const pipeInfo = PIPE_DATABASE[geneIdx]

            tramo.diametro = pipeInfo.diametro_interior_mm
            // Actualizar material si fuera necesario, para H-W coef
            // tramo.coef_hazen_williams = ... 

            totalCost += tramo.longitud * pipeInfo.costo_usd_metro
        })

        individual.cost = totalCost

        // 2. Ejecutar simulación hidráulica
        const motor = new MotorHidraulico(nudos, tramos)
        const resultado = motor.calcular()

        if (!resultado.convergencia) {
            individual.penalty = 1e9 // Penalización masiva si no converge
            individual.fitness = totalCost + individual.penalty
            return
        }

        // 3. Calcular penalizaciones por violación de restricciones
        let penalty = 0
        const PENALTY_FACTOR = 10000 // Costo ficticio alto por cada violación

        // Presiones
        const presiones = resultado.nudos.map(n => n.presion_calc)
        const minP = Math.min(...presiones)
        const maxP = Math.max(...presiones)
        individual.minPressure = minP
        individual.maxPressure = maxP

        if (minP < this.config.pressureMin) penalty += (this.config.pressureMin - minP) * PENALTY_FACTOR
        if (maxP > this.config.pressureMax) penalty += (maxP - this.config.pressureMax) * PENALTY_FACTOR

        // Velocidades
        const velocidades = resultado.tramos.map(t => t.velocidad)
        const maxV = Math.max(...velocidades)
        individual.maxVelocity = maxV

        if (maxV > this.config.velocityMax) penalty += (maxV - this.config.velocityMax) * PENALTY_FACTOR
        // Velocidad mínima (opcional, a veces se permite 0 en tramos ciegos)
        // if (minV < this.config.velocityMin) penalty += ...

        individual.penalty = penalty
        individual.fitness = totalCost + penalty
    }

    public run(): { bestSolution: Individual, history: { generation: number, bestFitness: number }[] } {
        let population: Individual[] = []
        const history = []

        // Inicializar población
        for (let i = 0; i < this.config.populationSize; i++) {
            const ind = this.generateRandomIndividual()
            this.evaluate(ind)
            population.push(ind)
        }

        // Bucle evolutivo
        for (let gen = 0; gen < this.config.maxGenerations; gen++) {
            // Ordenar por fitness (menor es mejor)
            population.sort((a, b) => a.fitness - b.fitness)

            // Registrar mejor de la generación
            history.push({ generation: gen, bestFitness: population[0].fitness })

            const newPopulation: Individual[] = []

            // Elitismo
            for (let i = 0; i < this.config.elitismCount; i++) {
                newPopulation.push({ ...population[i] })
            }

            // Generar resto de la población
            while (newPopulation.length < this.config.populationSize) {
                // Torneo binario
                const parent1 = this.tournamentSelection(population)
                const parent2 = this.tournamentSelection(population)

                let child = this.crossover(parent1, parent2)
                this.mutate(child)
                this.evaluate(child)

                newPopulation.push(child)
            }

            population = newPopulation
        }

        // Retornar mejor global
        population.sort((a, b) => a.fitness - b.fitness)
        return { bestSolution: population[0], history }
    }

    private tournamentSelection(population: Individual[]): Individual {
        const k = 3
        let best = population[Math.floor(Math.random() * population.length)]

        for (let i = 1; i < k; i++) {
            const ind = population[Math.floor(Math.random() * population.length)]
            if (ind.fitness < best.fitness) {
                best = ind
            }
        }
        return best
    }

    private crossover(parent1: Individual, parent2: Individual): Individual {
        if (Math.random() > this.config.crossoverRate) {
            return { ...parent1, genes: [...parent1.genes] }
        }

        // Uniform crossover
        const newGenes = parent1.genes.map((gene, i) => {
            return Math.random() < 0.5 ? gene : parent2.genes[i]
        })

        return {
            genes: newGenes,
            fitness: Infinity,
            cost: Infinity,
            penalty: Infinity,
            maxPressure: 0,
            minPressure: 0,
            maxVelocity: 0
        }
    }

    private mutate(individual: Individual): void {
        for (let i = 0; i < individual.genes.length; i++) {
            if (Math.random() < this.config.mutationRate) {
                // Cambiar a un diámetro aleatorio diferente
                individual.genes[i] = Math.floor(Math.random() * PIPE_DATABASE.length)
            }
        }
    }

    public getOptimizedDiameters(solution: Individual): Record<string, { diametro_mm: number, diametro_pulg: number, costo: number }> {
        const result: Record<string, any> = {}
        solution.genes.forEach((geneIdx, i) => {
            const tramoId = this.tramoIds[i]
            const pipe = PIPE_DATABASE[geneIdx]
            result[tramoId] = {
                diametro_mm: pipe.diametro_interior_mm,
                diametro_pulg: pipe.diametro_nominal_pulg,
                costo: pipe.costo_usd_metro
            }
        })
        return result
    }
}
