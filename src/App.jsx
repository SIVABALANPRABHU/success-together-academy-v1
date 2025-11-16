import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import Roles from './pages/admin/Roles'
import Features from './pages/admin/Features'
import Permissions from './pages/admin/Permissions'
import Courses from './pages/admin/Courses'
import Lessons from './pages/admin/Lessons'
import Payments from './pages/admin/Payments'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'
import Contents from './pages/admin/Contents'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="SuperAdmin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="features" element={<Features />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="contents" element={<Contents />} />
            <Route path="courses" element={<Courses />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="payments" element={<Payments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App


