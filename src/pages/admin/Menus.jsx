import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import apiService from '../../services/api';
import './Menus.css';

const Menus = () => {
  const [menus, setMenus] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedMenuCourses, setSelectedMenuCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
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
    fetchMenus();
    fetchCourses();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenus();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        status: filterStatus || undefined,
        limit: 100,
      };
      const response = await apiService.getMenus(filters);
      setMenus(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses({ limit: 1000 });
      setCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchMenuCourses = async (menuId) => {
    try {
      const response = await apiService.getCoursesByMenu(menuId);
      setSelectedMenuCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching menu courses:', err);
    }
  };

  const handleCreateMenu = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createMenu(formData);
      await fetchMenus();
      setIsModalOpen(false);
      resetForm();
      alert('Menu created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMenu = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateMenu(selectedMenu.id, formData);
      await fetchMenus();
      setIsModalOpen(false);
      setSelectedMenu(null);
      resetForm();
      alert('Menu updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) {
      return;
    }

    try {
      await apiService.deleteMenu(id);
      await fetchMenus();
      alert('Menu deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete menu');
      alert('Failed to delete menu: ' + err.message);
    }
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      title: menu.title || '',
      description: menu.description || '',
      thumbnail_url: menu.thumbnail_url || '',
      order_index: menu.order_index || 0,
      status: menu.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleManageCourses = async (menu) => {
    setSelectedMenu(menu);
    setSelectedCourseIds([]);
    await fetchMenuCourses(menu.id);
    setIsCourseModalOpen(true);
  };

  const handleAddCourseToMenu = async (courseId) => {
    if (!selectedMenu) return;
    try {
      const currentMaxOrder = selectedMenuCourses.length > 0
        ? Math.max(...selectedMenuCourses.map(c => c.menu_order || 0))
        : -1;
      await apiService.addCourseToMenu(selectedMenu.id, courseId, currentMaxOrder + 1);
      await fetchMenuCourses(selectedMenu.id);
    } catch (err) {
      setError(err.message || 'Failed to add course');
      alert('Failed to add course: ' + err.message);
    }
  };

  const handleBulkAddCourses = async () => {
    if (!selectedMenu || selectedCourseIds.length === 0) return;
    try {
      await apiService.addCoursesToMenu(selectedMenu.id, selectedCourseIds);
      await fetchMenuCourses(selectedMenu.id);
      setSelectedCourseIds([]);
      alert(`${selectedCourseIds.length} course(s) added successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to add courses');
      alert('Failed to add courses: ' + err.message);
    }
  };

  const handleToggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleRemoveCourseFromMenu = async (courseId) => {
    if (!selectedMenu) return;
    try {
      await apiService.removeCourseFromMenu(selectedMenu.id, courseId);
      await fetchMenuCourses(selectedMenu.id);
    } catch (err) {
      setError(err.message || 'Failed to remove course');
      alert('Failed to remove course: ' + err.message);
    }
  };

  const handleMoveCourse = async (courseId, direction) => {
    if (!selectedMenu) return;
    const currentIndex = selectedMenuCourses.findIndex(c => c.id === courseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedMenuCourses.length) return;

    const reordered = [...selectedMenuCourses];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    const courseOrders = reordered.map((course, index) => ({
      courseId: course.id,
      orderIndex: index,
    }));

    try {
      await apiService.updateMenuCourseOrder(selectedMenu.id, courseOrders);
      await fetchMenuCourses(selectedMenu.id);
    } catch (err) {
      setError(err.message || 'Failed to reorder courses');
      alert('Failed to reorder courses: ' + err.message);
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
    setSelectedMenu(null);
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

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      !searchTerm ||
      menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const availableCourses = courses.filter(
    course => !selectedMenuCourses.some(mc => mc.id === course.id)
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
              handleManageCourses(row);
            }}
          >
            Manage Courses
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMenu(row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="menus-container">
      <Card>
        <div className="card-header">
          <h1>Menus Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Menu</Button>
        </div>

        <div className="filters">
          <Input
            placeholder="Search menus..."
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
          data={filteredMenus}
          loading={loading}
          emptyMessage="No menus found"
        />
      </Card>

      {/* Create/Edit Menu Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedMenu ? 'Edit Menu' : 'Create Menu'}
        size="large"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={selectedMenu ? handleUpdateMenu : handleCreateMenu}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedMenu ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="form-container">
          <Input
            label="Title"
            placeholder="Enter menu title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />

          <Input
            label="Description"
            placeholder="Enter menu description"
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

      {/* Manage Courses Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setSelectedMenu(null);
          setSelectedMenuCourses([]);
        }}
        title={selectedMenu ? `Manage Courses: ${selectedMenu.title}` : 'Manage Courses'}
        size="large"
      >
        <div className="course-management-container">
          <div className="course-list-section">
            <h3>Courses in Menu</h3>
            {selectedMenuCourses.length === 0 ? (
              <p className="text-muted">No courses added yet</p>
            ) : (
              <div className="ordered-list">
                {selectedMenuCourses.map((course, index) => (
                  <div key={course.id} className="ordered-item">
                    <div className="order-controls">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleMoveCourse(course.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <span className="order-number">{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleMoveCourse(course.id, 'down')}
                        disabled={index === selectedMenuCourses.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    <div className="item-content">
                      <strong>{course.title}</strong>
                      {course.description && <p className="item-description">{course.description}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleRemoveCourseFromMenu(course.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="course-add-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add Courses</h3>
              {selectedCourseIds.length > 0 && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleBulkAddCourses}
                >
                  Add Selected ({selectedCourseIds.length})
                </Button>
              )}
            </div>
            {availableCourses.length === 0 ? (
              <p className="text-muted">All courses are already added</p>
            ) : (
              <div className="available-items">
                {availableCourses.map((course) => (
                  <div key={course.id} className="available-item">
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => handleToggleCourseSelection(course.id)}
                      style={{ marginRight: '10px' }}
                    />
                    <div className="item-content">
                      <strong>{course.title}</strong>
                      {course.description && <p className="item-description">{course.description}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleAddCourseToMenu(course.id)}
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

export default Menus;

