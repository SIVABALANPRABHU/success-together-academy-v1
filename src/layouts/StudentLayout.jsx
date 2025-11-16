import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './StudentLayout.css';

const StudentLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { icon: '📊', label: 'Dashboard', path: '/student/dashboard' },
    { icon: '📚', label: 'My Courses', path: '/student/courses' },
    { icon: '🎫', label: 'My Memberships', path: '/student/memberships' },
    { icon: '👤', label: 'Profile', path: '/student/profile' },
  ];

  return (
    <div className="student-layout">
      <nav className="student-navbar">
        <div className="student-nav-container">
          <div className="student-nav-logo">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1>Success Together Academy</h1>
          </div>
          <div className="student-nav-menu">
            {/* User info and logout moved to sidebar profile */}
          </div>
        </div>
      </nav>

      <div className="student-layout-content">
        <aside className={`student-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="student-sidebar-nav">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="student-sidebar-item"
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="student-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

