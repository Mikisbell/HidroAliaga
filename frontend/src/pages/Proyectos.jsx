import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WaterDropIcon, PlusIcon, MagnifyingGlassIcon } from '../components/Icons'

const proyectos = [
  {
    id: '1',
    nombre: 'Urbanización Los Jardines',
    descripcion: 'Proyecto de red de distribución para urbanización con 150 conexiones',
    ambito: 'urbano',
    tipo_red: 'cerrada',
    estado: 'completado',
    nudos: 25,
    tramos: 32,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Sector Rural San José',
    descripcion: 'Red de agua potable para sector rural disperso',
    ambito: 'rural',
    tipo_red: 'abierta',
    estado: 'en_progreso',
    nudos: 12,
    tramos: 11,
    created_at: '2024-01-14'
  },
  {
    id: '3',
    nombre: 'Barrio Santa Rosa',
    descripcion: 'Ampliación de red existente en barrio urbanizado',
    ambito: 'urbano',
    tipo_red: 'mixta',
    estado: 'validacion',
    nudos: 18,
    tramos: 24,
    created_at: '2024-01-12'
  },
]

export default function Proyectos() {
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const proyectosFiltrados = proyectos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || p.ambito === filtro
    return coincideBusqueda && coincideFiltro
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="mt-1 text-gray-500">Gestiona tus proyectos de redes de agua potable</p>
        </div>
        <Link
          to="/proyectos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'urbano', 'rural'].map((filtroOption) => (
            <button
              key={filtroOption}
              onClick={() => setFiltro(filtroOption)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filtro === filtroOption
                  ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filtroOption.charAt(0).toUpperCase() + filtroOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proyectosFiltrados.map((proyecto) => (
          <Link
            key={proyecto.id}
            to={`/proyectos/${proyecto.id}`}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${
                proyecto.ambito === 'urbano' ? 'bg-sky-100' : 'bg-green-100'
              }`}>
                <WaterDropIcon className={`w-6 h-6 ${
                  proyecto.ambito === 'urbano' ? 'text-sky-600' : 'text-green-600'
                }`} />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                proyecto.estado === 'completado' ? 'bg-green-100 text-green-700' :
                proyecto.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
                proyecto.estado === 'validacion' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {proyecto.estado.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{proyecto.nombre}</h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{proyecto.descripcion}</p>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <WaterDropIcon className="w-4 h-4" />
                {proyecto.nudos} nudos
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  ="round" stroke<path strokeLinecapLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {proyecto.tramos} tramos
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">{proyecto.created_at}</span>
              <span className={`text-xs font-medium ${
                proyecto.tipo_red === 'cerrada' ? 'text-purple-600' :
                proyecto.tipo_red === 'abierta' ? 'text-orange-600' :
                'text-teal-600'
              }`}>
                Red {proyecto.tipo_red}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {proyectosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <WaterDropIcon className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron proyectos</h3>
          <p className="mt-2 text-gray-500">Crea un nuevo proyecto para comenzar</p>
          <Link
            to="/proyectos/nuevo"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Proyecto
          </Link>
        </div>
      )}
    </div>
  )
}
