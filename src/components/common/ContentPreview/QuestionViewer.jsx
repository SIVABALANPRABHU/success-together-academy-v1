import React, { useState } from 'react';
import './QuestionViewer.css';

const QuestionViewer = ({ content, question: questionFromBank }) => {
  const fromBank = questionFromBank && (questionFromBank.question_text || questionFromBank.questionText);
  const questionType = fromBank ? (questionFromBank.question_type || questionFromBank.questionType) : content?.metadata?.questionType;
  const questionText = fromBank ? (questionFromBank.question_text || questionFromBank.questionText) : content?.metadata?.questionText;
  const options = fromBank ? (questionFromBank.options || []) : (content?.metadata?.options || []);
  const correctAnswers = fromBank ? (questionFromBank.correct_answers || questionFromBank.correctAnswers || []) : (content?.metadata?.correctAnswers || []);
  const [selectedSingle, setSelectedSingle] = useState(null);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const toggleMultiple = (optionId) => {
    if (selectedMultiple.includes(optionId)) {
      setSelectedMultiple(selectedMultiple.filter((id) => id !== optionId));
    } else {
      setSelectedMultiple([...selectedMultiple, optionId]);
    }
  };

  const checkAnswer = () => {
    setChecked(true);
    if (questionType === 'single') {
      const correctOpt = options.find((o) => o.correct);
      const correct = correctOpt && selectedSingle === correctOpt.id;
      setIsCorrect(correct);
    } else if (questionType === 'multiple') {
      const correctIds = options.filter((o) => o.correct).map((o) => o.id);
      const correct =
        correctIds.length === selectedMultiple.length &&
        correctIds.every((id) => selectedMultiple.includes(id));
      setIsCorrect(correct);
    } else {
      const normalized = (s) => String(s).trim().toLowerCase();
      const user = normalized(fillAnswer);
      const match = correctAnswers.some((a) => normalized(a) === user);
      setIsCorrect(match);
    }
  };

  if (!questionText) {
    return (
      <div className="question-viewer">
        <p className="question-viewer-empty">No question content.</p>
      </div>
    );
  }

  return (
    <div className="question-viewer">
      {(content?.title || questionFromBank?.title) && (
        <h3 className="question-viewer-title">{content?.title || questionFromBank?.title}</h3>
      )}
      <p className="question-viewer-text">{questionText}</p>

      {(questionType === 'single' || questionType === 'multiple') && (
        <div className="question-viewer-options">
          {options.map((opt) => (
            <label key={opt.id} className="question-viewer-option">
              <input
                type={questionType === 'single' ? 'radio' : 'checkbox'}
                name="question-options"
                checked={
                  questionType === 'single'
                    ? selectedSingle === opt.id
                    : selectedMultiple.includes(opt.id)
                }
                onChange={() =>
                  questionType === 'single'
                    ? setSelectedSingle(opt.id)
                    : toggleMultiple(opt.id)
                }
                disabled={checked}
              />
              <span>{opt.text}</span>
            </label>
          ))}
        </div>
      )}

      {questionType === 'fill_blank' && (
        <div className="question-viewer-fill">
          <input
            type="text"
            className="question-viewer-input"
            placeholder="Type your answer..."
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            disabled={checked}
          />
        </div>
      )}

      {!checked ? (
        <button type="button" className="question-viewer-check-btn" onClick={checkAnswer}>
          Check answer
        </button>
      ) : (
        <div className={`question-viewer-result ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Incorrect. Try again or see correct answer below.'}
          {!isCorrect && questionType === 'fill_blank' && correctAnswers.length > 0 && (
            <p className="question-viewer-correct-answer">
              Correct answer(s): {correctAnswers.join(', ')}
            </p>
          )}
          {!isCorrect && (questionType === 'single' || questionType === 'multiple') && (
            <p className="question-viewer-correct-answer">
              Correct: {options.filter((o) => o.correct).map((o) => o.text).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionViewer;
