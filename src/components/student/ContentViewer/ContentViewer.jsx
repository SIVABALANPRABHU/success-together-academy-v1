import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import ContentPreview from '../../common/ContentPreview/ContentPreview';
import './ContentViewer.css';

const ContentViewer = ({ content, onClose }) => {
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (content?.content_id) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [content]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getContentById(content.content_id);
      setPageContent(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load content');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-viewer-overlay" onClick={onClose}>
      <div className="content-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="content-viewer-header">
          <h2 className="content-viewer-title">{content?.title || 'Content'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="content-viewer-body">
          {loading ? (
            <div className="content-loading">
              <div className="loading-spinner"></div>
              <p>Loading content...</p>
            </div>
          ) : error ? (
            <div className="content-error">
              <p>{error}</p>
              <button onClick={fetchContent} className="retry-btn">Retry</button>
            </div>
          ) : pageContent ? (
            <div className="content-preview-wrapper">
              <ContentPreview content={pageContent} />
            </div>
          ) : (
            <div className="no-content">
              <p>No content available for this page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;

