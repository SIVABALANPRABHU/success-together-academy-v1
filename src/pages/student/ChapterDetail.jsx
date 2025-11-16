import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './ChapterDetail.css';

const ChapterDetail = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData();
    }
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch chapter details
      const chapterResponse = await apiService.getChapterById(chapterId);
      setChapter(chapterResponse.data);

      // Fetch pages
      const pagesResponse = await apiService.getPagesByChapter(chapterId);
      setPages(pagesResponse.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch chapter data');
      console.error('Error fetching chapter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (page) => {
    // Navigate to content page using page ID
    navigate(`/student/content/${page.id}`);
  };

  if (loading) {
    return (
      <div className="chapter-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="chapter-detail">
        <div className="error-container">
          <p>{error || 'Chapter not found'}</p>
          <button onClick={() => navigate('/student/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-content">
          <div className="chapter-icon-large">📑</div>
          <div>
            <h1 className="detail-title">{chapter.title}</h1>
            {chapter.description && (
              <p className="detail-description">{chapter.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="pages-section">
        <div className="section-header-detail">
          <h2 className="section-title-detail">
            <span className="section-icon">📄</span>
            Pages ({pages.length})
          </h2>
        </div>

        {pages.length > 0 ? (
          <div className="pages-grid">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="page-card-detail"
                onClick={() => handlePageClick(page)}
              >
                <div className="page-number">{index + 1}</div>
                <div className="page-content">
                  <h3 className="page-card-title">{page.title}</h3>
                  {page.description && (
                    <p className="page-card-description">
                      {page.description.length > 100
                        ? `${page.description.substring(0, 100)}...`
                        : page.description}
                    </p>
                  )}
                </div>
                <div className="page-action">
                  <span className="view-page-btn">View Content →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No pages available in this chapter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterDetail;

