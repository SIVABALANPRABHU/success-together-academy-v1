import React from 'react';
import './ContentPreview.css';

const ContentPreview = ({ content }) => {
  if (!content) return null;

  const { content_type, content_url, thumbnail_url, title, description } = content;

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract Vimeo video ID
  const getVimeoId = (url) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Check if URL is embedded video
  const isYouTube = content_url && (content_url.includes('youtube.com') || content_url.includes('youtu.be'));
  const isVimeo = content_url && content_url.includes('vimeo.com');
  const youtubeId = isYouTube ? getYouTubeId(content_url) : null;
  const vimeoId = isVimeo ? getVimeoId(content_url) : null;

  const renderPreview = () => {
    switch (content_type) {
      case 'video':
        if (youtubeId) {
          return (
            <div className="content-preview-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="content-preview-iframe"
              />
            </div>
          );
        }
        if (vimeoId) {
          return (
            <div className="content-preview-video">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                title={title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="content-preview-iframe"
              />
            </div>
          );
        }
        return (
          <div className="content-preview-video">
            <video controls className="content-preview-media">
              <source src={content_url} type="video/mp4" />
              <source src={content_url} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'image':
        return (
          <div className="content-preview-image">
            <img
              src={content_url}
              alt={title}
              className="content-preview-media"
              onError={(e) => {
                e.target.src = thumbnail_url || '/placeholder-image.png';
              }}
            />
          </div>
        );

      case 'file':
        const fileExtension = content_url.split('.').pop().toLowerCase();
        const isPDF = fileExtension === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
        
        if (isPDF) {
          return (
            <div className="content-preview-file">
              <iframe
                src={content_url}
                title={title}
                className="content-preview-iframe content-preview-pdf"
                type="application/pdf"
              />
            </div>
          );
        }
        
        if (isImage) {
          return (
            <div className="content-preview-image">
              <img
                src={content_url}
                alt={title}
                className="content-preview-media"
              />
            </div>
          );
        }

        return (
          <div className="content-preview-file">
            <div className="content-preview-file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h3>{title}</h3>
                <p>{description || 'File content'}</p>
                <a href={content_url} target="_blank" rel="noopener noreferrer" className="file-download-link">
                  Download File
                </a>
              </div>
            </div>
          </div>
        );

      case 'markdown':
        return (
          <div className="content-preview-markdown">
            <div className="markdown-content">
              <h3>{title}</h3>
              {description && <p className="markdown-description">{description}</p>}
              <div className="markdown-viewer">
                <pre>{content_url}</pre>
                <a href={content_url} target="_blank" rel="noopener noreferrer" className="markdown-link">
                  View Markdown File
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="content-preview-default">
            <p>Preview not available for this content type.</p>
            <a href={content_url} target="_blank" rel="noopener noreferrer">
              Open Content
            </a>
          </div>
        );
    }
  };

  return (
    <div className="content-preview">
      {renderPreview()}
    </div>
  );
};

export default ContentPreview;


