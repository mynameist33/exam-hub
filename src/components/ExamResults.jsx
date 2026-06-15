import React, { useState } from 'react';

export default function ExamResults({ result, exam, onRetake, onBackToDashboard }) {
  const renderQuestionText = (text) => {
    if (text.includes('\n(แปลไทย:')) {
      const parts = text.split('\n(แปลไทย:');
      const english = parts[0].trim();
      const thai = parts[1].replace(/\)$/, '').trim();
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: '500' }}>{english}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal', marginTop: '4px' }}>
            แปลไทย: {thai}
          </div>
        </div>
      );
    }
    return text;
  };

  const { score, totalQuestions, userAnswers, timeSpent } = result;
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= exam.passPercentage;
  
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect'

  // Format time (e.g. 5m 24s)
  // Format time (e.g. 11:09 นาที)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} นาที`;
  };

  // Radial calculations
  const radius = 100;
  const stroke = 12;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const filteredQuestions = exam.questions.filter((q, idx) => {
    const isCorrect = userAnswers[idx] === q.correctAnswer;
    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Results Header Card */}
      <div className="results-container glass-panel">
        <div className="radial-progress-container">
          <svg className="radial-svg">
            <circle
              className="radial-bg"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              className={isPassed ? 'radial-fill pass' : 'radial-fill fail'}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div className="radial-text">
            <span className="radial-score" style={{ color: isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>{percentage}%</span>
            <span className="radial-label">{score} / {totalQuestions} ข้อ</span>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>
            {isPassed ? '🎉 สอบผ่านเกณฑ์!' : '😢 สอบไม่ผ่านเกณฑ์'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {isPassed 
              ? `ยินดีด้วย! คุณทำคะแนนได้ ${percentage}% ผ่านเกณฑ์ขั้นต่ำ ${exam.passPercentage}%` 
              : `พยายามอีกนิด! คุณได้คะแนน ${percentage}% ยังไม่ถึงเกณฑ์ผ่านขั้นต่ำ ${exam.passPercentage}%`}
          </p>
        </div>

        {/* Stats Summary Grid */}
        <div className="results-grid-summary">
          <div className="results-summary-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginBottom: '2px' }}>⏱️</span>
            <span className="stat-label">เวลาที่ใช้</span>
            <span className="results-summary-value">{formatTime(timeSpent)}</span>
          </div>
          <div className="results-summary-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginBottom: '2px' }}>✅</span>
            <span className="stat-label">ตอบถูก</span>
            <span className="results-summary-value" style={{ color: 'var(--color-success)' }}>{score} ข้อ</span>
          </div>
          <div className="results-summary-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginBottom: '2px' }}>❌</span>
            <span className="stat-label">ตอบผิด</span>
            <span className="results-summary-value" style={{ color: 'var(--color-danger)' }}>{totalQuestions - score} ข้อ</span>
          </div>
          <div className="results-summary-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginBottom: '2px' }}>⏳</span>
            <span className="stat-label">เวลาที่ให้</span>
            <span className="results-summary-value">{exam.timeLimit} นาที</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onBackToDashboard}>
            กลับสู่หน้าหลัก
          </button>
          <button className="btn btn-primary" onClick={onRetake}>
            🔄 ทำข้อสอบใหม่อีกครั้ง
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="review-section">
        <div className="flex-between">
          <h3>ตรวจทานข้อสอบอย่างละเอียด</h3>
          <div className="nav-actions" style={{ gap: '8px' }}>
            <button 
              className={`btn btn-secondary ${filter === 'all' ? 'btn-outline-primary' : ''}`} 
              style={{ padding: '6px 12px', fontSize: '13px' }} 
              onClick={() => setFilter('all')}
            >
              ทั้งหมด ({totalQuestions})
            </button>
            <button 
              className={`btn btn-secondary ${filter === 'correct' ? 'btn-outline-primary' : ''}`} 
              style={{ padding: '6px 12px', fontSize: '13px' }} 
              onClick={() => setFilter('correct')}
            >
              ถูก ({score})
            </button>
            <button 
              className={`btn btn-secondary ${filter === 'incorrect' ? 'btn-outline-primary' : ''}`} 
              style={{ padding: '6px 12px', fontSize: '13px' }} 
              onClick={() => setFilter('incorrect')}
            >
              ผิด ({totalQuestions - score})
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
            ไม่มีรายการคำถามในหมวดหมู่นี้
          </div>
        ) : (
          filteredQuestions.map((q) => {
            // Find index of the question in the original exam array
            const originalIndex = exam.questions.findIndex(eq => eq.id === q.id);
            const userAnswer = userAnswers[originalIndex];
            const isCorrect = q.type === 'multi-choice'
              ? (Array.isArray(userAnswer) && Array.isArray(q.correctAnswer) &&
                 userAnswer.length === q.correctAnswer.length &&
                 userAnswer.every(val => q.correctAnswer.includes(val)))
              : (userAnswer === q.correctAnswer);

            return (
              <div key={q.id} className="review-card glass-panel animate-fade">
                <div className="review-q-header">
                  <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-primary)' }}>
                    ข้อที่ {originalIndex + 1}
                  </span>
                  <span className={`card-tag ${isCorrect ? 'tag-success' : 'tag-danger'}`}>
                    {isCorrect ? 'ถูกต้อง' : 'ผิด'}
                  </span>
                </div>

                <div style={{ fontWeight: '500', fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {renderQuestionText(q.text)}
                </div>

                <div className="options-container">
                  {q.options.map((opt, oIdx) => {
                    let className = "option-btn review-choice-btn";
                    const isMulti = q.type === 'multi-choice';
                    
                    const isCorrectOpt = isMulti
                      ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(oIdx))
                      : (oIdx === q.correctAnswer);
                      
                    const isUserSelected = isMulti
                      ? (Array.isArray(userAnswer) && userAnswer.includes(oIdx))
                      : (oIdx === userAnswer);

                    if (isCorrectOpt) {
                      className += " correct-choice"; // Correct answers are green
                    } else if (isUserSelected && !isCorrectOpt) {
                      className += " wrong-choice"; // User's wrong selection is red
                    }

                    return (
                      <div key={oIdx} className={className}>
                        <span className="option-index">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isCorrectOpt && <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>คำตอบที่ถูกต้อง</span>}
                        {isUserSelected && !isCorrectOpt && <span style={{ color: '#ff8080', fontWeight: 'bold' }}>คุณเลือกข้อนี้</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="explanation-box">
                    <div className="explanation-title">💡 วิเคราะห์และเฉลยละเอียด</div>
                    <div className="explanation-content">{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
