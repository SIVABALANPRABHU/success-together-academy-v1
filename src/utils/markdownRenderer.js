/**
 * Enhanced Markdown Renderer
 * Supports images, videos, PDFs, and links (internal and external)
 */

export const renderMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Helper function to construct full URL for internal resources
  const getFullUrl = (url) => {
    if (url.startsWith('/uploads')) {
      return `${apiBaseUrl}${url}`;
    }
    return url;
  };
  
  // Helper function to check if URL is YouTube/Vimeo
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  
  const getVimeoId = (url) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };
  
  // Process code blocks FIRST (before other replacements to avoid conflicts)
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  
  // Process inline code (before other formatting)
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Process images: ![alt](url) or ![alt](url "title") - BEFORE links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/gim, (match, alt, url, title) => {
    const fullUrl = getFullUrl(url.trim());
    return `<img src="${fullUrl}" alt="${alt || ''}" title="${title || alt || ''}" class="markdown-image" onerror="this.src='/placeholder-image.png'" />`;
  });
  
  // Process videos: !video(url)
  html = html.replace(/!video\(([^)]+)\)/gim, (match, url) => {
    const fullUrl = getFullUrl(url.trim());
    const youtubeId = getYouTubeId(fullUrl);
    const vimeoId = getVimeoId(fullUrl);
    
    if (youtubeId) {
      return `<div class="markdown-video"><iframe src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    if (vimeoId) {
      return `<div class="markdown-video"><iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    // Direct video URL (internal or external)
    return `<div class="markdown-video"><video controls><source src="${fullUrl}" type="video/mp4"><source src="${fullUrl}" type="video/webm">Your browser does not support the video tag.</video></div>`;
  });
  
  // Process PDFs: !pdf(url)
  html = html.replace(/!pdf\(([^)]+)\)/gim, (match, url) => {
    const fullUrl = getFullUrl(url.trim());
    return `<div class="markdown-pdf"><object data="${fullUrl}" type="application/pdf" class="markdown-pdf-object"><embed src="${fullUrl}" type="application/pdf" /><p>Your browser doesn't support PDF preview. <a href="${fullUrl}" target="_blank">Open PDF</a></p></object></div>`;
  });
  
  // Process headers (after code blocks to avoid conflicts)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Process bold (before italic to avoid conflicts)
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  
  // Process italic (after bold to avoid conflicts)
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  
  // Process links: [text](url) - AFTER images to avoid conflicts
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
    const fullUrl = getFullUrl(url.trim());
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  
  // Process line breaks (last)
  html = html.replace(/\n/gim, '<br />');
  
  return html;
};

export default renderMarkdown;

