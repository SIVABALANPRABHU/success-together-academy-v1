import React from 'react';
import { renderMarkdown } from '../../../utils/markdownRenderer';
import AssessmentViewer from './AssessmentViewer';
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
        // For internal videos, use the content_url directly
        // For external videos, also use content_url (could be direct video URL)
        const videoUrl = content_url.startsWith('/uploads') 
          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
          : content_url;
        
        return (
          <div className="content-preview-video">
            <video controls className="content-preview-media">
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'image':
        // For internal images, construct full URL
        const imageUrl = content_url.startsWith('/uploads')
          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
          : content_url;
        
        return (
          <div className="content-preview-image">
            <img
              src={imageUrl}
              alt={title}
              className="content-preview-media"
              onError={(e) => {
                const fallbackUrl = thumbnail_url 
                  ? (thumbnail_url.startsWith('/uploads')
                      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${thumbnail_url}`
                      : thumbnail_url)
                  : '/placeholder-image.png';
                e.target.src = fallbackUrl;
              }}
            />
          </div>
        );

      case 'file':
        // Extract file extension more reliably (handle URLs with query parameters)
        const urlWithoutQuery = content_url.split('?')[0];
        const fileExtension = urlWithoutQuery.split('.').pop().toLowerCase();
        const isPDF = fileExtension === 'pdf' || content_url.toLowerCase().includes('.pdf') || content_url.toLowerCase().includes('application/pdf');
        const isPPT = ['ppt', 'pptx'].includes(fileExtension);
        const isWord = ['doc', 'docx'].includes(fileExtension);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
        
        // Check if it's a Google Drive link
        const isGoogleDrive = content_url.includes('drive.google.com');
        
        if (isPDF) {
          // For Google Drive PDFs, use Google Docs Viewer
          if (isGoogleDrive) {
            const fileId = content_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            const viewerUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : content_url;
            return (
              <div className="content-preview-file content-preview-file-viewer">
                <iframe
                  src={viewerUrl}
                  title={title}
                  className="content-preview-iframe content-preview-pdf"
                  type="application/pdf"
                />
              </div>
            );
          }
          
          // For internal and external PDFs, construct full URL
          const isInternal = content_url.startsWith('/uploads');
          const pdfUrl = isInternal
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
            : content_url;
          
          // Use native browser PDF rendering with object/embed tags
          // This provides direct PDF rendering with browser's built-in PDF viewer
          return (
            <div className="content-preview-file content-preview-file-viewer">
              <object
                data={pdfUrl}
                type="application/pdf"
                className="content-preview-pdf-object"
                aria-label={title}
              >
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  className="content-preview-pdf-embed"
                />
                <div className="pdf-fallback-message">
                  <p>Your browser doesn't support PDF preview.</p>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="file-download-link">
                    Download or Open PDF
                  </a>
                </div>
              </object>
            </div>
          );
        }
        
        if (isPPT) {
          // For Google Drive PPT, use Google Docs Viewer
          if (isGoogleDrive) {
            const fileId = content_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            const viewerUrl = fileId ? `https://docs.google.com/presentation/d/${fileId}/preview` : content_url;
            return (
              <div className="content-preview-file content-preview-file-viewer">
                <iframe
                  src={viewerUrl}
                  title={title}
                  className="content-preview-iframe content-preview-pdf"
                />
              </div>
            );
          }
          // For internal PPT files, construct full URL
          const pptUrl = content_url.startsWith('/uploads')
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
            : content_url;
          
          // For external PPT files, use Office Online viewer
          const officeViewerUrl = pptUrl.startsWith('http')
            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`
            : pptUrl;
          
          return (
            <div className="content-preview-file content-preview-file-viewer">
              <iframe
                src={officeViewerUrl}
                title={title}
                className="content-preview-iframe content-preview-pdf"
              />
              {!pptUrl.startsWith('/uploads') && (
                <div className="preview-fallback">
                  <a href={content_url} target="_blank" rel="noopener noreferrer" className="file-download-link">
                    Download PowerPoint File
                  </a>
                </div>
              )}
            </div>
          );
        }
        
        if (isWord) {
          // Word files should be uploaded to Google Drive
          if (isGoogleDrive) {
            const fileId = content_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            const viewerUrl = fileId ? `https://docs.google.com/document/d/${fileId}/preview` : content_url;
            return (
              <div className="content-preview-file content-preview-file-viewer">
                <iframe
                  src={viewerUrl}
                  title={title}
                  className="content-preview-iframe content-preview-pdf"
                />
              </div>
            );
          }
          // For internal Word files, try Office Online viewer
          const wordUrl = content_url.startsWith('/uploads')
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
            : content_url;
          
          // Try Office Online viewer for Word files
          if (wordUrl.startsWith('http')) {
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(wordUrl)}`;
            return (
              <div className="content-preview-file content-preview-file-viewer">
                <iframe
                  src={officeViewerUrl}
                  title={title}
                  className="content-preview-iframe content-preview-pdf"
                />
                <div className="preview-fallback">
                  <p>If preview doesn't load, use Google Drive for better compatibility.</p>
                  <a href={content_url} target="_blank" rel="noopener noreferrer" className="file-download-link">
                    Download Word File
                  </a>
                </div>
              </div>
            );
          }
          
          // Fallback for non-Google Drive Word files
          return (
            <div className="content-preview-file">
              <div className="content-preview-file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h3>{title}</h3>
                  <p>{description || 'Word document'}</p>
                  <p className="file-note">Note: Word files should be uploaded to Google Drive for preview.</p>
                  <a href={content_url} target="_blank" rel="noopener noreferrer" className="file-download-link">
                    Download Word File
                  </a>
                </div>
              </div>
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

        // For other file types, show download option
        const fileUrl = content_url.startsWith('/uploads')
          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content_url}`
          : content_url;
        
        return (
          <div className="content-preview-file">
            <div className="content-preview-file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h3>{title}</h3>
                <p>{description || 'File content'}</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-download-link">
                  Download File
                </a>
              </div>
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="content-preview-assessment">
            <AssessmentViewer content={content} />
          </div>
        );

      case 'markdown':
        // For internal markdown, content_url contains the markdown text
        // For external markdown, content_url is a file URL
        const isInternalMarkdown = !content_url.startsWith('http') && !content_url.startsWith('/uploads');
        
        if (isInternalMarkdown) {
          // Render markdown content with enhanced support for images, videos, PDFs
          const markdownHtml = renderMarkdown(content_url);
          
          return (
            <div className="content-preview-markdown">
              <div className="markdown-content">
                <h3>{title}</h3>
                {description && <p className="markdown-description">{description}</p>}
                <div 
                  className="markdown-viewer markdown-rendered"
                  dangerouslySetInnerHTML={{ __html: markdownHtml }}
                />
              </div>
            </div>
          );
        }
        
        // External markdown file
        return (
          <div className="content-preview-markdown">
            <div className="markdown-content">
              <h3>{title}</h3>
              {description && <p className="markdown-description">{description}</p>}
              <div className="markdown-viewer">
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


