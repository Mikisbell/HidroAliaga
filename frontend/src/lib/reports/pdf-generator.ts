import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Nudo, Tramo } from "@/types/models"

export function generateProjectPDF(
    proyectoArg: any,
    nudos: Nudo[],
    tramos: Tramo[],
    ultimoCalculo: any
) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 15

    // Función auxiliar para agregar texto centrado
    const centerText = (text: string, y: number, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize)
        doc.setFont("helvetica", isBold ? "bold" : "normal")
        const textWidth = doc.getTextWidth(text)
        doc.text(text, (pageWidth - textWidth) / 2, y)
    }

    // --- PORTADA ---
    doc.setFillColor(240, 240, 240)
    doc.rect(0, 0, pageWidth, 297, "F") // Background

    doc.setTextColor(30, 30, 30)
    centerText("H-REDES PERÚ", 50, 24, true)
    centerText("MEMORIA DE CÁLCULO HIDRÁULICO", 70, 16, false)

    doc.setDrawColor(0, 0, 0)
    doc.line(margin, 80, pageWidth - margin, 80)

    doc.setFontSize(14)
    doc.text(`Proyecto: ${proyectoArg.nombre}`, margin, 100)

    doc.setFontSize(11)
    doc.text(`Ubicación: ${proyectoArg.departamento || "No definida"}`, margin, 115)
    doc.text(`Tipo de Sistema: ${proyectoArg.ambito}`, margin, 125)
    doc.text(`Configuración Red: ${proyectoArg.tipo_red}`, margin, 135)
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, margin, 145)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    centerText("Generado automáticamente por HidroAliaga Software", 280, 8, false)

    // --- PÁGINA 2: RESUMEN EJECUTIVO ---
    doc.addPage()
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, 297, "F")

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("1. RESUMEN EJECUTIVO", margin, 20)

    const stats = [
        ["Total Nudos", nudos.length],
        ["Total Tuberías", tramos.length],
        ["Estado Cálculo", ultimoCalculo?.convergencia ? "CONVERGENCIA ALCANZADA" : "NO CONVERGE"],
        ["Iteraciones", ultimoCalculo ? ultimoCalculo.iteraciones_realizadas : "-"],
        ["Presión Mínima", ultimoCalculo ? `${ultimoCalculo.presion_minima?.toFixed(2)} m.c.a.` : "-"],
        ["Presión Máxima", ultimoCalculo ? `${ultimoCalculo.presion_maxima?.toFixed(2)} m.c.a.` : "-"],
        ["Velocidad Máxima", ultimoCalculo ? `${ultimoCalculo.velocidad_maxima?.toFixed(2)} m/s` : "-"],
    ]

    autoTable(doc, {
        startY: 30,
        head: [['Parámetro', 'Valor']],
        body: stats,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
    })

    // --- PÁGINA 3: TABLA DE NUDOS ---
    doc.addPage()
    doc.text("2. DETALLE DE NUDOS", margin, 20)

    const nudosData = nudos.map(n => [
        n.codigo,
        n.tipo,
        n.elevacion?.toFixed(2) || "-",
        n.demanda_base?.toFixed(3) || "-",
        n.cota_terreno?.toFixed(2) || "-",
        n.presion_calc?.toFixed(2) || "-"
    ])

    autoTable(doc, {
        startY: 30,
        head: [['Código', 'Tipo', 'Cota (m)', 'Demanda (l/s)', 'C.Piezom (m)', 'Presión (mca)']],
        body: nudosData,
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50] },
        styles: { fontSize: 8 }
    })

    // --- PÁGINA 4: TABLA DE TRAMOS ---
    doc.addPage()
    doc.text("3. DETALLE DE TUBERÍAS", margin, 20)

    const tramosData = tramos.map(t => [
        t.codigo,
        `${t.material} C-10`,
        t.longitud?.toFixed(2) || "-",
        t.diametro_interior?.toFixed(1) || "-",
        t.caudal?.toFixed(3) || "-",
        t.velocidad?.toFixed(2) || "-",
        t.perdida_carga?.toFixed(2) || "-"
    ])

    autoTable(doc, {
        startY: 30,
        head: [['Tramo', 'Material', 'Longitud (m)', 'D.Int (mm)', 'Caudal (l/s)', 'Velocidad (m/s)', 'Pérdida (m)']],
        body: tramosData,
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50] },
        styles: { fontSize: 8 }
    })

    // Guardar
    doc.save(`Memoria_Calculo_${proyectoArg.nombre.replace(/\s+/g, '_')}.pdf`)
}
