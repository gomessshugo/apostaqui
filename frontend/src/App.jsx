import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PaginaLogin from './pages/PaginaLogin'
import PaginaBanca from './pages/PaginaBanca'
import PaginaDashboard from './pages/PaginaDashboard'
import PaginaConstrutor from './pages/PaginaConstrutor'
import PaginaMercados from './pages/PaginaMercados'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token no localStorage
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log("Executando logout..."); // Log para confirmar
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    // O redirecionamento será automático devido ao estado isAuthenticated
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <PaginaLogin onLogin={handleLogin} />
        } 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<PaginaDashboard />} />
                <Route path="/banca" element={<PaginaBanca />} />
                <Route path="/construtor" element={<PaginaConstrutor />} />
                <Route path="/mercados" element={<PaginaMercados />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  )
}

export default App