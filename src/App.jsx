import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ToastProvider } from './components/Toast'
import { ConfirmationProvider } from './contexts/ConfirmationContext'
import useIsDesktop from './hooks/useIsDesktop'
import WebLayout from './components/WebLayout'


// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Materials from './pages/Materials'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import ProductForm from './pages/ProductForm'
import PriceSimulation from './pages/PriceSimulation'


// Components
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'


// Demo mode flag - set to true to bypass authentication
const DEMO_MODE = true

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading && !DEMO_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  if (!user && !DEMO_MODE) {
    return <Navigate to="/login" replace />
  }
  
  return children
}


// Main App Layout
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-canvas">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function AppContent() {
  const isDesktop = useIsDesktop()
  const Layout = ({ children }) => isDesktop
    ? <WebLayout>{children}</WebLayout>
    : <AppLayout>{children}</AppLayout>

  useEffect(() => {
    const handleWheel = (e) => {
      const el = document.activeElement
      if (el && el.tagName === 'INPUT' && el.type === 'number') {
        el.blur()
      }
    }
    document.addEventListener('wheel', handleWheel, { passive: true })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <ToastProvider>
      <Router>
        <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/materials" element={
          <ProtectedRoute>
            <Layout>
              <Materials />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/products/new" element={
          <ProtectedRoute>
            <Layout>
              <ProductForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/products/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <ProductForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/products/copy/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProductForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/price-simulation" element={
          <ProtectedRoute>
            <Layout>
              <PriceSimulation />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />


        </Routes>
        <Toast />
      </Router>
    </ToastProvider>
  )
}


function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ConfirmationProvider>
          <AppContent />
        </ConfirmationProvider>
      </DataProvider>
    </AuthProvider>
  )
}


export default App
