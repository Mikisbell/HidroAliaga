import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { WaterDropIcon, FolderIcon, CalculatorIcon, ChartBarIcon } from '../components/Icons'

const stats = [
  { name: 'Proyectos Activos', value: '12', icon: FolderIcon, color: 'bg-sky-500' },
  { name: 'Cálculos Realizados', value: '48', icon: CalculatorIcon, color: 'bg-green-500' },
  { name: 'Redes Diseñadas', value: '24', icon: ChartBarIcon, color: 'bg-purple-500' },
  { name: 'Horas de Cálculo', value: '156', icon: WaterDropIcon, color: 'bg-amber-500' },
]

const proyectosRecientes = [
  { id: 1, nombre: 'Urbanización Los Jardines', ambito: 'Urbano', estado: 'Completo', fecha: '2024-01-15' },
  { id: 2, nombre: 'Sector Rural San José', ambito: 'Rural', estado: 'En Progreso', fecha: '2024-01-14' },
  { id: 3, nombre: 'Barrio眉l Santa Rosa', ambito: 'Urbano', estado: 'Validación', fecha: '2024-01-12' },
  { id: 4, nombre: 'Centro Poblado La Esperanza', ambito: 'Rural', estado: 'Borrador', fecha: '2024-01-10' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proyectos Recientes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Proyectos Recientes</h2>
          <Link to="/proyectos" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            Ver todos
          </Link>
        </div>
        <div className="divide-y">
          {proyectosRecientes.map((proyecto) => (
            <Link
              key={proyecto.id}
              to={`/proyectos/${proyecto.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${proyecto.ambito === 'Urbano' ? 'bg-sky-100' : 'bg-green-100'}`}>
                  <WaterDropIcon className={`w-5 h-5 ${proyecto.ambito === 'Urbano' ? 'text-sky-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{proyecto.nombre}</p>
                  <p className="text-sm text-gray-500">{proyecto.ambito} • {proyecto.fecha}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                proyecto.estado === 'Completo' ? 'bg-green-100 text-green-700' :
                proyecto.estado === 'En Progreso' ? 'bg-blue-100 text-blue-700' :
                proyecto.estado === 'Validación' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {proyecto.estado}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link
          to="/proyectos/nuevo"
          className="p-6 bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl text-white hover:from-sky-600 hover:to-sky-700"
        >
          <FolderIcon className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">Nuevo Proyecto</h3>
          <p className="mt-2 text-sm text-sky-100">
            Crear un nuevo proyecto de red de distribución de agua potable
          </p>
        </Link>

        <Link
          to="/normativa"
          className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700"
        >
          <ChartBarIcon className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">Consultar Normativa</h3>
          <p className="mt-2 text-sm text-purple-100">
            Acceder a la base de conocimiento normativo peruano
          </p>
        </Link>

        <Link
          to="/reportes"
          className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700"
        >
          <CalculatorIcon className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">Exportar Reportes</h3>
          <p className="mt-2 text-sm text-green-100">
            Generar expedientes técnicos y exportar a diferentes formatos
          </p>
        </Link>
      </div>
    </div>
  )
}
