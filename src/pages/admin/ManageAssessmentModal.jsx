import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import apiService from '../../services/api';
import './ManageAssessmentModal.css';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export default function ManageAssessmentModal({ isOpen, onClose, contentId, contentTitle }) {
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMode, setAddMode] = useState(null); // 'search' | 'create' | 'ai' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiLanguage, setAiLanguage] = useState('en');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    questionType: 'single',
    questionText: '',
    questionOptions: [{ id: '1', text: '', correct: false }, { id: '2', text: '', correct: false }],
    questionCorrectAnswers: [''],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAssessment = async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getAssessmentByContentId(contentId);
      setAssessment(res.data);
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contentId) fetchAssessment();
  }, [isOpen, contentId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await apiService.getQuestions({ search: searchQuery.trim(), limit: 20 });
      setSearchResults(res.data || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddExistingQuestion = async (questionId) => {
    try {
      setSubmitting(true);
      await apiService.addQuestionToAssessment(assessment.id, questionId, questions.length);
      await fetchAssessment();
      setSearchResults(searchResults.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuestion = async () => {
    const { questionType, questionText, questionOptions, questionCorrectAnswers } = createForm;
    if (!questionText?.trim()) {
      setError('Question text is required');
      return;
    }
    if (questionType !== 'fill_blank') {
      const opts = questionOptions.filter((o) => o.text?.trim());
      if (opts.length < 2) {
        setError('Add at least two options');
        return;
      }
      const correctCount = opts.filter((o) => o.correct).length;
      if (questionType === 'single' && correctCount !== 1) {
        setError('Select exactly one correct option');
        return;
      }
      if (questionType === 'multiple' && correctCount < 1) {
        setError('Select at least one correct option');
        return;
      }
    } else {
      const answers = questionCorrectAnswers.filter((a) => a?.trim());
      if (answers.length === 0) {
        setError('Add at least one correct answer');
        return;
      }
    }
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        question_type: questionType,
        question_text: questionText.trim(),
        options: questionType !== 'fill_blank'
          ? questionOptions.filter((o) => o.text?.trim()).map((o) => ({ id: o.id, text: o.text.trim(), correct: o.correct }))
          : null,
        correct_answers: questionType === 'fill_blank'
          ? questionCorrectAnswers.filter((a) => a?.trim())
          : null,
        language: 'en',
      };
      const res = await apiService.createQuestion(payload);
      await apiService.addQuestionToAssessment(assessment.id, res.data.id, questions.length);
      await fetchAssessment();
      setAddMode(null);
      setCreateForm({
        questionType: 'single',
        questionText: '',
        questionOptions: [{ id: '1', text: '', correct: false }, { id: '2', text: '', correct: false }],
        questionCorrectAnswers: [''],
      });
    } catch (err) {
      setError(err.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiContent.trim()) {
      setError('Paste some content to generate questions');
      return;
    }
    try {
      setAiLoading(true);
      setError(null);
      const res = await apiService.generateQuestionsWithAI(aiContent.trim(), aiLanguage, 5);
      setAiSuggestions(res.data || []);
    } catch (err) {
      const msg = err.message || 'AI generation failed.';
      setError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApproveAISuggestion = async (suggestion) => {
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        question_type: suggestion.questionType,
        question_text: suggestion.questionText,
        options: suggestion.options || null,
        correct_answers: suggestion.correctAnswers || null,
        language: aiLanguage,
      };
      const res = await apiService.createQuestion(payload);
      await apiService.addQuestionToAssessment(assessment.id, res.data.id, questions.length);
      await fetchAssessment();
      setAiSuggestions(prev => prev.filter((q) => q !== suggestion));
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    if (!window.confirm('Remove this question from the assessment?')) return;
    try {
      await apiService.removeQuestionFromAssessment(assessment.id, questionId);
      await fetchAssessment();
    } catch (err) {
      setError(err.message || 'Failed to remove');
    }
  };

  const alreadyInAssessment = (qId) => questions.some((q) => q.id === qId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage assessment: ${contentTitle || assessment?.title || 'Assessment'}`}
      size="large"
      footer={
        <Button variant="outline" onClick={onClose}>Close</Button>
      }
    >
      {error && <div className="manage-assessment-error">{error}</div>}
      {loading ? (
        <div className="manage-assessment-loading">Loading assessment...</div>
      ) : !assessment ? (
        <div className="manage-assessment-loading">Assessment not found.</div>
      ) : (
        <div className="manage-assessment">
          <div className="manage-assessment-questions-list">
            <h4>Questions in this assessment ({questions.length})</h4>
            {questions.length === 0 ? (
              <p className="manage-assessment-empty">No questions yet. Add questions below.</p>
            ) : (
              <ol className="questions-ordered-list">
                {questions.map((q, idx) => (
                  <li key={q.id} className="question-list-item">
                    <span className="question-list-num">{idx + 1}.</span>
                    <span className="question-list-text">{q.question_text?.slice(0, 80)}{q.question_text?.length > 80 ? '...' : ''}</span>
                    <span className="question-list-type">({q.question_type})</span>
                    <Button variant="ghost" size="small" onClick={() => handleRemoveQuestion(q.id)}>Remove</Button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="manage-assessment-add">
            <h4>Add question</h4>
            {!addMode ? (
              <div className="add-mode-buttons">
                <Button variant="outline" onClick={() => setAddMode('search')}>Search existing questions</Button>
                <Button variant="outline" onClick={() => setAddMode('create')}>Create new question</Button>
                <Button variant="outline" onClick={() => setAddMode('ai')}>AI generate from content</Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="small" onClick={() => setAddMode(null)}>← Back</Button>

                {addMode === 'search' && (
                  <div className="add-search-block">
                    <Input
                      placeholder="Search question bank..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="primary" onClick={handleSearch} disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
                    {searchResults.length > 0 && (
                      <ul className="search-results-list">
                        {searchResults.map((q) => (
                          <li key={q.id}>
                            <span>{q.question_text?.slice(0, 100)}...</span>
                            {alreadyInAssessment(q.id) ? (
                              <span className="badge-in">In assessment</span>
                            ) : (
                              <Button size="small" onClick={() => handleAddExistingQuestion(q.id)} disabled={submitting}>Add to assessment</Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {addMode === 'create' && (
                  <div className="add-create-block">
                    <label>Question type</label>
                    <select
                      value={createForm.questionType}
                      onChange={(e) => setCreateForm({ ...createForm, questionType: e.target.value })}
                    >
                      <option value="single">Single correct</option>
                      <option value="multiple">Multiple select</option>
                      <option value="fill_blank">Fill in the blank</option>
                    </select>
                    <label>Question text *</label>
                    <textarea
                      value={createForm.questionText}
                      onChange={(e) => setCreateForm({ ...createForm, questionText: e.target.value })}
                      rows={3}
                      placeholder="Enter question..."
                    />
                    {(createForm.questionType === 'single' || createForm.questionType === 'multiple') && (
                      <>
                        <label>Options (check correct)</label>
                        {createForm.questionOptions.map((opt, idx) => (
                          <div key={opt.id} className="question-option-row">
                            <input
                              type="checkbox"
                              checked={opt.correct}
                              onChange={() => {
                                const next = createForm.questionOptions.map((o, i) =>
                                  i === idx ? { ...o, correct: !o.correct } : createForm.questionType === 'single' ? { ...o, correct: false } : o
                                );
                                setCreateForm({ ...createForm, questionOptions: next });
                              }}
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const next = createForm.questionOptions.map((o, i) => (i === idx ? { ...o, text: e.target.value } : o));
                                setCreateForm({ ...createForm, questionOptions: next });
                              }}
                              placeholder={`Option ${idx + 1}`}
                            />
                            {createForm.questionOptions.length > 2 && (
                              <Button type="button" variant="ghost" size="small" onClick={() => setCreateForm({ ...createForm, questionOptions: createForm.questionOptions.filter((_, i) => i !== idx) })}>Remove</Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="small" onClick={() => setCreateForm({ ...createForm, questionOptions: [...createForm.questionOptions, { id: String(Date.now()), text: '', correct: false }] })}>Add option</Button>
                      </>
                    )}
                    {createForm.questionType === 'fill_blank' && (
                      <>
                        <label>Correct answer(s)</label>
                        {createForm.questionCorrectAnswers.map((ans, idx) => (
                          <div key={idx} className="question-option-row">
                            <input
                              type="text"
                              value={ans}
                              onChange={(e) => {
                                const next = [...createForm.questionCorrectAnswers];
                                next[idx] = e.target.value;
                                setCreateForm({ ...createForm, questionCorrectAnswers: next });
                              }}
                              placeholder="Correct answer"
                            />
                            {createForm.questionCorrectAnswers.length > 1 && (
                              <Button type="button" variant="ghost" size="small" onClick={() => setCreateForm({ ...createForm, questionCorrectAnswers: createForm.questionCorrectAnswers.filter((_, i) => i !== idx) })}>Remove</Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="small" onClick={() => setCreateForm({ ...createForm, questionCorrectAnswers: [...createForm.questionCorrectAnswers, ''] })}>Add answer</Button>
                      </>
                    )}
                    <Button variant="primary" onClick={handleCreateQuestion} disabled={submitting}>{submitting ? 'Saving...' : 'Create & add to assessment'}</Button>
                  </div>
                )}

                {addMode === 'ai' && (
                  <div className="add-ai-block">
                    <p className="helper">Paste lesson or article content. AI will suggest questions. Set OPENAI_API_KEY in server .env for this feature.</p>
                    <label>Language for generated questions</label>
                    <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)}>
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                    <label>Content</label>
                    <textarea
                      value={aiContent}
                      onChange={(e) => setAiContent(e.target.value)}
                      rows={6}
                      placeholder="Paste your lesson or article text here..."
                    />
                    <Button variant="primary" onClick={handleGenerateAI} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'Generate questions'}</Button>
                    {aiSuggestions.length > 0 && (
                      <div className="ai-suggestions">
                        <h5>Suggested questions – approve to add</h5>
                        {aiSuggestions.map((s, i) => (
                          <div key={i} className="ai-suggestion-card">
                            <p><strong>{s.questionText}</strong> ({s.questionType})</p>
                            {s.options?.length > 0 && <p>Options: {s.options.map((o) => o.text).join(', ')}</p>}
                            {s.correctAnswers?.length > 0 && <p>Correct: {s.correctAnswers.join(', ')}</p>}
                            <Button size="small" onClick={() => handleApproveAISuggestion(s)} disabled={submitting}>Approve & add</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
