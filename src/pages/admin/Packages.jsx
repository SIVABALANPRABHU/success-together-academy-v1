import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import './Packages.css';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [courses, setCourses] = useState([]);
  const [menuCourses, setMenuCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPackageCourses, setSelectedPackageCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 30,
    amount: 0,
    menu_id: '',
    package_type: 'basic',
    status: 'active',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchMenus();
  }, [filterStatus, filterType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPackages();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (formData.menu_id) {
      fetchMenuCourses(formData.menu_id);
    } else {
      setMenuCourses([]);
    }
  }, [formData.menu_id]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        status: filterStatus || undefined,
        package_type: filterType || undefined,
        limit: 100,
      };
      const response = await apiService.getPackages(filters);
      setPackages(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await apiService.getMenus({ limit: 1000 });
      setMenus(response.data || []);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  const fetchMenuCourses = async (menuId) => {
    try {
      const response = await apiService.getCoursesByMenu(menuId);
      setMenuCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching menu courses:', err);
      setMenuCourses([]);
    }
  };

  const fetchPackageCourses = async (packageId) => {
    try {
      const response = await apiService.getPackageCourses(packageId);
      setSelectedPackageCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching package courses:', err);
    }
  };

  const handleCreatePackage = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name || !formData.duration_days || formData.amount === undefined) {
        setError('Name, Duration, and Amount are required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createPackage(formData);
      await fetchPackages();
      setIsModalOpen(false);
      resetForm();
      alert('Package created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackage = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name || !formData.duration_days || formData.amount === undefined) {
        setError('Name, Duration, and Amount are required');
        setIsSubmitting(false);
        return;
      }

      await apiService.updatePackage(selectedPackage.id, formData);
      await fetchPackages();
      setIsModalOpen(false);
      setSelectedPackage(null);
      resetForm();
      alert('Package updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      await apiService.deletePackage(id);
      await fetchPackages();
      alert('Package deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete package');
      alert('Failed to delete package: ' + err.message);
    }
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      duration_days: pkg.duration_days || 30,
      amount: pkg.amount || 0,
      menu_id: pkg.menu_id || '',
      package_type: pkg.package_type || 'basic',
      status: pkg.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleManageCourses = async (pkg) => {
    setSelectedPackage(pkg);
    setSelectedCourseIds([]);
    await fetchPackageCourses(pkg.id);
    if (pkg.menu_id) {
      await fetchMenuCourses(pkg.menu_id);
    }
    setIsCourseModalOpen(true);
  };

  const handleAddCourseToPackage = async (courseId) => {
    if (!selectedPackage) return;
    try {
      await apiService.addCourseToPackage(selectedPackage.id, courseId);
      await fetchPackageCourses(selectedPackage.id);
    } catch (err) {
      setError(err.message || 'Failed to add course');
      alert('Failed to add course: ' + err.message);
    }
  };

  const handleBulkAddCourses = async () => {
    if (!selectedPackage || selectedCourseIds.length === 0) return;
    try {
      await apiService.addCoursesToPackage(selectedPackage.id, selectedCourseIds);
      await fetchPackageCourses(selectedPackage.id);
      setSelectedCourseIds([]);
      alert(`${selectedCourseIds.length} course(s) added successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to add courses');
      alert('Failed to add courses: ' + err.message);
    }
  };

  const handleRemoveCourseFromPackage = async (courseId) => {
    if (!selectedPackage) return;
    try {
      await apiService.removeCourseFromPackage(selectedPackage.id, courseId);
      await fetchPackageCourses(selectedPackage.id);
    } catch (err) {
      setError(err.message || 'Failed to remove course');
      alert('Failed to remove course: ' + err.message);
    }
  };

  const handleToggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_days: 30,
      amount: 0,
      menu_id: '',
      package_type: 'basic',
      status: 'active',
    });
    setSelectedPackage(null);
    setError(null);
    setMenuCourses([]);
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

  const getTypeBadge = (type) => {
    const badges = {
      free: <span className="badge badge--free">Free</span>,
      basic: <span className="badge badge--basic">Basic</span>,
      intermediate: <span className="badge badge--intermediate">Intermediate</span>,
      advanced: <span className="badge badge--advanced">Advanced</span>,
      premium: <span className="badge badge--premium">Premium</span>,
    };
    return badges[type] || <span className="badge">{type}</span>;
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      !searchTerm ||
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const availableCourses = menuCourses.filter(
    course => !selectedPackageCourses.some(pc => pc.id === course.id)
  );

  const columns = [
    { key: 'name', title: 'Name' },
    {
      key: 'package_type',
      title: 'Type',
      render: (value) => getTypeBadge(value),
    },
    {
      key: 'menu_title',
      title: 'Menu',
      render: (value) => value || <span className="text-muted">No menu</span>,
    },
    {
      key: 'duration_days',
      title: 'Duration',
      render: (value) => `${value} days`,
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => `₹${parseFloat(value).toFixed(2)}`,
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
              handleEditPackage(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePackage(row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="packages-container">
      <Card>
        <div className="card-header">
          <h1>Packages Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Package</Button>
        </div>

        <div className="filters">
          <Input
            placeholder="Search packages..."
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
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <DataTable
          columns={columns}
          data={filteredPackages}
          loading={loading}
          emptyMessage="No packages found"
        />
      </Card>

      {/* Create/Edit Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedPackage ? 'Edit Package' : 'Create Package'}
        size="large"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={selectedPackage ? handleUpdatePackage : handleCreatePackage}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedPackage ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="form-container">
          <Input
            label="Package Name"
            placeholder="Enter package name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
          />

          <Input
            label="Description"
            placeholder="Enter package description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            disabled={isSubmitting}
          />

          <div className="form-row">
            <Input
              label="Duration (Days)"
              type="number"
              placeholder="30"
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Menu <span className="input-required">*</span>
            </label>
            <select
              className="input"
              value={formData.menu_id}
              onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Menu</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.title}
                </option>
              ))}
            </select>
            <span className="input-helper">Select a menu to choose courses from</span>
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">Package Type</label>
            <select
              className="input"
              value={formData.package_type}
              onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="premium">Premium</option>
            </select>
          </div>

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
          setSelectedPackage(null);
          setSelectedPackageCourses([]);
          setSelectedCourseIds([]);
        }}
        title={selectedPackage ? `Manage Courses: ${selectedPackage.name}` : 'Manage Courses'}
        size="large"
      >
        <div className="course-management-container">
          {!selectedPackage?.menu_id ? (
            <div className="error-message">
              Please select a menu for this package first to manage courses.
            </div>
          ) : (
            <>
              <div className="course-list-section">
                <h3>Courses in Package</h3>
                {selectedPackageCourses.length === 0 ? (
                  <p className="text-muted">No courses added yet</p>
                ) : (
                  <div className="ordered-list">
                    {selectedPackageCourses.map((course) => (
                      <div key={course.id} className="ordered-item">
                        <div className="item-content">
                          <strong>{course.title}</strong>
                          {course.description && <p className="item-description">{course.description}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleRemoveCourseFromPackage(course.id)}
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
                  <h3 style={{ margin: 0 }}>Add Courses from Menu</h3>
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
                  <p className="text-muted">All courses from this menu are already added</p>
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
                          onClick={() => handleAddCourseToPackage(course.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Packages;


