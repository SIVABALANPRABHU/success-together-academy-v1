import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import PageCard from '../PageCard/PageCard';
import './ChapterCard.css';

const ChapterCard = ({ chapter, courseId }) => {
  const [pages, setPages] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && chapter.id) {
      fetchPages();
    }
  }, [expanded, chapter.id]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPagesByChapter(chapter.id);
      setPages(response.data || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`chapter-card ${expanded ? 'expanded' : ''}`}>
      <div className="chapter-card-header" onClick={handleToggle}>
        <div className="chapter-card-info">
          <div className="chapter-card-title-section">
            <h5 className="chapter-card-title">{chapter.title}</h5>
            {chapter.status === 'active' && (
              <span className="chapter-status-badge active">Active</span>
            )}
          </div>
          {chapter.description && (
            <p className="chapter-card-description">{chapter.description}</p>
          )}
        </div>
        <div className="chapter-card-actions">
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="chapter-card-content">
          {loading ? (
            <div className="loading-pages">
              <div className="loading-spinner-small"></div>
              <p>Loading pages...</p>
            </div>
          ) : pages.length > 0 ? (
            <div className="pages-container">
              {pages.map((page) => (
                <PageCard key={page.id} page={page} chapterId={chapter.id} />
              ))}
            </div>
          ) : (
            <div className="no-pages">
              <p>No pages available in this chapter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterCard;

