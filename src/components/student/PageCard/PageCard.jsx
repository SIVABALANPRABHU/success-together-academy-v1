import React, { useState } from 'react';
import ContentViewer from '../ContentViewer/ContentViewer';
import './PageCard.css';

const PageCard = ({ page, chapterId }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewingContent, setViewingContent] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleViewContent = (e) => {
    e.stopPropagation();
    setViewingContent(true);
  };

  const handleCloseContent = () => {
    setViewingContent(false);
  };

  return (
    <>
      <div className={`page-card ${expanded ? 'expanded' : ''}`}>
        <div className="page-card-header" onClick={handleToggle}>
          <div className="page-card-info">
            <div className="page-card-title-section">
              <h6 className="page-card-title">{page.title}</h6>
              {page.status === 'active' && (
                <span className="page-status-badge active">Active</span>
              )}
            </div>
            {page.description && (
              <p className="page-card-description">{page.description}</p>
            )}
          </div>
          <div className="page-card-actions">
            <button 
              className="view-content-btn"
              onClick={handleViewContent}
            >
              📄 View Content
            </button>
            <button className="expand-btn">
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {viewingContent && (
        <ContentViewer 
          content={page} 
          onClose={handleCloseContent}
        />
      )}
    </>
  );
};

export default PageCard;

