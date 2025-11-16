import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import ContentPreview from '../../components/common/ContentPreview/ContentPreview';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import apiService from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import './Contents.css';

const Contents = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video',
    content_source: 'external',
    content_url: '',
    thumbnail_url: '',
    status: 'active',
    metadata: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchContents();
  }, [filterType, filterSource, filterStatus]);

  // Refetch when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        content_type: filterType || undefined,
        content_source: filterSource || undefined,
        status: filterStatus || undefined,
        limit: 100,
      };
      const response = await apiService.getContents(filters);
      setContents(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch contents');
      console.error('Error fetching contents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title || !formData.content_url) {
        setError('Title and Content URL are required');
        setIsSubmitting(false);
        return;
      }

      // Validate and parse metadata JSON
      let parsedMetadata = null;
      if (formData.metadata && formData.metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(formData.metadata);
        } catch (e) {
          setError('Invalid JSON in metadata field. Please check your JSON syntax.');
          setIsSubmitting(false);
          return;
        }
      }

      const contentData = {
        ...formData,
        metadata: parsedMetadata,
      };

      await apiService.createContent(contentData);
      await fetchContents();
      setIsModalOpen(false);
      resetForm();
      // Show success message
      alert('Content created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContent = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title || !formData.content_url) {
        setError('Title and Content URL are required');
        setIsSubmitting(false);
        return;
      }

      // Validate and parse metadata JSON
      let parsedMetadata = null;
      if (formData.metadata && formData.metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(formData.metadata);
        } catch (e) {
          setError('Invalid JSON in metadata field. Please check your JSON syntax.');
          setIsSubmitting(false);
          return;
        }
      }

      const contentData = {
        ...formData,
        metadata: parsedMetadata,
      };

      await apiService.updateContent(selectedContent.id, contentData);
      await fetchContents();
      setIsModalOpen(false);
      setSelectedContent(null);
      resetForm();
      // Show success message
      alert('Content updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await apiService.deleteContent(id);
      await fetchContents();
      // Show success message
      alert('Content deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete content');
      alert(err.message || 'Failed to delete content');
    }
  };

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setFormData({
      title: content.title || '',
      description: content.description || '',
      content_type: content.content_type || 'video',
      content_source: content.content_source || 'external',
      content_url: content.content_url || '',
      thumbnail_url: content.thumbnail_url || '',
      status: content.status || 'active',
      metadata: content.metadata 
        ? (typeof content.metadata === 'string' 
            ? content.metadata 
            : JSON.stringify(content.metadata, null, 2))
        : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content_type: 'video',
      content_source: 'external',
      content_url: '',
      thumbnail_url: '',
      status: 'active',
      metadata: '',
    });
    setSelectedContent(null);
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

  const getContentTypeIcon = (type) => {
    const icons = {
      video: '🎥',
      file: '📄',
      markdown: '📝',
      image: '🖼️',
    };
    return icons[type] || '📄';
  };

  const getSourceBadge = (source) => {
    return source === 'internal' ? (
      <span className="badge badge--internal">Internal</span>
    ) : (
      <span className="badge badge--external">External</span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="badge badge--active">Active</span>,
      inactive: <span className="badge badge--inactive">Inactive</span>,
      draft: <span className="badge badge--draft">Draft</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      !searchTerm ||
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const columns = [
    {
      key: 'content_type',
      title: 'Type',
      render: (value) => (
        <span className="content-type-cell">
          {getContentTypeIcon(value)} {value}
        </span>
      ),
    },
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
      key: 'content_source',
      title: 'Source',
      render: (value) => getSourceBadge(value),
    },
    {
      key: 'content_url',
      title: 'URL',
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="content-url-link">
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </a>
      ),
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
            onClick={() => {
              setPreviewContent(row);
              setIsPreviewModalOpen(true);
            }}
          >
            Preview
          </Button>
          {hasPermission('/admin/contents', 'edit') && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleEditContent(row)}
            >
              Edit
            </Button>
          )}
          {hasPermission('/admin/contents', 'delete') && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeleteContent(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-contents">
      <div className="admin-contents-header">
        <div>
          <h1 className="admin-page-title">Content Management</h1>
          <p className="admin-page-subtitle">Manage videos, files, markdown, and images (internal & external)</p>
        </div>
        {hasPermission('/admin/contents', 'add') && (
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add New Content
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-contents-filters">
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <div className="filter-group">
            <div className="filter-item">
              <label className="filter-label">Content Type</label>
              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="video">Video</option>
                <option value="file">File</option>
                <option value="markdown">Markdown</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">Source</label>
              <select
                className="filter-select"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">Status</label>
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
            <Button variant="outline" onClick={fetchContents}>
              Apply Filters
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredContents}
          loading={loading}
          emptyMessage="No contents found"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedContent ? 'Edit Content' : 'Add New Content'}
        size="large"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={selectedContent ? handleUpdateContent : handleCreateContent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedContent ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="content-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <Input
            label="Title"
            placeholder="Enter content title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />
          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Description
            </label>
            <textarea
              className="input textarea"
              placeholder="Enter content description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-row">
            <div className="input-wrapper">
              <label className="input-label">
                Content Type <span className="input-required">*</span>
              </label>
              <select
                className="input"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                disabled={isSubmitting}
                required
              >
                <option value="video">Video</option>
                <option value="file">File</option>
                <option value="markdown">Markdown</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">
                Content Source <span className="input-required">*</span>
              </label>
              <select
                className="input"
                value={formData.content_source}
                onChange={(e) => setFormData({ ...formData, content_source: e.target.value })}
                disabled={isSubmitting}
                required
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
          
          {formData.content_source === 'internal' ? (
            <div className="input-wrapper input-wrapper--full-width">
              <label className="input-label">
                Upload File <span className="input-required">*</span>
              </label>
              <FileUpload
                onUploadSuccess={(fileData) => {
                  setFormData({ ...formData, content_url: fileData.url });
                }}
                onUploadError={(error) => {
                  setError(error || 'Failed to upload file');
                }}
                disabled={isSubmitting}
                accept={formData.content_type === 'video' ? 'video/*' : formData.content_type === 'image' ? 'image/*' : '*'}
              />
              {formData.content_url && (
                <div className="uploaded-file-info">
                  <span className="uploaded-file-url">✓ {formData.content_url}</span>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setFormData({ ...formData, content_url: '' })}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Input
                label="Content URL"
                placeholder={
                  formData.content_type === 'video'
                    ? 'https://youtube.com/watch?v=... or https://vimeo.com/... or direct video URL'
                    : formData.content_type === 'image'
                    ? 'https://example.com/image.jpg'
                    : 'https://example.com/file.pdf'
                }
                value={formData.content_url}
                onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                fullWidth
                required
                disabled={isSubmitting}
                helperText={
                  formData.content_type === 'video'
                    ? 'Supports YouTube, Vimeo, or direct video URLs'
                    : 'External URL (e.g., https://example.com/file.pdf)'
                }
              />
              {(formData.content_url && (formData.content_url.includes('youtube.com') || formData.content_url.includes('youtu.be') || formData.content_url.includes('vimeo.com'))) && (
                <div className="embed-notice">
                  ✓ Embedded video URL detected. Preview will show embedded player.
                </div>
              )}
            </>
          )}
          <Input
            label="Thumbnail URL (Optional)"
            placeholder="https://example.com/thumbnail.jpg"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />
          <div className="form-row">
            <div className="input-wrapper">
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
          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Metadata (JSON, Optional)
            </label>
            <textarea
              className="input textarea"
              placeholder='{"key": "value"}'
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              rows={4}
              disabled={isSubmitting}
            />
            <span className="input-helper">Enter valid JSON for additional metadata</span>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewContent(null);
        }}
        title={previewContent ? `Preview: ${previewContent.title}` : 'Content Preview'}
        size="large"
        footer={
          <div>
            <Button variant="outline" onClick={() => {
              setIsPreviewModalOpen(false);
              setPreviewContent(null);
            }}>
              Close
            </Button>
            {previewContent && (
              <Button
                variant="primary"
                onClick={() => {
                  window.open(previewContent.content_url, '_blank');
                }}
              >
                Open Original
              </Button>
            )}
          </div>
        }
      >
        {previewContent && (
          <div className="content-preview-container">
            <ContentPreview content={previewContent} />
            <div className="content-preview-details">
              <h3>{previewContent.title}</h3>
              {previewContent.description && <p>{previewContent.description}</p>}
              <div className="content-preview-meta">
                <span className="meta-item">Type: {previewContent.content_type}</span>
                <span className="meta-item">Source: {previewContent.content_source}</span>
                <span className="meta-item">Status: {previewContent.status}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contents;

