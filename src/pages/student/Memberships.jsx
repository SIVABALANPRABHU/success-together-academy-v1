import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import './Memberships.css';

const StudentMemberships = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMemberships();
    }
  }, [user]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserMemberships(user.id);
      setMemberships(response.data || []);
    } catch (err) {
      console.error('Error fetching memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="student-memberships">
      <h1>My Memberships</h1>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading memberships...</p>
        </div>
      ) : memberships.length > 0 ? (
        <div className="memberships-grid">
          {memberships.map((membership) => (
            <div key={membership.id} className="membership-card">
              <div className="membership-header">
                <h3>{membership.package_name}</h3>
                <span className={`status-badge ${membership.status}`}>
                  {membership.status}
                </span>
              </div>
              <div className="membership-details">
                <div className="detail-item">
                  <span className="detail-label">Payment Type:</span>
                  <span className="detail-value">{membership.payment_type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value">{membership.payment_status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">₹{parseFloat(membership.amount).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">{formatDate(membership.start_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date:</span>
                  <span className="detail-value">{formatDate(membership.end_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-memberships">
          <p>You don't have any memberships yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentMemberships;

