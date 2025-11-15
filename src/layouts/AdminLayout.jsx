import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import apiService from '../services/api';
import TopNavBar from '../components/common/TopNavBar/TopNavBar';
import Sidebar from '../components/common/Sidebar/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const { user, logout } = useAuth();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();

  // Fetch features from database
  useEffect(() => {
    fetchFeatures();
    
    // Listen for feature updates
    const handleFeaturesUpdate = () => {
      fetchFeatures();
    };
    
    window.addEventListener('featuresUpdated', handleFeaturesUpdate);
    
    // Refresh features every 30 seconds to catch database changes
    const interval = setInterval(fetchFeatures, 30000);
    
    return () => {
      window.removeEventListener('featuresUpdated', handleFeaturesUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchFeatures = async () => {
    try {
      setFeaturesLoading(true);
      const response = await apiService.getFeatures();
      setFeatures(response.data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      setFeatures([]);
    } finally {
      setFeaturesLoading(false);
    }
  };

  // Get sidebar items based on features and permissions from database
  const sidebarItems = useMemo(() => {
    if (featuresLoading || permissionsLoading || !features.length || !permissions.length) {
      return [];
    }

    // Build sidebar items from features database
    return features
      .filter(feature => {
        // Only include features that have a path
        if (!feature.path) return false;
        
        // Check if user has view permission for this feature
        const permission = permissions.find(p => p.feature_path === feature.path);
        return permission && permission.can_view;
      })
      .map(feature => ({
        icon: feature.icon || '📄', // Use icon from database, fallback to default
        label: feature.name,
        path: feature.path,
        featurePath: feature.path,
      }))
      .sort((a, b) => {
        // Dashboard always first, then sort others alphabetically
        if (a.path === '/admin') return -1;
        if (b.path === '/admin') return 1;
        return a.label.localeCompare(b.label);
      });
  }, [features, permissions, featuresLoading, permissionsLoading]);

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

