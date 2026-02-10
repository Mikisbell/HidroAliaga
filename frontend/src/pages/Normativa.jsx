import { useState } from 'react'
import { ScaleIcon, ChatBubbleLeftRightIcon } from '../components/Icons'

const normas = [
  {
    codigo: 'RNE-OS.050',
    nombre: 'Redes de Distribución de Agua Potable',
    descripcion: 'Requisitos para el diseño de redes de distribución de agua potable.',
    vigente: true
  },
  {
    codigo: 'RM-192-2018-VIVIENDA',
    nombre: 'Reglamento de Prestaciones del Servicio de Saneamiento',
    descripcion: 'Parámetros para ámbito rural y urbano.',
    vigente: true
  },
  {
    codigo: 'RM-107-2025-VIVIENDA',
    nombre: 'Actualización de Dotaciones según Clima',
    descripcion: 'Dotaciones per cápita según zona climática.',
    vigente: true
  }
]

export default function Normativa() {
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState(null)
  const [cargando, setCargando] = useState(false)

  const consultar = () => {
    if (!pregunta.trim()) return
    
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setRespuesta({
        texto: `Basándome en la normativa peruana vigente (RNE OS.050 y RM 192-2018), para una **zona urbana industrial**, el diámetro mínimo recomendado es de **75 mm (3 pulgadas)** según la Norma OS.050.\n\nAdemás, debe considerarse:\n- Presión mínima: 10 m.c.a.\n- Velocidad máxima: 3.00 m/s\n- Coeficiente Hazen-Williams: 150 para PVC`,
        referencias: [
          { codigo: 'RNE-OS.050', nombre: 'Redes de Distribución de Agua Potable' },
          { codigo: 'RM-192-2018', nombre: 'Reglamento de Prestaciones' }
        ]
      })
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Normativa Peruana</h1>
        <p className="text-gray-500">Consultas normativas y base de conocimiento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Base de Conocimiento */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Normas Disponibles</h2>
          <div className="space-y-3">
            {normas.map((norma) => (
              <div key={norma.codigo} className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    norma.vigente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {norma.vigente ? 'Vigente' : 'No vigente'}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-gray-900">{norma.codigo}</h3>
                <p className="mt-1 text-sm text-gray-600">{norma.nombre}</p>
                <p className="mt-2 text-xs text-gray-500">{norma.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Copiloto Normativo */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-purple-600">
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Copiloto Normativo</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Realiza tu consulta normativa
                </label>
                <textarea
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  placeholder="Ej: ¿Qué diámetro mínimo debo usar si mi red es para una zona industrial?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <button
                onClick={consultar}
                disabled={cargando || !pregunta.trim()}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {cargando ? 'Consultando...' : 'Consultar'}
              </button>

              {respuesta && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-gray-700">{respuesta.texto}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-500 mb-2">Referencias normativas:</p>
                    <div className="flex flex-wrap gap-2">
                      {respuesta.referencias.map((ref) => (
                        <span
                          key={ref.codigo}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                        >
                          {ref.codigo}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Límites Normativos */}
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Límites Normativos</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Ámbito Urbano</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li>• Presión mínima: 10 m.c.a.</li>
                    <li>• Presión máxima: 50 m.c.a.</li>
                    <li>• Velocidad mínima: 0.60 m/s</li>
                    <li>• Velocidad máxima: 3.00 m/s</li>
                    <li>• Diámetro mínimo: 75 mm</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Ámbito Rural</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li>• Presión mínima: 5 m.c.a.</li>
                    <li>• Presión piletas: 3.5 m.c.a.</li>
                    <li>• Velocidad mínima: 0.60 m/s</li>
                    <li>• Velocidad máxima: 3.00 m/s</li>
                    <li>• Diámetro mínimo: 25 mm</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
