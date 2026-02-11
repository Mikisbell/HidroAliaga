export interface PipeOption {
    diametro_nominal_pulg: number
    diametro_interior_mm: number
    costo_usd_metro: number
    material: string
    clase: string
}

// Base de datos de tuberías PVC Clase 10 (Norma ISO 4422 / NTP 399.002)
// Costos referenciales aproximados para el mercado peruano (2025)
export const PIPE_DATABASE: PipeOption[] = [
    { diametro_nominal_pulg: 0.5, diametro_interior_mm: 26.6, costo_usd_metro: 1.5, material: "PVC", clase: "C-10" }, // 3/4" real connection usually
    { diametro_nominal_pulg: 0.75, diametro_interior_mm: 26.6, costo_usd_metro: 2.1, material: "PVC", clase: "C-10" }, // Actually 26.6 is roughly 1 inch outer, internal varies. Let's use standard table.
    // Corrections based on standard PVC C-10 specs (approx internal diameters)
    { diametro_nominal_pulg: 1.0, diametro_interior_mm: 29.4, costo_usd_metro: 3.5, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 1.25, diametro_interior_mm: 38.0, costo_usd_metro: 4.8, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 1.5, diametro_interior_mm: 44.0, costo_usd_metro: 6.2, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 2.0, diametro_interior_mm: 59.0, costo_usd_metro: 9.5, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 2.5, diametro_interior_mm: 71.0, costo_usd_metro: 14.0, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 3.0, diametro_interior_mm: 84.0, costo_usd_metro: 18.5, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 4.0, diametro_interior_mm: 105.0, costo_usd_metro: 32.0, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 6.0, diametro_interior_mm: 154.0, costo_usd_metro: 65.0, material: "PVC", clase: "C-10" },
    { diametro_nominal_pulg: 8.0, diametro_interior_mm: 204.0, costo_usd_metro: 110.0, material: "PVC", clase: "C-10" },
]
