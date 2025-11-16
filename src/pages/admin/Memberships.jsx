import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import './Memberships.css';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    package_id: '',
    payment_type: 'manual',
    start_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
    fetchPackages();
  }, [filterPaymentType, filterPaymentStatus, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMemberships();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        payment_type: filterPaymentType || undefined,
        payment_status: filterPaymentStatus || undefined,
        status: filterStatus || undefined,
        limit: 100,
      };
      const response = await apiService.getMemberships(filters);
      setMemberships(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch memberships');
      console.error('Error fetching memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers({ limit: 1000 });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await apiService.getPackages({ limit: 1000, status: 'active' });
      setPackages(response.data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const handleCreateMembership = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.user_id || !formData.package_id) {
        setError('User and Package are required');
        setIsSubmitting(false);
        return;
      }

      await apiService.createMembership(formData);
      await fetchMemberships();
      setIsModalOpen(false);
      resetForm();
      alert('Membership created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateMembership = async (id) => {
    if (!window.confirm('Are you sure you want to activate this membership?')) {
      return;
    }

    try {
      await apiService.activateMembership(id);
      await fetchMemberships();
      alert('Membership activated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to activate membership');
      alert(err.message || 'Failed to activate membership');
    }
  };

  const handleDeleteMembership = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership?')) {
      return;
    }

    try {
      await apiService.deleteMembership(id);
      await fetchMemberships();
      alert('Membership deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete membership');
      alert(err.message || 'Failed to delete membership');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      package_id: '',
      payment_type: 'manual',
      start_date: new Date().toISOString().split('T')[0],
    });
    setSelectedMembership(null);
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

  const getPaymentTypeBadge = (type) => {
    return type === 'razorpay' ? (
      <span className="badge badge--razorpay">Razorpay</span>
    ) : (
      <span className="badge badge--manual">Manual</span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: <span className="badge badge--paid">Paid</span>,
      pending: <span className="badge badge--pending">Pending</span>,
      failed: <span className="badge badge--failed">Failed</span>,
      refunded: <span className="badge badge--refunded">Refunded</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="badge badge--active">Active</span>,
      pending: <span className="badge badge--pending">Pending</span>,
      expired: <span className="badge badge--expired">Expired</span>,
      cancelled: <span className="badge badge--cancelled">Cancelled</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      !searchTerm ||
      (membership.user_name && membership.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (membership.user_email && membership.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (membership.package_name && membership.package_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const columns = [
    {
      key: 'user_name',
      title: 'User',
      render: (value, row) => (
        <div>
          <div>{value || 'N/A'}</div>
          {row.user_email && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{row.user_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'package_name',
      title: 'Package',
      render: (value) => value || 'N/A',
    },
    {
      key: 'payment_type',
      title: 'Payment Type',
      render: (value) => getPaymentTypeBadge(value),
    },
    {
      key: 'payment_status',
      title: 'Payment Status',
      render: (value) => getPaymentStatusBadge(value),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => `₹${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'start_date',
      title: 'Start Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'end_date',
      title: 'End Date',
      render: (value) => formatDate(value),
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
          {row.payment_type === 'manual' && row.payment_status === 'pending' && hasPermission('/admin/memberships', 'edit') && (
            <Button
              variant="primary"
              size="small"
              onClick={() => handleActivateMembership(row.id)}
            >
              Activate
            </Button>
          )}
          {hasPermission('/admin/memberships', 'delete') && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeleteMembership(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-memberships">
      <div className="admin-memberships-header">
        <div>
          <h1 className="admin-page-title">Membership Management</h1>
          <p className="admin-page-subtitle">Manage user package subscriptions and payments</p>
        </div>
        {hasPermission('/admin/memberships', 'add') && (
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add New Membership
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-memberships-filters">
          <Input
            placeholder="Search by user name, email, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <div className="filter-group">
            <div className="filter-item">
              <label className="filter-label">Payment Type</label>
              <select
                className="filter-select"
                value={filterPaymentType}
                onChange={(e) => setFilterPaymentType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="manual">Manual</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">Payment Status</label>
              <select
                className="filter-select"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
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
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button variant="outline" onClick={fetchMemberships}>
              Apply Filters
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredMemberships}
          loading={loading}
          emptyMessage="No memberships found"
        />
      </Card>

      {/* Create Membership Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Add New Membership"
        size="large"
        footer={
          <div>
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateMembership}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="membership-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              User <span className="input-required">*</span>
            </label>
            <select
              className="input"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              disabled={isSubmitting}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Package <span className="input-required">*</span>
            </label>
            <select
              className="input"
              value={formData.package_id}
              onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} (₹{parseFloat(pkg.amount).toFixed(2)} - {pkg.duration_days} days)
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Payment Type <span className="input-required">*</span>
            </label>
            <select
              className="input"
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              disabled={isSubmitting}
              required
            >
              <option value="manual">Manual (Cash)</option>
              <option value="razorpay">Razorpay (Online)</option>
            </select>
            <span className="input-helper">
              Manual: Admin receives cash and activates manually. Razorpay: User pays online.
            </span>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            fullWidth
            required
            disabled={isSubmitting}
            helperText="Membership start date. End date will be calculated based on package duration."
          />
        </div>
      </Modal>
    </div>
  );
};

export default Memberships;

