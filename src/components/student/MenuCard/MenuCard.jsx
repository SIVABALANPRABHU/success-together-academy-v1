import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/api';
import CourseCard from '../CourseCard/CourseCard';
import './MenuCard.css';

const MenuCard = ({ menu, isPurchased, membership }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState(null);

  useEffect(() => {
    if (expanded && menu.id) {
      fetchCourses();
    }
  }, [expanded, menu.id]);

  useEffect(() => {
    if (membership?.package_id) {
      fetchPackageInfo();
    }
  }, [membership]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCoursesByMenu(menu.id);
      setCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageInfo = async () => {
    try {
      const response = await apiService.getPackageById(membership.package_id);
      setPackageInfo(response.data);
    } catch (err) {
      console.error('Error fetching package info:', err);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`menu-card ${isPurchased ? 'purchased' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="menu-card-header" onClick={handleToggle}>
        <div className="menu-card-info">
          <div className="menu-card-title-section">
            <h3 className="menu-card-title">{menu.title}</h3>
            {isPurchased && (
              <span className="purchased-badge">✓ Purchased</span>
            )}
          </div>
          {menu.description && (
            <p className="menu-card-description">{menu.description}</p>
          )}
          {packageInfo && (
            <div className="package-info">
              <span className="package-name">{packageInfo.name}</span>
              <span className="package-duration">{packageInfo.duration_days} days</span>
            </div>
          )}
        </div>
        <div className="menu-card-actions">
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="menu-card-content">
          {loading ? (
            <div className="loading-courses">
              <div className="loading-spinner-small"></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="courses-container">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} menuId={menu.id} />
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>No courses available in this menu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuCard;

