import React, { useState, useEffect } from 'react';
import { renderMarkdown } from '../../../utils/markdownRenderer';
import './MarkdownEditor.css';

const MarkdownEditor = ({ value = '', onChange, disabled = false, height = '400px' }) => {
  const [markdown, setMarkdown] = useState(value);
  const [previewMode, setPreviewMode] = useState('edit'); // 'edit', 'preview', 'split'

  useEffect(() => {
    setMarkdown(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setMarkdown(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const insertMarkdown = (syntax) => {
    if (disabled) return;
    
    const textarea = document.querySelector('.markdown-editor-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = markdown;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);
    
    let newText = '';
    if (syntax.includes('$SELECTION')) {
      newText = before + syntax.replace('$SELECTION', selected) + after;
    } else {
      newText = before + syntax + after;
    }
    
    setMarkdown(newText);
    if (onChange) {
      onChange(newText);
    }
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + syntax.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="markdown-editor" style={{ height }}>
      <div className="markdown-editor-toolbar">
        <div className="markdown-editor-tabs">
          <button
            type="button"
            className={`markdown-editor-tab ${previewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setPreviewMode('edit')}
            disabled={disabled}
          >
            Edit
          </button>
          <button
            type="button"
            className={`markdown-editor-tab ${previewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setPreviewMode('preview')}
            disabled={disabled}
          >
            Preview
          </button>
          <button
            type="button"
            className={`markdown-editor-tab ${previewMode === 'split' ? 'active' : ''}`}
            onClick={() => setPreviewMode('split')}
            disabled={disabled}
          >
            Split
          </button>
        </div>
        <div className="markdown-editor-help">
          <div className="markdown-toolbar-buttons">
            <button
              type="button"
              className="markdown-toolbar-btn"
              onClick={() => insertMarkdown('![Image alt text](/uploads/image.jpg)')}
              disabled={disabled}
              title="Insert Image"
            >
              🖼️ Image
            </button>
            <button
              type="button"
              className="markdown-toolbar-btn"
              onClick={() => insertMarkdown('!video(https://youtube.com/watch?v=...)')}
              disabled={disabled}
              title="Insert Video"
            >
              🎥 Video
            </button>
            <button
              type="button"
              className="markdown-toolbar-btn"
              onClick={() => insertMarkdown('!pdf(/uploads/file.pdf)')}
              disabled={disabled}
              title="Insert PDF"
            >
              📄 PDF
            </button>
            <button
              type="button"
              className="markdown-toolbar-btn"
              onClick={() => insertMarkdown('[Link text](https://example.com)')}
              disabled={disabled}
              title="Insert Link"
            >
              🔗 Link
            </button>
          </div>
        </div>
      </div>
      <div className="markdown-editor-content">
        {(previewMode === 'edit' || previewMode === 'split') && (
          <div className="markdown-editor-textarea-container">
            <textarea
              className="markdown-editor-textarea"
              value={markdown}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Enter markdown content here...

# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

[Link text](https://example.com)
![Image](/uploads/image.jpg)
!video(https://youtube.com/watch?v=...)
!pdf(/uploads/file.pdf)

\`code\` and \`\`\`code blocks\`\`\`

Internal resources: Use /uploads/filename.ext
External resources: Use full URL (https://...)"
            />
          </div>
        )}
        {(previewMode === 'preview' || previewMode === 'split') && (
          <div className="markdown-editor-preview">
            <div
              className="markdown-preview-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;

