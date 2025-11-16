import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import apiService from '../../services/api';
import './Pages.css';

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    content_id: '',
    order_index: 0,
    status: 'active',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchContents();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPages();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        status: filterStatus || undefined,
        limit: 100,
      };
      const response = await apiService.getPages(filters);
      setPages(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch pages');
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async () => {
    try {
      const response = await apiService.getContents({ limit: 1000 });
      setContents(response.data || []);
    } catch (err) {
      console.error('Error fetching contents:', err);
    }
  };

  const handleCreatePage = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createPage(formData);
      await fetchPages();
      setIsModalOpen(false);
      resetForm();
      alert('Page created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePage = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updatePage(selectedPage.id, formData);
      await fetchPages();
      setIsModalOpen(false);
      setSelectedPage(null);
      resetForm();
      alert('Page updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      await apiService.deletePage(id);
      await fetchPages();
      alert('Page deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete page');
      alert('Failed to delete page: ' + err.message);
    }
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title || '',
      description: page.description || '',
      thumbnail_url: page.thumbnail_url || '',
      content_id: page.content_id || '',
      order_index: page.order_index || 0,
      status: page.status || 'active',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      content_id: '',
      order_index: 0,
      status: 'active',
    });
    setSelectedPage(null);
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

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="badge badge--active">Active</span>,
      inactive: <span className="badge badge--inactive">Inactive</span>,
      draft: <span className="badge badge--draft">Draft</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      !searchTerm ||
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (page.description && page.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const columns = [
    { key: 'title', title: 'Title' },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <span className="description-cell">
          {value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 'No description'}
        </span>
      ),
    },
    {
      key: 'content_title',
      title: 'Content',
      render: (value) => value || <span className="text-muted">No content</span>,
    },
    {
      key: 'order_index',
      title: 'Order',
      align: 'center',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'created_at',
      title: 'Created',
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
            onClick={(e) => {
              e.stopPropagation();
              handleEditPage(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePage(row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="pages-container">
      <Card>
        <div className="card-header">
          <h1>Pages Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Page</Button>
        </div>

        <div className="filters">
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <DataTable
          columns={columns}
          data={filteredPages}
          loading={loading}
          emptyMessage="No pages found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedPage ? 'Edit Page' : 'Create Page'}
        size="large"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={selectedPage ? handleUpdatePage : handleCreatePage}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedPage ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="form-container">
          <Input
            label="Title"
            placeholder="Enter page title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />

          <Input
            label="Description"
            placeholder="Enter page description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">Thumbnail</label>
            <FileUpload
              onUploadSuccess={(fileData) => {
                setFormData({ ...formData, thumbnail_url: fileData.url });
              }}
              onUploadError={(error) => {
                setError(error || 'Failed to upload thumbnail');
              }}
              disabled={isSubmitting}
              accept="image/*"
            />
            {formData.thumbnail_url && (
              <div className="uploaded-file-info">
                <span className="uploaded-file-url">✓ {formData.thumbnail_url}</span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Content <span className="input-required">*</span>
            </label>
            <select
              className="input"
              value={formData.content_id}
              onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Content</option>
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.title} ({content.content_type})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Order Index"
            type="number"
            placeholder="0"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            fullWidth
            disabled={isSubmitting}
          />

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Pages;

