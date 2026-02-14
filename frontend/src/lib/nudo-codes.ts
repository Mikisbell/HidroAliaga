/**
 * Returns the code prefix for a given nudo type.
 * Used by both server actions (nudos.ts) and client components (DesignerWrapper).
 */
export function getCodigoPrefix(tipo: string): string {
    switch (tipo) {
        case 'reservorio': return 'R-'
        case 'camara_rompe_presion': return 'CRP-'
        case 'cisterna': return 'CIS-'
        case 'tanque_elevado': return 'TE-'
        case 'consumo': return 'C-'
        case 'valvula': return 'V-'
        case 'bomba': return 'B-'
        default: return 'N-'
    }
}
