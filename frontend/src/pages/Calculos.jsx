import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, PlayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../components/Icons'

const iteracionesEjemplo = [
  { iteracion: 1, delta_q: 15.42, error_maximo: 15.42, convergencia: false },
  { iteracion: 2, delta_q: 8.23, error_maximo: 8.23, convergencia: false },
  { iteracion: 3, delta_q: 4.15, error_maximo: 4.15, convergencia: false },
  { iteracion: 4, delta_q: 1.87, error_maximo: 1.87, convergencia: false },
  { iteracion: 5, delta_q: 0.42, error_maximo: 0.42, convergencia: false },
  { iteracion: 6, delta_q: 0.08, error_maximo: 0.08, convergencia: false },
  { iteracion: 7, delta_q: 0.001, error_maximo: 0.001, convergencia: true },
]

const resultadosNudos = [
  { codigo: 'N-01', presion: 35.2, cota_agua: 185.2, cumple: true },
  { codigo: 'N-02', presion: 28.5, cota_agua: 173.5, cumple: true },
  { codigo: 'N-03', presion: 22.1, cota_agua: 164.1, cumple: true },
  { codigo: 'N-04', presion: 15.8, cota_agua: 155.8, cumple: true },
  { codigo: 'N-05', presion: 8.2, cota_agua: 148.2, cumple: false },
]

const resultadosTramos = [
  { codigo: 'T-01', caudal: 25.4, velocidad: 1.85, perdida: 2.1, cumple: true },
  { codigo: 'T-02', caudal: 18.2, velocidad: 1.42, perdida: 1.5, cumple: true },
  { codigo: 'T-03', caudal: 12.8, velocidad: 1.15, perdida: 0.9, cumple: true },
  { codigo: 'T-04', caudal: 8.4, velocidad: 0.95, perdida: 0.5, cumple: false },
]

export default function Calculos() {
  const [calculando, setCalculando] = useState(false)
  const [resultados, setResultados] = useState(null)

  const calcular = () => {
    setCalculando(true)
    setTimeout(() => {
      setCalculando(false)
      setResultados({
        metodo: 'Hardy Cross',
        iteraciones: 7,
        convergencia: true,
        error_final: 0.001,
        tiempo: 2.45
      })
    }, 3000)
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
            <h1 className="text-2xl font-bold text-gray-900">Cálculo Hidráulico</h1>
            <p className="text-gray-500">Método de Hardy Cross</p>
          </div>
        </div>
        <button
          onClick={calcular}
          disabled={calculando}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 disabled:opacity-50"
        >
          <PlayIcon className="w-5 h-5" />
          {calculando ? 'Calculando...' : 'Ejecutar Cálculo'}
        </button>
      </div>

      {/* Opciones de Cálculo */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Parámetros del Cálculo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
              <option value="hardy_cross">Hardy Cross</option>
              <option value="deterministico">Determinístico</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tolerancia</label>
            <input
              type="number"
              defaultValue={0.0000001}
              step="0.0000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Iteraciones</label>
            <input
              type="number"
              defaultValue={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {resultados && (
        <>
          {/* Resumen de Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Iteraciones</p>
              <p className="text-2xl font-bold text-gray-900">{resultados.iteraciones}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Convergencia</p>
              <p className={`text-2xl font-bold ${resultados.convergencia ? 'text-green-600' : 'text-red-600'}`}>
                {resultados.convergencia ? 'Sí' : 'No'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Error Final</p>
              <p className="text-2xl font-bold text-gray-900">{resultados.error_final}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Tiempo</p>
              <p className="text-2xl font-bold text-gray-900">{resultados.tiempo}s</p>
            </div>
          </div>

          {/* Tabla de Iteraciones */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Tabla de Iteraciones</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Iteración</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ΔQ (l/s)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Máximo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convergencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {iteracionesEjemplo.map((fila) => (
                    <tr key={fila.iteracion} className={fila.convergencia ? 'bg-green-50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{fila.iteracion}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fila.delta_q.toFixed(4)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fila.error_maximo.toFixed(6)}</td>
                      <td className="px-4 py-3">
                        {fila.convergencia ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <span className="w-5 h-5 inline-block bg-gray-200 rounded-full"></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resultados por Nudos */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Resultados por Nudos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nudo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presión (m.c.a.)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cota Agua (m)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cumple</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resultadosNudos.map((nudo) => (
                    <tr key={nudo.codigo} className={nudo.cumple ? '' : 'bg-red-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{nudo.codigo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{nudo.presion}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{nudo.cota_agua}</td>
                      <td className="px-4 py-3">
                        {nudo.cumple ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        )}
                      </td>
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
