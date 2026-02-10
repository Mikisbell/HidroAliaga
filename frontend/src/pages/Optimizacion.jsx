import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, CogIcon, ChartBarIcon } from '../components/Icons'

const historialGA = [
  { generacion: 0, mejor: 150000, promedio: 165000 },
  { generacion: 10, mejor: 125000, promedio: 142000 },
  { generacion: 20, mejor: 108000, promedio: 128000 },
  { generacion: 30, mejor: 98000, promedio: 115000 },
  { generacion: 40, mejor: 92000, promedio: 108000 },
  { generacion: 50, mejor: 89000, promedio: 102000 },
]

const diametrosPropuestos = [
  { tramo: 'T-01', actual: 110, propuesto: 90, ahorro: 2500 },
  { tramo: 'T-02', actual: 90, propuesto: 75, ahorro: 1800 },
  { tramo: 'T-03', actual: 75, propuesto: 63, ahorro: 1200 },
  { tramo: 'T-04', actual: 63, propuesto: 50, ahorro: 800 },
]

export default function Optimizacion() {
  const [optimizando, setOptimizando] = useState(false)
  const [resultados, setResultados] = useState(null)

  const optimizar = () => {
    setOptimizando(true)
    setTimeout(() => {
      setOptimizando(false)
      setResultados({
        convergencia: true,
        costo_original: 150000,
        costo_optimizado: 89000,
        ahorro: 61000,
        porcentaje: 40.7,
        generaciones: 50
      })
    }, 5000)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/proyectos/1" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Optimización de Diámetros</h1>
            <p className="text-gray-500">Algoritmo Genético</p>
          </div>
        </div>
        <button
          onClick={optimizar}
          disabled={optimizando}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          <CogIcon className="w-5 h-5" />
          {optimizando ? 'Optimizando...' : 'Ejecutar Optimización'}
        </button>
      </div>

      {/* Parámetros del GA */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Parámetros del Algoritmo Genético</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Población</label>
            <input
              type="number"
              defaultValue={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generaciones</label>
            <input
              type="number"
              defaultValue={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa Cruce</label>
            <input
              type="number"
              defaultValue={0.8}
              step="0.1"
              max="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa Mutación</label>
            <input
              type="number"
              defaultValue={0.1}
              step="0.01"
              max="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {resultados && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Costo Original</p>
              <p className="text-2xl font-bold text-gray-900">S/ {resultados.costo_original.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Costo Optimizado</p>
              <p className="text-2xl font-bold text-green-600">S/ {resultados.costo_optimizado.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Ahorro</p>
              <p className="text-2xl font-bold text-purple-600">S/ {resultados.ahorro.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Generaciones</p>
              <p className="text-2xl font-bold text-gray-900">{resultados.generaciones}</p>
            </div>
          </div>

          {/* Propuestas de Cambio */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Propuestas de Cambio de Diámetros</h2>
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                {resultados.porcentaje}% de ahorro
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tramo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diámetro Actual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diámetro Propuesto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ahorro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {diametrosPropuestos.map((item) => (
                    <tr key={item.tramo}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.tramo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.actual}mm</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.propuesto}mm</td>
                      <td className="px-4 py-3 text-sm text-green-600">S/ {item.ahorro.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
