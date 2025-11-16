import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseResponse = await apiService.getCourseById(courseId);
      setCourse(courseResponse.data);

      // Fetch chapters
      const chaptersResponse = await apiService.getChaptersByCourse(courseId);
      setChapters(chaptersResponse.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterId) => {
    navigate(`/student/chapter/${chapterId}`);
  };

  if (loading) {
    return (
      <div className="course-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <div className="error-container">
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/student/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-content">
          <div className="course-icon-large">📖</div>
          <div>
            <h1 className="detail-title">{course.title}</h1>
            {course.description && (
              <p className="detail-description">{course.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="chapters-section">
        <div className="section-header-detail">
          <h2 className="section-title-detail">
            <span className="section-icon">📑</span>
            Chapters ({chapters.length})
          </h2>
        </div>

        {chapters.length > 0 ? (
          <div className="chapters-list">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="chapter-card-detail"
                onClick={() => handleChapterClick(chapter.id)}
              >
                <div className="chapter-number">{index + 1}</div>
                <div className="chapter-content">
                  <h3 className="chapter-card-title">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="chapter-card-description">
                      {chapter.description.length > 150
                        ? `${chapter.description.substring(0, 150)}...`
                        : chapter.description}
                    </p>
                  )}
                </div>
                <div className="chapter-arrow">→</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No chapters available in this course</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

