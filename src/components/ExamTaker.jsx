import { useState, useEffect, useRef, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ExamTaker({ exam, onSubmit, onCancel }) {
  const renderQuestionText = (text) => {
    if (text.includes('\n(แปลไทย:')) {
      const parts = text.split('\n(แปลไทย:');
      const english = parts[0].trim();
      const thai = parts[1].replace(/\)$/, '').trim();
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: '500' }}><MarkdownRenderer text={english} /></div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal', marginTop: '4px' }}>
            แปลไทย: <MarkdownRenderer text={thai} />
          </div>
        </div>
      );
    }
    return <MarkdownRenderer text={text} />;
  };

  const [isStarted, setIsStarted] = useState(false);
  const [shouldShuffle, setShouldShuffle] = useState(false);
  const [questionLimit, setQuestionLimit] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [currentExam, setCurrentExam] = useState(exam);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(exam.questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState(Array(exam.questions.length).fill(false));
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Timer state (seconds remaining)
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const timerRef = useRef(null);
  const totalQuestions = currentExam.questions.length;
  const currentQuestion = currentExam.questions[currentIdx];

  // Answer state for current question in practice mode
  const [practiceAnswered, setPracticeAnswered] = useState(null); // stores index selected to show explanation

  // Refs to avoid stale closures in timer callback
  const userAnswersRef = useRef(userAnswers);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const handleNavigate = (newIdx) => {
    setCurrentIdx(newIdx);
    if (isPracticeMode) {
      setPracticeAnswered(userAnswers[newIdx]);
    }
  };

  const getQuestionTags = (q) => {
    if (!q.tags) return [];
    if (Array.isArray(q.tags)) return q.tags;
    if (typeof q.tags === 'string') return q.tags.split(',').map(t => t.trim()).filter(Boolean);
    return [];
  };

  const uniqueTags = [...new Set(exam.questions.flatMap(q => getQuestionTags(q)))].filter(Boolean);

  const handleStartExam = () => {
    // 1. Filter by tag
    let filteredQuestions = [...exam.questions];
    if (selectedTag !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => 
        getQuestionTags(q).includes(selectedTag)
      );
    }

    // 2. Shuffle if chosen, or shuffle questions only for mini quiz
    let finalQuestions = [...filteredQuestions];
    if (shouldShuffle) {
      finalQuestions = finalQuestions.map(q => {
        const optionsWithIndices = q.options.map((option, idx) => ({
          text: option,
          originalIndex: idx,
        }));
        const shuffledOptions = shuffleArray(optionsWithIndices);
        const newOptions = shuffledOptions.map(o => o.text);
        
        let newCorrectAnswer;
        if (q.type === 'multi-choice') {
          const origCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          newCorrectAnswer = shuffledOptions
            .map((item, newIdx) => origCorrect.includes(item.originalIndex) ? newIdx : -1)
            .filter(idx => idx !== -1)
            .sort((a, b) => a - b);
        } else {
          const origCorrect = q.correctAnswer;
          newCorrectAnswer = shuffledOptions.findIndex(o => o.originalIndex === origCorrect);
        }

        return {
          ...q,
          options: newOptions,
          correctAnswer: newCorrectAnswer,
        };
      });
      finalQuestions = shuffleArray(finalQuestions);
    } else if (questionLimit !== 'all') {
      // Shuffle question order for random mini-quiz even without shuffling options
      finalQuestions = shuffleArray(finalQuestions);
    }

    // 3. Slice to limit
    if (questionLimit !== 'all') {
      const limitNum = parseInt(questionLimit);
      if (finalQuestions.length > limitNum) {
        finalQuestions = finalQuestions.slice(0, limitNum);
      }
    }

    const finalExam = {
      ...exam,
      questions: finalQuestions,
      timeLimit: questionLimit === 'all' 
        ? exam.timeLimit 
        : Math.max(2, Math.round((exam.timeLimit * finalQuestions.length) / exam.questions.length))
    };

    setCurrentExam(finalExam);
    setUserAnswers(Array(finalExam.questions.length).fill(null));
    setFlaggedQuestions(Array(finalExam.questions.length).fill(false));
    setTimeLeft(finalExam.timeLimit * 60);
    setIsStarted(true);
  };

  const submitQuiz = useCallback(() => {
    clearInterval(timerRef.current);
    
    // Calculate score
    let score = 0;
    currentExam.questions.forEach((q, idx) => {
      const uAns = userAnswersRef.current[idx];
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

    const timeSpent = currentExam.timeLimit * 60 - timeLeftRef.current;

    onSubmit({
      score,
      totalQuestions,
      userAnswers: userAnswersRef.current,
      timeSpent
    });
  }, [currentExam, onSubmit, totalQuestions]);

  const handleAutoSubmit = useCallback(() => {
    alert("หมดเวลาทำข้อสอบแล้ว! ระบบจะทำการส่งข้อสอบของคุณโดยอัตโนมัติ");
    submitQuiz();
  }, [submitQuiz]);

  useEffect(() => {
    if (!isStarted) return;

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
  }, [isStarted, handleAutoSubmit]);

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

  if (!isStarted) {
    return (
      <div className="ready-screen-container animate-fade flex-center" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="ready-card glass-panel text-center" style={{ padding: '40px', maxWidth: '600px', width: '100%', borderRadius: '16px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
          <h2 style={{ fontSize: '26px', marginBottom: '8px', color: 'var(--text-main)' }}>{exam.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '25px', lineHeight: '1.6' }}>
            {exam.description || 'ไม่มีคำอธิบายสำหรับข้อสอบชุดนี้'}
          </p>

          <div className="ready-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>จำนวนคำถาม</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '4px' }}>{exam.questions.length} ข้อ</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>เวลาทำข้อสอบ</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '4px' }}>{exam.timeLimit} นาที</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>เกณฑ์ผ่านการสอบ</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>{exam.passPercentage}%</span>
            </div>
          </div>

          <div className="ready-options" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px', 
            marginBottom: '30px', 
            textAlign: 'left', 
            background: 'rgba(99, 102, 241, 0.03)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid rgba(99, 102, 241, 0.12)' 
          }}>
            <label className="flex-row cursor-pointer" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: 'var(--color-primary)' }}
                checked={shouldShuffle}
                onChange={(e) => setShouldShuffle(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--text-main)' }}>🔀 สลับข้อสอบและตัวเลือก (Shuffle Mode)</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>สลับลำดับโจทย์และลำดับตัวเลือกตอบ A, B, C, D สุ่มใหม่ทุกครั้ง</span>
              </div>
            </label>

            <label className="flex-row cursor-pointer" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: 'var(--color-primary)' }}
                checked={isPracticeMode}
                onChange={(e) => setIsPracticeMode(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--text-main)' }}>💡 เปิดโหมดฝึกซ้อมเริ่มต้น (Practice Mode)</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>แสดงเฉลยและคำอธิบายเป็นรายข้อทันทีที่เลือกตอบ</span>
              </div>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
              <label htmlFor="mini-quiz-select" style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--text-main)' }}>
                ⏱️ จำกัดจำนวนข้อสอบ (Mini Quiz)
              </label>
              <select
                id="mini-quiz-select"
                value={questionLimit}
                onChange={(e) => setQuestionLimit(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">ทำทั้งหมด ({exam.questions.length} ข้อ)</option>
                {exam.questions.length > 10 && <option value="10">ทำข้อสอบ 10 ข้อ</option>}
                {exam.questions.length > 20 && <option value="20">ทำข้อสอบ 20 ข้อ</option>}
                {exam.questions.length > 30 && <option value="30">ทำข้อสอบ 30 ข้อ</option>}
                {exam.questions.length > 50 && <option value="50">ทำข้อสอบ 50 ข้อ</option>}
              </select>
            </div>

            {uniqueTags.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <label htmlFor="tag-select" style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--text-main)' }}>
                  🏷️ กรองเฉพาะแท็ก / หัวข้อ (Filter by Tag)
                </label>
                <select
                  id="tag-select"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">ทำคำถามทุกแท็ก (ไม่มีการกรอง)</option>
                  {uniqueTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '10px 24px', minWidth: '110px' }} onClick={onCancel}>
              ย้อนกลับ
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 32px', minWidth: '150px', fontSize: '14.5px' }} onClick={handleStartExam}>
              🚀 เริ่มการสอบ
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                  onClick={() => handleNavigate(idx)}
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
                  <span><MarkdownRenderer text={opt} /></span>
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
                {currentQuestion.explanation ? <MarkdownRenderer text={currentQuestion.explanation} /> : 'ไม่ได้ระบุคำอธิบายคำตอบ'}
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
            onClick={() => handleNavigate(currentIdx - 1)}
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
                onClick={() => handleNavigate(currentIdx + 1)}
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
