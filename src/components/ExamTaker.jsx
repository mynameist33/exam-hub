import React, { useState, useEffect, useRef } from 'react';

export default function ExamTaker({ exam, onSubmit, onCancel }) {
  const renderQuestionText = (text) => {
    if (text.includes('\n(แปลไทย:')) {
      const parts = text.split('\n(แปลไทย:');
      const english = parts[0].trim();
      const thai = parts[1].replace(/\)$/, '').trim();
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: '500' }}>{english}</div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal', marginTop: '4px' }}>
            แปลไทย: {thai}
          </div>
        </div>
      );
    }
    return text;
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(exam.questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState(Array(exam.questions.length).fill(false));
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Timer state (seconds remaining)
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const timerRef = useRef(null);
  const totalQuestions = exam.questions.length;
  const currentQuestion = exam.questions[currentIdx];

  // Answer state for current question in practice mode
  const [practiceAnswered, setPracticeAnswered] = useState(null); // stores index selected to show explanation

  useEffect(() => {
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Sync practice selection when navigating questions
  useEffect(() => {
    if (isPracticeMode) {
      setPracticeAnswered(userAnswers[currentIdx]);
    }
  }, [currentIdx, isPracticeMode]);

  const handleAutoSubmit = () => {
    alert("หมดเวลาทำข้อสอบแล้ว! ระบบจะทำการส่งข้อสอบของคุณโดยอัตโนมัติ");
    submitQuiz();
  };

  const submitQuiz = () => {
    clearInterval(timerRef.current);
    
    // Calculate score
    let score = 0;
    exam.questions.forEach((q, idx) => {
      const uAns = userAnswers[idx];
      if (q.type === 'multi-choice') {
        const uArr = Array.isArray(uAns) ? uAns : [];
        const cArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
        const isCorrect = uArr.length === cArr.length && uArr.every(val => cArr.includes(val));
        if (isCorrect) score++;
      } else {
        if (uAns === q.correctAnswer) {
          score++;
        }
      }
    });

    const timeSpent = exam.timeLimit * 60 - timeLeft;

    onSubmit({
      score,
      totalQuestions,
      userAnswers,
      timeSpent
    });
  };

  const handleSubmitClick = () => {
    const unansweredCount = userAnswers.filter(ans => {
      if (ans === null) return true;
      if (Array.isArray(ans) && ans.length === 0) return true;
      return false;
    }).length;
    let confirmMessage = "คุณต้องการส่งข้อสอบใช่หรือไม่?";
    if (unansweredCount > 0) {
      confirmMessage = `คุณยังไม่ได้ตอบอีก ${unansweredCount} ข้อ ต้องการส่งข้อสอบเลยหรือไม่?`;
    }
    
    if (window.confirm(confirmMessage)) {
      submitQuiz();
    }
  };

  const handleSelectOption = (optIdx) => {
    const updated = [...userAnswers];
    const isMulti = currentQuestion.type === 'multi-choice';
    
    if (isMulti) {
      const currentSelection = Array.isArray(updated[currentIdx]) ? updated[currentIdx] : [];
      if (currentSelection.includes(optIdx)) {
        updated[currentIdx] = currentSelection.filter(idx => idx !== optIdx).sort((a, b) => a - b);
      } else {
        updated[currentIdx] = [...currentSelection, optIdx].sort((a, b) => a - b);
      }
    } else {
      updated[currentIdx] = optIdx;
    }
    
    setUserAnswers(updated);
    
    if (isPracticeMode && !isMulti) {
      setPracticeAnswered(updated[currentIdx]);
    }
  };

  const toggleFlag = () => {
    const updated = [...flaggedQuestions];
    updated[currentIdx] = !updated[currentIdx];
    setFlaggedQuestions(updated);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = userAnswers.filter(ans => ans !== null).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="taker-layout animate-fade">
      {/* Sidebar for Navigation */}
      <div className="taker-sidebar glass-panel">
        <div className="timer-box">
          <span className="stat-label">เวลาที่เหลือ</span>
          <div className={`timer-value ${timeLeft <= 60 ? 'timer-low' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div>
          <div className="question-nav-title flex-between">
            <span>ผังข้อสอบ</span>
            <span>{answeredCount}/{totalQuestions} ข้อ</span>
          </div>
          
          <div className="questions-grid-nav">
            {exam.questions.map((_, idx) => {
              let btnClass = "nav-q-btn";
              if (idx === currentIdx) {
                btnClass += " active";
              } else if (flaggedQuestions[idx]) {
                btnClass += " flagged";
              } else if (userAnswers[idx] !== null) {
                btnClass += " answered";
              }

              return (
                <button
                  key={idx}
                  className={btnClass}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px' }}>
          <label className="flex-row cursor-pointer" style={{ fontSize: '13px', textTransform: 'none', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              checked={isPracticeMode}
              onChange={(e) => {
                setIsPracticeMode(e.target.checked);
                if (e.target.checked) {
                  setPracticeAnswered(userAnswers[currentIdx]);
                }
              }}
            />
            <span>💡 เปิดโหมดฝึกซ้อม (เฉลยทันที)</span>
          </label>
        </div>

        <button className="btn btn-danger" style={{ width: '100%' }} onClick={onCancel}>
          🚪 ออกจากการสอบ
        </button>
      </div>

      {/* Main Question Interface */}
      <div className="taker-main">
        {/* Header Summary */}
        <div className="taker-header-card glass-panel">
          <div className="flex-between">
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              คำถามข้อที่ {currentIdx + 1} จากทั้งหมด {totalQuestions} ข้อ
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              ความคืบหน้า: {progressPercent}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Question Panel */}
        <div className="question-card glass-panel">
          <div className="question-text">
            {renderQuestionText(currentQuestion.text)}
          </div>

          <div className="options-container">
            {currentQuestion.options.map((opt, oIdx) => {
              let className = "option-btn";
              const isMulti = currentQuestion.type === 'multi-choice';
              
              const isSelected = isMulti 
                ? (Array.isArray(userAnswers[currentIdx]) && userAnswers[currentIdx].includes(oIdx))
                : (userAnswers[currentIdx] === oIdx);

              if (isPracticeMode && practiceAnswered !== null) {
                const isCorrectOpt = isMulti
                  ? (Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(oIdx))
                  : (oIdx === currentQuestion.correctAnswer);
                
                const isUserPicked = isMulti
                  ? (Array.isArray(practiceAnswered) && practiceAnswered.includes(oIdx))
                  : (oIdx === practiceAnswered);

                if (isCorrectOpt) {
                  className += " correct-practice";
                } else if (isUserPicked && !isCorrectOpt) {
                  className += " wrong-practice";
                }
              } else {
                if (isSelected) {
                  className += " selected";
                }
              }

              return (
                <button
                  key={oIdx}
                  className={className}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isPracticeMode && practiceAnswered !== null}
                >
                  <span className="option-index">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {isPracticeMode && currentQuestion.type === 'multi-choice' && practiceAnswered === null && (
            <button 
              className="btn btn-outline-primary" 
              style={{ width: '100%' }}
              disabled={!Array.isArray(userAnswers[currentIdx]) || userAnswers[currentIdx].length === 0}
              onClick={() => setPracticeAnswered(userAnswers[currentIdx] || [])}
            >
              🔍 ยืนยันตรวจสอบคำตอบที่เลือก
            </button>
          )}

          {/* Explanation in Practice Mode */}
          {isPracticeMode && practiceAnswered !== null && (
            <div className="explanation-box animate-fade">
              <div className="explanation-title">
                {(() => {
                  const isMulti = currentQuestion.type === 'multi-choice';
                  if (isMulti) {
                    const uArr = Array.isArray(practiceAnswered) ? practiceAnswered : [];
                    const cArr = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer : [];
                    const isCorrect = uArr.length === cArr.length && uArr.every(val => cArr.includes(val));
                    if (isCorrect) return '✓ ถูกต้อง!';
                    return '❌ ผิด! คำตอบที่ถูกต้องคือข้อ ' + cArr.map(idx => String.fromCharCode(65 + idx)).join(', ');
                  } else {
                    if (practiceAnswered === currentQuestion.correctAnswer) return '✓ ถูกต้อง!';
                    return '❌ ผิด! คำตอบที่ถูกต้องคือข้อ ' + String.fromCharCode(65 + currentQuestion.correctAnswer);
                  }
                })()}
              </div>
              <div className="explanation-content">
                {currentQuestion.explanation || 'ไม่ได้ระบุคำอธิบายคำตอบ'}
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ padding: '5px 12px', fontSize: '12px', marginTop: '10px' }}
                onClick={() => {
                  const updated = [...userAnswers];
                  updated[currentIdx] = currentQuestion.type === 'multi-choice' ? [] : null;
                  setUserAnswers(updated);
                  setPracticeAnswered(null);
                }}
              >
                🔄 ลองเลือกคำตอบใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="taker-footer">
          <button
            className="btn btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            ← ข้อก่อนหน้า
          </button>

          <button 
            className={`btn ${flaggedQuestions[currentIdx] ? 'btn-success' : 'btn-secondary'}`}
            onClick={toggleFlag}
          >
            {flaggedQuestions[currentIdx] ? '✓ ปักธงแล้ว' : '🚩 ปักธงทบทวน'}
          </button>

          <div className="footer-nav-buttons">
            {currentIdx < totalQuestions - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                ข้อถัดไป →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                onClick={handleSubmitClick}
              >
                🏁 ส่งคำตอบทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
