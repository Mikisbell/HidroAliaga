import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  DocumentChartBarIcon,
  CogIcon,
  ScaleIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  WaterDropIcon
} from './Icons'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Proyectos', href: '/proyectos', icon: FolderIcon },
  { name: 'Normativa', href: '/normativa', icon: ScaleIcon },
  { name: 'Reportes', href: '/reportes', icon: DocumentTextIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <WaterDropIcon className="w-8 h-8 text-sky-500" />
              <span className="text-xl font-bold text-gray-900">HidroAliaga</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center gap-2 h-16 px-6 border-b">
            <WaterDropIcon className="w-8 h-8 text-sky-500" />
            <span className="text-xl font-bold text-gray-900">HidroAliaga</span>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-sky-700">HA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">HidroAliaga Admin</p>
                <p className="text-xs text-gray-500">admin@hredes.pe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b lg:px-8">
          <button
            className="lg:hidden -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || 'HidroAliaga'}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                to="/proyectos/nuevo"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600"
              >
                Nuevo Proyecto
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
