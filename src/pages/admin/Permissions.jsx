import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import './Permissions.css';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [features, setFeatures] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterFeature, setFilterFeature] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formData, setFormData] = useState({
    feature_id: '',
    role_id: '',
    can_view: false,
    can_view_detail: false,
    can_add: false,
    can_edit: false,
    can_delete: false,
  });
  const [bulkFormData, setBulkFormData] = useState({
    role_id: '',
    feature_ids: [],
    permissions: {
      can_view: false,
      can_view_detail: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
    },
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [permissionsRes, featuresRes, rolesRes] = await Promise.all([
        apiService.getPermissions(),
        apiService.getFeatures(),
        apiService.getRoles(),
      ]);
      setPermissions(permissionsRes.data || []);
      setFeatures(featuresRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.feature_id || !formData.role_id) {
        setError('Feature and Role are required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createPermission(formData);
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      await apiService.updatePermission(selectedPermission.id, {
        can_view: formData.can_view,
        can_view_detail: formData.can_view_detail,
        can_add: formData.can_add,
        can_edit: formData.can_edit,
        can_delete: formData.can_delete,
      });
      await fetchData();
      setIsModalOpen(false);
      setSelectedPermission(null);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to update permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) {
      return;
    }

    try {
      await apiService.deletePermission(id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete permission');
      alert(err.message || 'Failed to delete permission');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPermissions.length === 0) {
      alert('Please select permissions to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedPermissions.length} permission(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selectedPermissions.map(id => apiService.deletePermission(id)));
      setSelectedPermissions([]);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete permissions');
      alert(err.message || 'Failed to delete permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedPermissions.length === 0) {
      alert('Please select permissions to update');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await Promise.all(
        selectedPermissions.map(id => {
          const perm = permissions.find(p => p.id === id);
          if (!perm) return Promise.resolve();
          
          return apiService.updatePermission(id, {
            can_view: bulkFormData.permissions.can_view !== undefined 
              ? bulkFormData.permissions.can_view 
              : perm.can_view,
            can_view_detail: bulkFormData.permissions.can_view_detail !== undefined 
              ? bulkFormData.permissions.can_view_detail 
              : perm.can_view_detail,
            can_add: bulkFormData.permissions.can_add !== undefined 
              ? bulkFormData.permissions.can_add 
              : perm.can_add,
            can_edit: bulkFormData.permissions.can_edit !== undefined 
              ? bulkFormData.permissions.can_edit 
              : perm.can_edit,
            can_delete: bulkFormData.permissions.can_delete !== undefined 
              ? bulkFormData.permissions.can_delete 
              : perm.can_delete,
          });
        })
      );

      setSelectedPermissions([]);
      setIsBulkModalOpen(false);
      resetBulkForm();
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!bulkFormData.role_id) {
        setError('Role is required');
        setIsSubmitting(false);
        return;
      }

      if (bulkFormData.feature_ids.length === 0) {
        setError('Please select at least one feature');
        setIsSubmitting(false);
        return;
      }

      // Check for existing permissions and skip them
      const existingPermissions = permissions.filter(
        p => p.role_id === parseInt(bulkFormData.role_id) && bulkFormData.feature_ids.includes(p.feature_id)
      );

      if (existingPermissions.length > 0) {
        const existingFeatureNames = existingPermissions.map(p => p.feature_name).join(', ');
        if (!window.confirm(`Some permissions already exist for: ${existingFeatureNames}. Continue creating new ones?`)) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create permissions for features that don't already have them
      const featuresToCreate = bulkFormData.feature_ids.filter(
        featureId => !existingPermissions.some(p => p.feature_id === featureId)
      );

      await Promise.all(
        featuresToCreate.map(featureId => 
          apiService.createPermission({
            feature_id: featureId,
            role_id: bulkFormData.role_id,
            ...bulkFormData.permissions,
          })
        )
      );

      setSelectedPermissions([]);
      setIsBulkModalOpen(false);
      resetBulkForm();
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      feature_id: permission.feature_id,
      role_id: permission.role_id,
      can_view: permission.can_view,
      can_view_detail: permission.can_view_detail,
      can_add: permission.can_add,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
    });
    setIsModalOpen(true);
  };

  const handleSelectPermission = (id) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === filteredPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(filteredPermissions.map(p => p.id));
    }
  };

  const resetForm = () => {
    setFormData({
      feature_id: '',
      role_id: '',
      can_view: false,
      can_view_detail: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
    });
    setSelectedPermission(null);
    setError(null);
  };

  const resetBulkForm = () => {
    setBulkFormData({
      role_id: '',
      feature_ids: [],
      permissions: {
        can_view: false,
        can_view_detail: false,
        can_add: false,
        can_edit: false,
        can_delete: false,
      },
    });
    setError(null);
  };

  const handleFeatureToggle = (featureId) => {
    setBulkFormData(prev => ({
      ...prev,
      feature_ids: prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter(id => id !== featureId)
        : [...prev.feature_ids, featureId]
    }));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleBulkModalClose = () => {
    setIsBulkModalOpen(false);
    resetBulkForm();
    setSelectedPermissions([]);
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

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = 
      permission.feature_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.role_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || permission.role_id === parseInt(filterRole);
    const matchesFeature = !filterFeature || permission.feature_id === parseInt(filterFeature);
    return matchesSearch && matchesRole && matchesFeature;
  });

  const columns = [
    {
      key: 'checkbox',
      title: '',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedPermissions.includes(row.id)}
          onChange={() => handleSelectPermission(row.id)}
        />
      ),
    },
    { key: 'role_name', title: 'Role' },
    { key: 'feature_name', title: 'Feature' },
    {
      key: 'feature_icon',
      title: 'Icon',
      render: (value) => value || '-',
    },
    {
      key: 'can_view',
      title: 'View',
      render: (value) => (
        <span className={`permission-badge ${value ? 'permission-badge--yes' : 'permission-badge--no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'can_view_detail',
      title: 'View Detail',
      render: (value) => (
        <span className={`permission-badge ${value ? 'permission-badge--yes' : 'permission-badge--no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'can_add',
      title: 'Add',
      render: (value) => (
        <span className={`permission-badge ${value ? 'permission-badge--yes' : 'permission-badge--no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'can_edit',
      title: 'Edit',
      render: (value) => (
        <span className={`permission-badge ${value ? 'permission-badge--yes' : 'permission-badge--no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'can_delete',
      title: 'Delete',
      render: (value) => (
        <span className={`permission-badge ${value ? 'permission-badge--yes' : 'permission-badge--no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions">
          {hasPermission('/admin/permissions', 'edit') && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleEditPermission(row)}
            >
              Edit
            </Button>
          )}
          {hasPermission('/admin/permissions', 'delete') && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeletePermission(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-permissions">
      <div className="admin-permissions-header">
        <div>
          <h1 className="admin-page-title">Permissions Management</h1>
          <p className="admin-page-subtitle">Manage role-based permissions for features</p>
        </div>
        <div className="admin-permissions-actions">
          {selectedPermissions.length > 0 && (
            <>
              {hasPermission('/admin/permissions', 'delete') && (
                <Button variant="danger" onClick={handleBulkDelete}>
                  Delete Selected ({selectedPermissions.length})
                </Button>
              )}
              {hasPermission('/admin/permissions', 'edit') && (
                <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                  Bulk Edit ({selectedPermissions.length})
                </Button>
              )}
            </>
          )}
          {hasPermission('/admin/permissions', 'add') && (
            <>
              <Button variant="outline" onClick={() => {
                resetBulkForm();
                setIsBulkModalOpen(true);
              }}>
                Bulk Create
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Add New Permission
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-permissions-filters">
          <Input
            placeholder="Search permissions by role or feature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterFeature}
              onChange={(e) => setFilterFeature(e.target.value)}
            >
              <option value="">All Features</option>
              {features.map(feature => (
                <option key={feature.id} value={feature.id}>{feature.name}</option>
              ))}
            </select>
          </div>
          {filteredPermissions.length > 0 && (
            <div className="bulk-select-all">
              <input
                type="checkbox"
                checked={selectedPermissions.length === filteredPermissions.length && filteredPermissions.length > 0}
                onChange={handleSelectAll}
              />
              <span>Select All ({selectedPermissions.length} selected)</span>
            </div>
          )}
        </div>
        <DataTable
          columns={columns}
          data={filteredPermissions}
          loading={loading}
          emptyMessage="No permissions found"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedPermission ? 'Edit Permission' : 'Add New Permission'}
        size="medium"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedPermission ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="permission-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <div className="form-group">
            <label className="input-label">Feature <span className="input-required">*</span></label>
            <select
              className="input"
              value={formData.feature_id}
              onChange={(e) => setFormData({ ...formData, feature_id: e.target.value })}
              disabled={isSubmitting || !!selectedPermission}
              required
            >
              <option value="">Select Feature</option>
              {features.map(feature => (
                <option key={feature.id} value={feature.id}>{feature.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="input-label">Role <span className="input-required">*</span></label>
            <select
              className="input"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              disabled={isSubmitting || !!selectedPermission}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="permission-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_view}
                onChange={(e) => setFormData({ ...formData, can_view: e.target.checked })}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span>Can View</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_view_detail}
                onChange={(e) => setFormData({ ...formData, can_view_detail: e.target.checked })}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span>Can View Detail</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_add}
                onChange={(e) => setFormData({ ...formData, can_add: e.target.checked })}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span>Can Add</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_edit}
                onChange={(e) => setFormData({ ...formData, can_edit: e.target.checked })}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span>Can Edit</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.can_delete}
                onChange={(e) => setFormData({ ...formData, can_delete: e.target.checked })}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span>Can Delete</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Bulk Operations Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={handleBulkModalClose}
        title={selectedPermissions.length > 0 ? 'Bulk Edit Permissions' : 'Bulk Create Permissions'}
        size="large"
        footer={
          <div>
            <Button variant="outline" onClick={handleBulkModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedPermissions.length > 0 ? handleBulkUpdate : handleBulkCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : selectedPermissions.length > 0 ? 'Update Selected' : 'Create Permissions'}
            </Button>
          </div>
        }
      >
        <div className="permission-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          {selectedPermissions.length > 0 ? (
            <>
              <p className="form-info">
                Updating {selectedPermissions.length} permission(s). Check boxes to enable, uncheck to disable. Leave unchecked to keep existing values.
              </p>
              <div className="permission-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_view}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_view: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can View</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_view_detail}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_view_detail: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can View Detail</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_add}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_add: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Add</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_edit}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_edit: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Edit</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_delete}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_delete: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Delete</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="input-label">Role <span className="input-required">*</span></label>
                <select
                  className="input"
                  value={bulkFormData.role_id}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, role_id: e.target.value })}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Features <span className="input-required">*</span></label>
                <div className="feature-selector">
                  {features.map(feature => (
                    <label key={feature.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={bulkFormData.feature_ids.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="checkbox-input"
                        disabled={isSubmitting}
                      />
                      <span>{feature.icon} {feature.name}</span>
                    </label>
                  ))}
                </div>
                {bulkFormData.feature_ids.length > 0 && (
                  <p className="form-helper-text">
                    {bulkFormData.feature_ids.length} feature(s) selected
                  </p>
                )}
              </div>
              <p className="form-info">
                Select features above, then set the permissions below. These permissions will be applied to all selected features.
              </p>
              <div className="permission-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_view}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_view: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can View</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_view_detail}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_view_detail: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can View Detail</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_add}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_add: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Add</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_edit}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_edit: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Edit</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bulkFormData.permissions.can_delete}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      permissions: { ...bulkFormData.permissions, can_delete: e.target.checked }
                    })}
                    className="checkbox-input"
                    disabled={isSubmitting}
                  />
                  <span>Can Delete</span>
                </label>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Permissions;

