import { useState } from 'react'
import { DocumentTextIcon, TableCellsIcon, MapIcon, ArrowDownTrayIcon } from '../components/Icons'

const proyectos = [
  { id: 1, nombre: 'Urbanización Los Jardines' },
  { id: 2, nombre: 'Sector Rural San José' },
  { id: 3, nombre: 'Barrio Santa Rosa' },
]

export default function Reportes() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('')
  const [formato, setFormato] = useState('pdf')

  const formatos = [
    { id: 'pdf', nombre: 'PDF', descripcion: 'Expediente técnico completo', icon: DocumentTextIcon },
    { id: 'excel', nombre: 'Excel', descripcion: 'Datos en hoja de cálculo', icon: TableCellsIcon },
    { id: 'epanet', nombre: 'EPANET', descripcion: 'Archivo .inp compatible', icon: TableCellsIcon },
    { id: 'geojson', nombre: 'GeoJSON', descripcion: 'Datos geográficos', icon: MapIcon },
  ]

  const exportar = (formatoId) => {
    // Simulación de exportación
    alert(`Exportando proyecto ${proyectoSeleccionado} en formato ${formatoId}`)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Exportación</h1>
        <p className="text-gray-500">Genera expedientes técnicos y exporta datos</p>
      </div>

      {/* Selector de Proyecto */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Proyecto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Seleccionar proyecto...</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formatos de Exportación */}
      {proyectoSeleccionado && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Formato de Exportación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formatos.map((formato) => (
              <button
                key={formato.id}
                onClick={() => exportar(formato.id)}
                className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                  formato === formato
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <formato.icon className="w-8 h-8 text-sky-500 mb-3" />
                <h3 className="font-semibold text-gray-900">{formato.nombre}</h3>
                <p className="text-sm text-gray-500 mt-1">{formato.descripcion}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opciones Adicionales */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Opciones de Reporte</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-500 rounded" />
            <span className="text-gray-700">Incluir memoria descriptiva</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-500 rounded" />
            <span className="text-gray-700">Incluir cuadro de nudos</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-500 rounded" />
            <span className="text-gray-700">Incluir cuadro de tramos</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-500 rounded" />
            <span className="text-gray-700">Incluir tabla de iteraciones</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-sky-500 rounded" />
            <span className="text-gray-700">Incluir planos</span>
          </label>
        </div>
      </div>

      {/* Reportes Recientes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
        </div>
        <div className="divide-y">
          {[
            { nombre: 'Urbanización Los Jardines - Expediente.pdf', fecha: '2024-01-15', tamano: '2.4 MB' },
            { nombre: 'Urbanización Los Jardines - Datos.xlsx', fecha: '2024-01-15', tamano: '856 KB' },
            { nombre: 'Sector Rural San José - EPANET.inp', fecha: '2024-01-14', tamano: '124 KB' },
          ].map((reporte, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{reporte.nombre}</p>
                  <p className="text-sm text-gray-500">{reporte.fecha} • {reporte.tamano}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-sky-500">
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
