import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ToastProvider } from './components/Toast'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Materials from './pages/Materials'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import ProductForm from './pages/ProductForm'

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
    <div className="min-h-screen bg-slate-950">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function AppContent() {
  return (
    <ToastProvider>
      <Router>
        <Routes>

        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/categories" element={
          <ProtectedRoute>
            <AppLayout>
              <Categories />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/materials" element={
          <ProtectedRoute>
            <AppLayout>
              <Materials />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <AppLayout>
              <Products />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/new" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductDetail />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/copy/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductForm />
            </AppLayout>
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
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
