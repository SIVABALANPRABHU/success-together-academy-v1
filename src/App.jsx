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
import Lessons from './pages/admin/Lessons'
import Payments from './pages/admin/Payments'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'
import Contents from './pages/admin/Contents'
import Pages from './pages/admin/Pages'
import Chapters from './pages/admin/Chapters'
import Courses from './pages/admin/Courses'
import Menus from './pages/admin/Menus'
import Packages from './pages/admin/Packages'
import Offers from './pages/admin/Offers'
import Memberships from './pages/admin/Memberships'
import StudentLayout from './layouts/StudentLayout'
import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import StudentMemberships from './pages/student/Memberships'
import StudentProfile from './pages/student/Profile'
import MenuDetail from './pages/student/MenuDetail'
import CourseDetail from './pages/student/CourseDetail'
import ChapterDetail from './pages/student/ChapterDetail'
import ContentPage from './pages/student/ContentPage'
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
            <Route path="pages" element={<Pages />} />
            <Route path="chapters" element={<Chapters />} />
            <Route path="courses" element={<Courses />} />
            <Route path="menus" element={<Menus />} />
            <Route path="packages" element={<Packages />} />
            <Route path="offers" element={<Offers />} />
            <Route path="memberships" element={<Memberships />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="payments" element={<Payments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="memberships" element={<StudentMemberships />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="menu/:menuId" element={<MenuDetail />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="chapter/:chapterId" element={<ChapterDetail />} />
            <Route path="content/:contentId" element={<ContentPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App


