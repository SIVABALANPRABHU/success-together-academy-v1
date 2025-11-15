import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import './Features.css';

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    path: '',
    description: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    icon: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getFeatures();
      setFeatures(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch features');
      console.error('Error fetching features:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeature = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name) {
        setError('Feature name is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createFeature(formData);
      await fetchFeatures();
      setIsModalOpen(false);
      resetForm();
      // Trigger sidebar refresh by reloading page or using event
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to create feature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFeature = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name) {
        setError('Feature name is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateFeature(selectedFeature.id, formData);
      await fetchFeatures();
      setIsModalOpen(false);
      setSelectedFeature(null);
      resetForm();
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to update feature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feature? This will also delete all associated permissions.')) {
      return;
    }

    try {
      await apiService.deleteFeature(id);
      await fetchFeatures();
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to delete feature');
      alert(err.message || 'Failed to delete feature');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFeatures.length === 0) {
      alert('Please select features to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedFeatures.length} feature(s)? This will also delete all associated permissions.`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selectedFeatures.map(id => apiService.deleteFeature(id)));
      setSelectedFeatures([]);
      await fetchFeatures();
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to delete features');
      alert(err.message || 'Failed to delete features');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedFeatures.length === 0) {
      alert('Please select features to update');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updates = {};
      if (bulkFormData.icon) updates.icon = bulkFormData.icon;
      if (bulkFormData.description) updates.description = bulkFormData.description;

      if (Object.keys(updates).length === 0) {
        setError('Please provide at least one field to update');
        setIsSubmitting(false);
        return;
      }

      await Promise.all(
        selectedFeatures.map(id => apiService.updateFeature(id, updates))
      );

      setSelectedFeatures([]);
      setIsBulkModalOpen(false);
      resetBulkForm();
      await fetchFeatures();
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to update features');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const names = bulkFormData.names?.split('\n').filter(n => n.trim()).map(n => n.trim()) || [];
      if (names.length === 0) {
        setError('Please enter at least one feature name');
        setIsSubmitting(false);
        return;
      }

      await Promise.all(
        names.map(name => apiService.createFeature({
          name,
          icon: bulkFormData.icon || '',
          path: bulkFormData.path || '',
          description: bulkFormData.description || '',
        }))
      );

      setIsBulkModalOpen(false);
      resetBulkForm();
      await fetchFeatures();
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('featuresUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to create features');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFeature = (feature) => {
    setSelectedFeature(feature);
    setFormData({
      name: feature.name,
      icon: feature.icon || '',
      path: feature.path || '',
      description: feature.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSelectFeature = (id) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeatures.length === filteredFeatures.length) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(filteredFeatures.map(f => f.id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      path: '',
      description: '',
    });
    setSelectedFeature(null);
    setError(null);
  };

  const resetBulkForm = () => {
    setBulkFormData({
      names: '',
      icon: '',
      path: '',
      description: '',
    });
    setError(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleBulkModalClose = () => {
    setIsBulkModalOpen(false);
    resetBulkForm();
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

  const filteredFeatures = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (feature.path && feature.path.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (feature.description && feature.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      key: 'checkbox',
      title: '',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedFeatures.includes(row.id)}
          onChange={() => handleSelectFeature(row.id)}
        />
      ),
    },
    { key: 'name', title: 'Feature Name' },
    {
      key: 'icon',
      title: 'Icon',
      render: (value) => value || <span style={{ color: '#999' }}>No icon</span>,
    },
    {
      key: 'path',
      title: 'Path',
      render: (value) => value || <span style={{ color: '#999' }}>Not set</span>,
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => value || 'No description',
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
          {hasPermission('/admin/features', 'edit') && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleEditFeature(row)}
            >
              Edit
            </Button>
          )}
          {hasPermission('/admin/features', 'delete') && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeleteFeature(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-features">
      <div className="admin-features-header">
        <div>
          <h1 className="admin-page-title">Features Management</h1>
          <p className="admin-page-subtitle">Manage system features and their configurations</p>
        </div>
        <div className="admin-features-actions">
          {selectedFeatures.length > 0 && (
            <>
              {hasPermission('/admin/features', 'delete') && (
                <Button variant="danger" onClick={handleBulkDelete}>
                  Delete Selected ({selectedFeatures.length})
                </Button>
              )}
              {hasPermission('/admin/features', 'edit') && (
                <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                  Bulk Edit ({selectedFeatures.length})
                </Button>
              )}
            </>
          )}
          {hasPermission('/admin/features', 'add') && (
            <>
              <Button variant="outline" onClick={() => {
                setBulkFormData({ names: '', icon: '', path: '', description: '' });
                setIsBulkModalOpen(true);
              }}>
                Bulk Create
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Add New Feature
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
        <div className="admin-features-filters">
          <Input
            placeholder="Search features by name, path, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          {filteredFeatures.length > 0 && (
            <div className="bulk-select-all">
              <input
                type="checkbox"
                checked={selectedFeatures.length === filteredFeatures.length && filteredFeatures.length > 0}
                onChange={handleSelectAll}
              />
              <span>Select All ({selectedFeatures.length} selected)</span>
            </div>
          )}
        </div>
        <DataTable
          columns={columns}
          data={filteredFeatures}
          loading={loading}
          emptyMessage="No features found"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedFeature ? 'Edit Feature' : 'Add New Feature'}
        size="medium"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedFeature ? handleUpdateFeature : handleCreateFeature}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedFeature ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="feature-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <Input
            label="Feature Name"
            placeholder="Enter feature name (e.g., Dashboard, Users)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />
          <Input
            label="Icon"
            placeholder="Enter icon (emoji or icon code)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />
          <Input
            label="Path"
            placeholder="Enter route path (e.g., /admin/users)"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />
          <Input
            label="Description"
            placeholder="Enter feature description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />
        </div>
      </Modal>

      {/* Bulk Operations Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={handleBulkModalClose}
        title={selectedFeatures.length > 0 ? 'Bulk Edit Features' : 'Bulk Create Features'}
        size="large"
        footer={
          <div>
            <Button variant="outline" onClick={handleBulkModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedFeatures.length > 0 ? handleBulkUpdate : handleBulkCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : selectedFeatures.length > 0 ? 'Update Selected' : 'Create Features'}
            </Button>
          </div>
        }
      >
        <div className="feature-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          {selectedFeatures.length > 0 ? (
            <>
              <p className="form-info">
                Updating {selectedFeatures.length} feature(s). Leave fields empty to keep existing values.
              </p>
              <Input
                label="Icon"
                placeholder="Enter icon (emoji or icon code) - Leave empty to keep existing"
                value={bulkFormData.icon}
                onChange={(e) => setBulkFormData({ ...bulkFormData, icon: e.target.value })}
                fullWidth
                disabled={isSubmitting}
              />
              <Input
                label="Description"
                placeholder="Enter description - Leave empty to keep existing"
                value={bulkFormData.description}
                onChange={(e) => setBulkFormData({ ...bulkFormData, description: e.target.value })}
                fullWidth
                disabled={isSubmitting}
              />
            </>
          ) : (
            <>
              <div className="input-wrapper input-wrapper--full-width">
                <label className="input-label">
                  Feature Names (one per line) <span className="input-required">*</span>
                </label>
                <textarea
                  className="input"
                  placeholder="Enter feature names, one per line&#10;Example:&#10;Dashboard&#10;Users&#10;Courses"
                  value={bulkFormData.names}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, names: e.target.value })}
                  rows={6}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <Input
                label="Icon (applied to all)"
                placeholder="Enter icon (emoji or icon code)"
                value={bulkFormData.icon}
                onChange={(e) => setBulkFormData({ ...bulkFormData, icon: e.target.value })}
                fullWidth
                disabled={isSubmitting}
              />
              <Input
                label="Path Prefix (optional)"
                placeholder="Enter path prefix (e.g., /admin)"
                value={bulkFormData.path}
                onChange={(e) => setBulkFormData({ ...bulkFormData, path: e.target.value })}
                fullWidth
                disabled={isSubmitting}
              />
              <Input
                label="Description (applied to all)"
                placeholder="Enter description"
                value={bulkFormData.description}
                onChange={(e) => setBulkFormData({ ...bulkFormData, description: e.target.value })}
                fullWidth
                disabled={isSubmitting}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Features;

