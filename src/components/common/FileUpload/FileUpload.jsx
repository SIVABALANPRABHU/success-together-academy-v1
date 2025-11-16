import React, { useState, useRef } from 'react';
import apiService from '../../../services/api';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, onUploadError, disabled = false, accept = '*' }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error.message || 'Failed to upload file');
      }
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload-area ${uploading ? 'file-upload-area--uploading' : ''} ${disabled ? 'file-upload-area--disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="file-upload-input"
        />
        {uploading ? (
          <div className="file-upload-progress">
            <div className="file-upload-spinner"></div>
            <p>Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="file-upload-content">
            <div className="file-upload-icon">📁</div>
            <p className="file-upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="file-upload-hint">Supports all file types</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;


