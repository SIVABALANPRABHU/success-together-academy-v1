import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/common/TopNavBar/TopNavBar';
import Sidebar from '../components/common/Sidebar/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    // Handle logout logic here
    console.log('Logout clicked');
  };

  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: null, // You can add avatar URL here
  };

  return (
    <div className="admin-layout">
      <TopNavBar
        logoText="Success Together Academy"
        user={user}
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

