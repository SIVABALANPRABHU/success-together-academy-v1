import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import QuestionViewer from './QuestionViewer';
import './AssessmentViewer.css';

const AssessmentViewer = ({ content }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!content?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiService
      .getAssessmentByContentId(content.id)
      .then((res) => {
        if (!cancelled) {
          setAssessment(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load assessment');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [content?.id]);

  if (loading) {
    return (
      <div className="assessment-viewer">
        <div className="assessment-viewer-loading">Loading assessment...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="assessment-viewer">
        <div className="assessment-viewer-error">{error}</div>
      </div>
    );
  }
  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="assessment-viewer">
        <h3 className="assessment-viewer-title">{content?.title || assessment?.title}</h3>
        <p className="assessment-viewer-empty">No questions in this assessment yet.</p>
      </div>
    );
  }

  return (
    <div className="assessment-viewer">
      <h3 className="assessment-viewer-title">{content?.title || assessment?.title}</h3>
      {assessment.description && (
        <p className="assessment-viewer-description">{assessment.description}</p>
      )}
      <div className="assessment-viewer-questions">
        {assessment.questions.map((q, index) => (
          <div key={q.id} className="assessment-viewer-question-block">
            <span className="assessment-viewer-question-num">Question {index + 1}</span>
            <QuestionViewer question={q} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentViewer;
