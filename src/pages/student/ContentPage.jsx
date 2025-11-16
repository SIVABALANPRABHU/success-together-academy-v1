import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import ContentPreview from '../../components/common/ContentPreview/ContentPreview';
import './ContentPage.css';

const ContentPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to get the page info if contentId is actually a page ID
      try {
        const pageResponse = await apiService.getPageById(contentId);
        setPageInfo(pageResponse.data);
        
        // If page has content_id, fetch the actual content
        if (pageResponse.data?.content_id) {
          const contentResponse = await apiService.getContentById(pageResponse.data.content_id);
          setPageContent(contentResponse.data);
        }
      } catch (pageErr) {
        // If page fetch fails, try fetching as content directly
        try {
          const contentResponse = await apiService.getContentById(contentId);
          setPageContent(contentResponse.data);
        } catch (contentErr) {
          throw new Error('Content not found');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load content');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-page">
        <div className="content-page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="content-loading-container">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || (!pageContent && !pageInfo)) {
    return (
      <div className="content-page">
        <div className="content-page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="content-error-container">
          <div className="error-icon">⚠️</div>
          <p>{error || 'Content not found'}</p>
          <button onClick={fetchContent} className="retry-btn">Retry</button>
          <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  const displayTitle = pageInfo?.title || pageContent?.title || 'Content';
  const displayDescription = pageInfo?.description || pageContent?.description;

  return (
    <div className="content-page">
      <div className="content-page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="content-header-info">
          <h1 className="content-page-title">{displayTitle}</h1>
          {displayDescription && (
            <p className="content-page-description">{displayDescription}</p>
          )}
        </div>
      </div>

      <div className="content-page-body">
        {pageContent ? (
          <div className="content-preview-container">
            <ContentPreview content={pageContent} />
          </div>
        ) : pageInfo ? (
          <div className="no-content-message">
            <div className="no-content-icon">📄</div>
            <p>No content available for this page</p>
            {pageInfo.description && (
              <p className="page-info-description">{pageInfo.description}</p>
            )}
          </div>
        ) : (
          <div className="no-content-message">
            <div className="no-content-icon">📄</div>
            <p>No content available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;

