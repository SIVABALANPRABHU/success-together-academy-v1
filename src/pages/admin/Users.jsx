import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    status: 'Active',
    password: '',
    thumbnail: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers({
        search: searchTerm,
        limit: 100,
      });
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.password) {
        setError('Password is required for new users');
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsSubmitting(false);
        return;
      }

      if (!formData.role_id) {
        setError('Role is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createUser({
        name: formData.name,
        email: formData.email,
        role_id: parseInt(formData.role_id),
        status: formData.status,
        password: formData.password,
        thumbnail: formData.thumbnail || null,
      });
      await fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        setIsSubmitting(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsSubmitting(false);
        return;
      }

      if (!formData.role_id) {
        setError('Role is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        role_id: parseInt(formData.role_id),
        status: formData.status,
        password: formData.password || undefined,
        thumbnail: formData.thumbnail || null,
      });
      await fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role_id: user.role_id || '',
      status: user.status,
      password: '',
      thumbnail: user.thumbnail || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role_id: '',
      status: 'Active',
      password: '',
      thumbnail: '',
    });
    setSelectedUser(null);
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

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, row) => (
        <div className="user-cell">
          {row.thumbnail ? (
            <img src={row.thumbnail} alt={value} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">{value.charAt(0).toUpperCase()}</div>
          )}
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'email', title: 'Email' },
    { 
      key: 'role_name', 
      title: 'Role',
      render: (value) => value || 'N/A'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge status-badge--${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Joined Date',
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
            onClick={() => handleEditUser(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteUser(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <div>
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">Manage all users in the system</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add New User
        </Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-users-filters">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="medium"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedUser ? handleUpdateUser : handleCreateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="user-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <Input
            label="Name"
            placeholder="Enter user name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            required
          />
          {!selectedUser && (
            <Input
              label="Password"
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
            />
          )}
          {selectedUser && (
            <Input
              label="New Password (leave empty to keep current)"
              type="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
            />
          )}
          <Input
            label="Thumbnail URL"
            type="url"
            placeholder="Enter thumbnail/image URL"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            fullWidth
          />
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Role</label>
              <select
                className="input"
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;

