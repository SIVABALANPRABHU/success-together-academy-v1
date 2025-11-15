import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role_id) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [user?.role_id]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPermissions({ role_id: user.role_id });
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (featurePath, action) => {
    if (!user || !permissions.length) return false;
    
    const permission = permissions.find(p => p.feature_path === featurePath);
    if (!permission) return false;

    switch (action) {
      case 'view':
        return permission.can_view;
      case 'view_detail':
        return permission.can_view_detail;
      case 'add':
        return permission.can_add;
      case 'edit':
        return permission.can_edit;
      case 'delete':
        return permission.can_delete;
      default:
        return false;
    }
  };

  const getFeaturePermission = (featurePath) => {
    if (!user || !permissions.length) return null;
    return permissions.find(p => p.feature_path === featurePath);
  };

  return {
    permissions,
    loading,
    hasPermission,
    getFeaturePermission,
    refetch: fetchPermissions,
  };
};

