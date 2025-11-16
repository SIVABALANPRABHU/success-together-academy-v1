import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import apiService from '../../services/api';
import './Chapters.css';

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedChapterPages, setSelectedChapterPages] = useState([]);
  const [selectedPageIds, setSelectedPageIds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    order_index: 0,
    status: 'active',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChapters();
    fetchPages();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChapters();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        status: filterStatus || undefined,
        limit: 100,
      };
      const response = await apiService.getChapters(filters);
      setChapters(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch chapters');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await apiService.getPages({ limit: 1000 });
      setPages(response.data || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  const fetchChapterPages = async (chapterId) => {
    try {
      const response = await apiService.getPagesByChapter(chapterId);
      setSelectedChapterPages(response.data || []);
    } catch (err) {
      console.error('Error fetching chapter pages:', err);
    }
  };

  const handleCreateChapter = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createChapter(formData);
      await fetchChapters();
      setIsModalOpen(false);
      resetForm();
      alert('Chapter created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateChapter = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateChapter(selectedChapter.id, formData);
      await fetchChapters();
      setIsModalOpen(false);
      setSelectedChapter(null);
      resetForm();
      alert('Chapter updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) {
      return;
    }

    try {
      await apiService.deleteChapter(id);
      await fetchChapters();
      alert('Chapter deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete chapter');
      alert('Failed to delete chapter: ' + err.message);
    }
  };

  const handleEditChapter = (chapter) => {
    setSelectedChapter(chapter);
    setFormData({
      title: chapter.title || '',
      description: chapter.description || '',
      thumbnail_url: chapter.thumbnail_url || '',
      order_index: chapter.order_index || 0,
      status: chapter.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleManagePages = async (chapter) => {
    setSelectedChapter(chapter);
    setSelectedPageIds([]);
    await fetchChapterPages(chapter.id);
    setIsPageModalOpen(true);
  };

  const handleAddPageToChapter = async (pageId) => {
    if (!selectedChapter) return;
    try {
      const currentMaxOrder = selectedChapterPages.length > 0
        ? Math.max(...selectedChapterPages.map(p => p.chapter_order || 0))
        : -1;
      await apiService.addPageToChapter(selectedChapter.id, pageId, currentMaxOrder + 1);
      await fetchChapterPages(selectedChapter.id);
    } catch (err) {
      setError(err.message || 'Failed to add page');
      alert('Failed to add page: ' + err.message);
    }
  };

  const handleBulkAddPages = async () => {
    if (!selectedChapter || selectedPageIds.length === 0) return;
    try {
      await apiService.addPagesToChapter(selectedChapter.id, selectedPageIds);
      await fetchChapterPages(selectedChapter.id);
      setSelectedPageIds([]);
      alert(`${selectedPageIds.length} page(s) added successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to add pages');
      alert('Failed to add pages: ' + err.message);
    }
  };

  const handleTogglePageSelection = (pageId) => {
    setSelectedPageIds(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleRemovePageFromChapter = async (pageId) => {
    if (!selectedChapter) return;
    try {
      await apiService.removePageFromChapter(selectedChapter.id, pageId);
      await fetchChapterPages(selectedChapter.id);
    } catch (err) {
      setError(err.message || 'Failed to remove page');
      alert('Failed to remove page: ' + err.message);
    }
  };

  const handleMovePage = async (pageId, direction) => {
    if (!selectedChapter) return;
    const currentIndex = selectedChapterPages.findIndex(p => p.id === pageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedChapterPages.length) return;

    const reordered = [...selectedChapterPages];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    const pageOrders = reordered.map((page, index) => ({
      pageId: page.id,
      orderIndex: index,
    }));

    try {
      await apiService.updateChapterPageOrder(selectedChapter.id, pageOrders);
      await fetchChapterPages(selectedChapter.id);
    } catch (err) {
      setError(err.message || 'Failed to reorder pages');
      alert('Failed to reorder pages: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      order_index: 0,
      status: 'active',
    });
    setSelectedChapter(null);
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

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch =
      !searchTerm ||
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chapter.description && chapter.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const availablePages = pages.filter(
    page => !selectedChapterPages.some(cp => cp.id === page.id)
  );

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
              handleManagePages(row);
            }}
          >
            Manage Pages
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditChapter(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteChapter(row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="chapters-container">
      <Card>
        <div className="card-header">
          <h1>Chapters Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Chapter</Button>
        </div>

        <div className="filters">
          <Input
            placeholder="Search chapters..."
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
          data={filteredChapters}
          loading={loading}
          emptyMessage="No chapters found"
        />
      </Card>

      {/* Create/Edit Chapter Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedChapter ? 'Edit Chapter' : 'Create Chapter'}
        size="large"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={selectedChapter ? handleUpdateChapter : handleCreateChapter}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedChapter ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="form-container">
          <Input
            label="Title"
            placeholder="Enter chapter title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />

          <Input
            label="Description"
            placeholder="Enter chapter description"
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

      {/* Manage Pages Modal */}
      <Modal
        isOpen={isPageModalOpen}
        onClose={() => {
          setIsPageModalOpen(false);
          setSelectedChapter(null);
          setSelectedChapterPages([]);
        }}
        title={selectedChapter ? `Manage Pages: ${selectedChapter.title}` : 'Manage Pages'}
        size="large"
      >
        <div className="page-management-container">
          <div className="page-list-section">
            <h3>Pages in Chapter</h3>
            {selectedChapterPages.length === 0 ? (
              <p className="text-muted">No pages added yet</p>
            ) : (
              <div className="ordered-list">
                {selectedChapterPages.map((page, index) => (
                  <div key={page.id} className="ordered-item">
                    <div className="order-controls">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleMovePage(page.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <span className="order-number">{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleMovePage(page.id, 'down')}
                        disabled={index === selectedChapterPages.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    <div className="item-content">
                      <strong>{page.title}</strong>
                      {page.description && <p className="item-description">{page.description}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleRemovePageFromChapter(page.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="page-add-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add Pages</h3>
              {selectedPageIds.length > 0 && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleBulkAddPages}
                >
                  Add Selected ({selectedPageIds.length})
                </Button>
              )}
            </div>
            {availablePages.length === 0 ? (
              <p className="text-muted">All pages are already added</p>
            ) : (
              <div className="available-items">
                {availablePages.map((page) => (
                  <div key={page.id} className="available-item">
                    <input
                      type="checkbox"
                      checked={selectedPageIds.includes(page.id)}
                      onChange={() => handleTogglePageSelection(page.id)}
                      style={{ marginRight: '10px' }}
                    />
                    <div className="item-content">
                      <strong>{page.title}</strong>
                      {page.description && <p className="item-description">{page.description}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleAddPageToChapter(page.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chapters;

