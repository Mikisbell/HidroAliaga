import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Proyectos from './pages/Proyectos'
import EditorRed from './pages/EditorRed'
import Calculos from './pages/Calculos'
import Optimizacion from './pages/Optimizacion'
import Normativa from './pages/Normativa'
import Reportes from './pages/Reportes'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:id" element={<EditorRed />} />
        <Route path="/proyectos/:id/calcular" element={<Calculos />} />
        <Route path="/proyectos/:id/optimizar" element={<Optimizacion />} />
        <Route path="/normativa" element={<Normativa />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
