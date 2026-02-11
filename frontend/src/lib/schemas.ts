/**
 * Schemas de Validación Zod - HidroAliaga
 * Para react-hook-form y validación en API Routes
 */

import { z } from 'zod'

// ============ ENUMS ============

export const tipoRedSchema = z.enum(['abierta', 'cerrada', 'mixta'])
export const ambitoSchema = z.enum(['urbano', 'rural'])
export const tipoNudoSchema = z.enum(['cisterna', 'tanque_elevado', 'union', 'consumo', 'valvula', 'bomba', 'reservorio', 'camara_rompe_presion'])
export const tipoTramoSchema = z.enum(['tuberia', 'valvula', 'bomba', 'accesorio'])
export const materialSchema = z.enum(['pvc', 'hdpe', 'hdde', 'concreto', 'acero', 'cobre'])

// ============ PROYECTO ============

export const proyectoCreateSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(255),
    descripcion: z.string().optional(),
    ambito: ambitoSchema.default('urbano'),
    tipo_red: tipoRedSchema.default('cerrada'),
    departamento: z.string().optional(),
    provincia: z.string().optional(),
    distrito: z.string().optional(),
    poblacion_diseno: z.number().int().min(0).optional(),
    periodo_diseno: z.number().int().min(1).max(50).default(20),
    dotacion_percapita: z.number().min(0).default(169.0),
    coef_cobertura: z.number().min(0).max(1).default(0.8),
})

export const proyectoUpdateSchema = proyectoCreateSchema.partial()

export type ProyectoCreateInput = z.infer<typeof proyectoCreateSchema>
export type ProyectoUpdateInput = z.infer<typeof proyectoUpdateSchema>

// ============ NUDO ============

export const nudoCreateSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50),
    nombre: z.string().optional(),
    tipo: tipoNudoSchema.default('union'),
    longitud: z.number().optional(),
    latitud: z.number().optional(),
    cota_terreno: z.number().optional(),
    cota_lamina: z.number().optional(),
    demanda_base: z.number().default(0),
    elevacion: z.number().default(0),
    es_critico: z.boolean().default(false),
})

export const nudoUpdateSchema = nudoCreateSchema.partial()

export type NudoCreateInput = z.infer<typeof nudoCreateSchema>
export type NudoUpdateInput = z.infer<typeof nudoUpdateSchema>

// ============ TRAMO ============

export const tramoCreateSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50),
    nombre: z.string().optional(),
    tipo: tipoTramoSchema.default('tuberia'),
    nudo_origen_id: z.string().uuid('ID de nudo origen inválido'),
    nudo_destino_id: z.string().uuid('ID de nudo destino inválido'),
    longitud: z.number().positive('La longitud debe ser mayor a 0'),
    material: materialSchema.default('pvc'),
    diametro_interior: z.number().positive('El diámetro debe ser mayor a 0'),
    clase_tuberia: z.string().default('CL-10'),
    coef_hazen_williams: z.number().positive().default(150),
})

export const tramoUpdateSchema = tramoCreateSchema.partial()

export type TramoCreateInput = z.infer<typeof tramoCreateSchema>
export type TramoUpdateInput = z.infer<typeof tramoUpdateSchema>

// ============ CÁLCULO ============

export const calculoRequestSchema = z.object({
    tolerancia: z.number().positive().default(1e-7),
    max_iteraciones: z.number().int().positive().default(1000),
})

export type CalculoRequestInput = z.infer<typeof calculoRequestSchema>

// ============ OPTIMIZACIÓN ============

export const optimizacionRequestSchema = z.object({
    poblacion_size: z.number().int().min(10).default(100),
    generaciones: z.number().int().min(5).default(50),
    crossover_rate: z.number().min(0).max(1).default(0.8),
    mutation_rate: z.number().min(0).max(1).default(0.1),
})

export type OptimizacionRequestInput = z.infer<typeof optimizacionRequestSchema>
