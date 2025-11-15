import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import './Roles.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    can_self_register: false,
    home_page: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles on component mount and when search term changes
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRoles();
      setRoles(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name) {
        setError('Role name is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createRole(formData);
      await fetchRoles();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name) {
        setError('Role name is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateRole(selectedRole.id, formData);
      await fetchRoles();
      setIsModalOpen(false);
      setSelectedRole(null);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role? Users with this role will need to be reassigned first.')) {
      return;
    }

    try {
      await apiService.deleteRole(id);
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to delete role');
      alert(err.message || 'Failed to delete role');
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      can_self_register: role.can_self_register || false,
      home_page: role.home_page || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      can_self_register: false,
      home_page: '',
    });
    setSelectedRole(null);
    setError(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: 'name', title: 'Role Name' },
    {
      key: 'description',
      title: 'Description',
      render: (value) => value || 'No description',
    },
    {
      key: 'can_self_register',
      title: 'Self Register',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-badge--active' : 'status-badge--inactive'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'home_page',
      title: 'Home Page',
      render: (value) => value || <span style={{ color: '#999' }}>Not set</span>,
    },
    {
      key: 'created_at',
      title: 'Created Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={() => handleEditRole(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteRole(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-roles">
      <div className="admin-roles-header">
        <div>
          <h1 className="admin-page-title">Roles Management</h1>
          <p className="admin-page-subtitle">Manage user roles and permissions</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add New Role
        </Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-roles-filters">
          <Input
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredRoles}
          loading={loading}
          emptyMessage="No roles found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
        size="medium"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedRole ? handleUpdateRole : handleCreateRole}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedRole ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="role-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <Input
            label="Role Name"
            placeholder="Enter role name (e.g., Student, Instructor)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Description"
            placeholder="Enter role description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_self_register}
                onChange={(e) => setFormData({ ...formData, can_self_register: e.target.checked })}
                className="checkbox-input"
              />
              <span>Allow self-registration</span>
            </label>
            <p className="form-helper-text">
              If enabled, users can register themselves with this role
            </p>
          </div>
          <Input
            label="Home Page / Redirect URL"
            placeholder="e.g., /admin, /student/dashboard, /instructor/dashboard"
            value={formData.home_page}
            onChange={(e) => setFormData({ ...formData, home_page: e.target.value })}
            fullWidth
          />
          <p className="form-helper-text" style={{ marginTop: '-10px', marginBottom: '20px' }}>
            URL to redirect users with this role after login (e.g., /admin, /student/dashboard)
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;

