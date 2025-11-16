import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import ChapterCard from '../ChapterCard/ChapterCard';
import './CourseCard.css';

const CourseCard = ({ course, menuId }) => {
  const [chapters, setChapters] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && course.id) {
      fetchChapters();
    }
  }, [expanded, course.id]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChaptersByCourse(course.id);
      setChapters(response.data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`course-card ${expanded ? 'expanded' : ''}`}>
      <div className="course-card-header" onClick={handleToggle}>
        <div className="course-card-info">
          <div className="course-card-title-section">
            <h4 className="course-card-title">{course.title}</h4>
            {course.status === 'active' && (
              <span className="course-status-badge active">Active</span>
            )}
          </div>
          {course.description && (
            <p className="course-card-description">{course.description}</p>
          )}
        </div>
        <div className="course-card-actions">
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="course-card-content">
          {loading ? (
            <div className="loading-chapters">
              <div className="loading-spinner-small"></div>
              <p>Loading chapters...</p>
            </div>
          ) : chapters.length > 0 ? (
            <div className="chapters-container">
              {chapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} courseId={course.id} />
              ))}
            </div>
          ) : (
            <div className="no-chapters">
              <p>No chapters available in this course</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;

