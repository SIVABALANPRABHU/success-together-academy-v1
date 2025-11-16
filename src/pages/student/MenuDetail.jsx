import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './MenuDetail.css';

const MenuDetail = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (menuId) {
      fetchMenuData();
    }
  }, [menuId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch menu details
      const menuResponse = await apiService.getMenus({ limit: 1000 });
      const menuData = menuResponse.data?.find(m => m.id === parseInt(menuId));
      setMenu(menuData);

      // Fetch courses
      const coursesResponse = await apiService.getCoursesByMenu(menuId);
      setCourses(coursesResponse.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch menu data');
      console.error('Error fetching menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="menu-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="menu-detail">
        <div className="error-container">
          <p>{error || 'Menu not found'}</p>
          <button onClick={() => navigate('/student/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/student/dashboard')}>
          ← Back
        </button>
        <div className="header-content">
          <div className="menu-icon-large">📚</div>
          <div>
            <h1 className="detail-title">{menu.title}</h1>
            {menu.description && (
              <p className="detail-description">{menu.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="courses-section">
        <div className="section-header-detail">
          <h2 className="section-title-detail">
            <span className="section-icon">📖</span>
            Courses ({courses.length})
          </h2>
        </div>

        {courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course) => (
              <div
                key={course.id}
                className="course-card-detail"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-card-image">
                  <div className="course-icon">📖</div>
                </div>
                <div className="course-card-content">
                  <h3 className="course-card-title">{course.title}</h3>
                  {course.description && (
                    <p className="course-card-description">
                      {course.description.length > 120
                        ? `${course.description.substring(0, 120)}...`
                        : course.description}
                    </p>
                  )}
                  <div className="course-card-footer">
                    <span className="view-course-btn">View Chapters →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No courses available in this menu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuDetail;

