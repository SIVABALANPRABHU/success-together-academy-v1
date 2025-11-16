import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card/Card';
import DataTable from '../../components/common/Table/DataTable';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import apiService from '../../services/api';
import './Offers.css';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    package_id: '',
    offer_text: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    status: 'active',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchPackages();
  }, [filterStatus, filterPackage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOffers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        status: filterStatus || undefined,
        package_id: filterPackage || undefined,
        limit: 100,
      };
      const response = await apiService.getOffers(filters);
      setOffers(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch offers');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await apiService.getPackages({ limit: 1000 });
      setPackages(response.data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const handleCreateOffer = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.package_id || !formData.offer_text || formData.discount_percentage === undefined || !formData.start_date || !formData.end_date) {
        setError('All fields are required');
        setIsSubmitting(false);
        return;
      }

      if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
        setError('Discount percentage must be between 0 and 100');
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        setError('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      await apiService.createOffer({
        ...formData,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      await fetchOffers();
      setIsModalOpen(false);
      resetForm();
      alert('Offer created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.package_id || !formData.offer_text || formData.discount_percentage === undefined || !formData.start_date || !formData.end_date) {
        setError('All fields are required');
        setIsSubmitting(false);
        return;
      }

      if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
        setError('Discount percentage must be between 0 and 100');
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        setError('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      await apiService.updateOffer(selectedOffer.id, {
        ...formData,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      await fetchOffers();
      setIsModalOpen(false);
      setSelectedOffer(null);
      resetForm();
      alert('Offer updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      await apiService.deleteOffer(id);
      await fetchOffers();
      alert('Offer deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete offer');
      alert('Failed to delete offer: ' + err.message);
    }
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    const startDate = offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : '';
    const endDate = offer.end_date ? new Date(offer.end_date).toISOString().slice(0, 16) : '';
    setFormData({
      package_id: offer.package_id || '',
      offer_text: offer.offer_text || '',
      discount_percentage: offer.discount_percentage || 0,
      start_date: startDate,
      end_date: endDate,
      status: offer.status || 'active',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      package_id: '',
      offer_text: '',
      discount_percentage: 0,
      start_date: '',
      end_date: '',
      status: 'active',
    });
    setSelectedOffer(null);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="badge badge--active">Active</span>,
      inactive: <span className="badge badge--inactive">Inactive</span>,
      expired: <span className="badge badge--expired">Expired</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  const isOfferActive = (offer) => {
    const now = new Date();
    const start = new Date(offer.start_date);
    const end = new Date(offer.end_date);
    return offer.status === 'active' && now >= start && now <= end;
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      !searchTerm ||
      offer.offer_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.package_name && offer.package_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const columns = [
    {
      key: 'package_name',
      title: 'Package',
      render: (value) => value || <span className="text-muted">No package</span>,
    },
    {
      key: 'offer_text',
      title: 'Offer Text',
      render: (value) => (
        <span className="description-cell">
          {value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 'No description'}
        </span>
      ),
    },
    {
      key: 'discount_percentage',
      title: 'Discount',
      render: (value) => <span className="discount-badge">{value}%</span>,
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
      render: (value, row) => (
        <div>
          {getStatusBadge(value)}
          {isOfferActive(row) && <span className="active-indicator">●</span>}
        </div>
      ),
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
              handleEditOffer(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOffer(row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="offers-container">
      <Card>
        <div className="card-header">
          <h1>Offers Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Create Offer</Button>
        </div>

        <div className="filters">
          <Input
            placeholder="Search offers..."
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
            <option value="expired">Expired</option>
          </select>
          <select
            className="filter-select"
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
          >
            <option value="">All Packages</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <DataTable
          columns={columns}
          data={filteredOffers}
          loading={loading}
          emptyMessage="No offers found"
        />
      </Card>

      {/* Create/Edit Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedOffer ? 'Edit Offer' : 'Create Offer'}
        size="large"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={selectedOffer ? handleUpdateOffer : handleCreateOffer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedOffer ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="form-container">
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
                  {pkg.name} (₹{parseFloat(pkg.amount).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Offer Text <span className="input-required">*</span>
            </label>
            <textarea
              className="input textarea"
              placeholder="Enter offer description (e.g., '50% off on Basic Package!')"
              value={formData.offer_text}
              onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
              rows={3}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-wrapper input-wrapper--full-width">
            <label className="input-label">
              Discount Percentage <span className="input-required">*</span>
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
              disabled={isSubmitting}
              helperText="Enter discount percentage (0-100)"
            />
          </div>

          <div className="form-row">
            <div className="input-wrapper">
              <label className="input-label">
                Start Date <span className="input-required">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">
                End Date <span className="input-required">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
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
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Offers;


