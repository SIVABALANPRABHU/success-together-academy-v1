import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopNavBar from '../components/common/TopNavBar/TopNavBar';
import Sidebar from '../components/common/Sidebar/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/admin',
    },
    {
      icon: '👥',
      label: 'Users',
      path: '/admin/users',
    },
    {
      icon: '🎭',
      label: 'Roles',
      path: '/admin/roles',
    },
    {
      icon: '📚',
      label: 'Courses',
      path: '/admin/courses',
    },
    {
      icon: '📝',
      label: 'Lessons',
      path: '/admin/lessons',
    },
    {
      icon: '💳',
      label: 'Payments',
      path: '/admin/payments',
    },
    {
      icon: '📈',
      label: 'Analytics',
      path: '/admin/analytics',
    },
    {
      icon: '⚙️',
      label: 'Settings',
      path: '/admin/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userData = {
    name: user?.name || 'User',
    email: user?.email || '',
    avatar: user?.thumbnail || null,
  };

  return (
    <div className="admin-layout">
      <TopNavBar
        logoText="Success Together Academy"
        user={userData}
        onLogout={handleLogout}
        notifications={[]}
      />
      <div className="admin-layout-content">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="admin-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

