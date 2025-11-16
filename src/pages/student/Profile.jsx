import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="student-profile">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.thumbnail ? (
              <img src={user.thumbnail} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'Student'}</h2>
            <p className="profile-email">{user?.email || ''}</p>
          </div>
        </div>
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{user?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{user?.status || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

