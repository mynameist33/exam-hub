import React, { useState } from 'react';

export default function Dashboard({ 
  exams, 
  history, 
  onStartExam, 
  onEditExam, 
  onDeleteExam, 
  onCreateNewExam, 
  onOpenImportExport,
  onOpenTextConverter,
  onReviewAttempt,
  onResetExams
}) {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  // Extract unique categories dynamically
  const categories = ['ทั้งหมด', ...new Set(exams.map(e => e.category || 'ทั่วไป'))];

  // Filter exams based on selected category
  const filteredExams = selectedCategory === 'ทั้งหมด'
    ? exams
    : exams.filter(e => (e.category || 'ทั่วไป') === selectedCategory);

  // Calculate Stats dynamically based on selected category
  const filteredHistory = selectedCategory === 'ทั้งหมด'
    ? history
    : history.filter(h => {
        const exam = exams.find(e => e.id === h.examId);
        return exam && (exam.category || 'ทั่วไป') === selectedCategory;
      });

  const totalExamsDisplay = selectedCategory === 'ทั้งหมด' ? exams.length : filteredExams.length;
  const examsTakenDisplay = filteredHistory.length;
  
  const averageScoreDisplay = examsTakenDisplay > 0 
    ? Math.round(filteredHistory.reduce((sum, h) => sum + (h.score / h.totalQuestions) * 100, 0) / examsTakenDisplay)
    : 0;

  const totalTimeSpentSecondsDisplay = filteredHistory.reduce((sum, h) => sum + h.timeSpent, 0);
  const totalTimeMinutesDisplay = Math.round(totalTimeSpentSecondsDisplay / 60);

  // Extract unique categories (excluding 'ทั้งหมด') for breakdown list
  const uniqueCategoriesOnly = [...new Set(exams.map(e => e.category || 'ทั่วไป'))];

  // Helper to find highest score for a specific exam
  const getExamHighScore = (examId) => {
    const examAttempts = history.filter(h => h.examId === examId);
    if (examAttempts.length === 0) return null;
    
    const maxPercent = Math.max(...examAttempts.map(h => Math.round((h.score / h.totalQuestions) * 100)));
    return maxPercent;
  };

  return (
    <div className="dashboard-grid animate-fade">
      {/* Sidebar Stats Panel */}
      <div className="stats-sidebar glass-panel">
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '15px' }}>
          {selectedCategory === 'ทั้งหมด' ? 'รายงานภาพรวม' : `รายงาน: ${selectedCategory}`}
        </h3>
        
        <div className="stat-item">
          <span className="stat-label">จำนวนข้อสอบ</span>
          <span className="stat-value">{totalExamsDisplay} ชุด</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">ทำสำเร็จแล้ว</span>
          <span className="stat-value">{examsTakenDisplay} ครั้ง</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">คะแนนเฉลี่ย</span>
          <span className="stat-value highlight">{averageScoreDisplay}%</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">เวลาฝึกซ้อม</span>
          <span className="stat-value">{totalTimeMinutesDisplay} นาที</span>
        </div>

        {/* Category breakdown visual list */}
        {exams.length > 0 && (
          <div className="category-breakdown-section" style={{ marginTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '15px' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              วิเคราะห์รายหมวดหมู่
            </h4>
            {uniqueCategoriesOnly.map(cat => {
              const catExams = exams.filter(e => (e.category || 'ทั่วไป') === cat);
              const catHistory = history.filter(h => {
                const exam = exams.find(e => e.id === h.examId);
                return exam && (exam.category || 'ทั่วไป') === cat;
              });
              const catAvg = catHistory.length > 0
                ? Math.round(catHistory.reduce((sum, h) => sum + (h.score / h.totalQuestions) * 100, 0) / catHistory.length)
                : 0;
              const isCatActive = selectedCategory === cat;

              return (
                <div 
                  key={cat} 
                  className={`category-stat-row ${isCatActive ? 'active-row' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '12.5px', 
                    padding: '8px 10px',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    background: isCatActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    border: isCatActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  title={`คลิกเพื่อกรองหมวดหมู่ ${cat}`}
                >
                  <span style={{ fontWeight: '500', color: isCatActive ? 'var(--text-main)' : 'var(--text-muted)' }}>🏷️ {cat}</span>
                  <span style={{ fontWeight: '600', color: catHistory.length > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {catHistory.length > 0 ? `${catAvg}%` : 'ไม่มีข้อมูล'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            สถิติอ้างอิงตามฐานข้อมูล LocalStorage
          </div>
        )}
      </div>

      {/* Main Exams List Panel */}
      <div className="exams-section">
        <div className="section-header">
          <h2>คลังข้อสอบของคุณ</h2>
          <div className="nav-actions">
            <button 
              className="btn btn-secondary" 
              style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }} 
              onClick={onResetExams}
            >
              🔄 รีเซ็ตข้อสอบเริ่มต้น
            </button>
            <button className="btn btn-secondary" onClick={onOpenTextConverter}>
              📝 แปลงข้อความเป็นข้อสอบ
            </button>
            <button className="btn btn-secondary" onClick={onOpenImportExport}>
              📥 นำเข้า / ส่งออก JSON
            </button>
            <button className="btn btn-primary" onClick={onCreateNewExam}>
              ➕ สร้างข้อสอบใหม่
            </button>
          </div>
        </div>

        {totalExams > 0 && (
          <div className="category-filters animate-fade">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                🏷️ {cat}
              </button>
            ))}
          </div>
        )}

        {totalExams === 0 ? (
          <div className="glass-panel text-center animate-fade" style={{ padding: '60px 20px' }}>
            <h3 style={{ marginBottom: '10px' }}>ไม่มีข้อสอบอยู่ในคลังของคุณ</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', maxWidth: '450px', margin: '0 auto 20px' }}>
              เริ่มต้นด้วยการสร้างข้อสอบใหม่ด้วยตนเอง หรือนำเข้าชุดข้อสอบตัวอย่างด้วยเครื่องมือนำเข้าข้อความ JSON
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={onOpenTextConverter}>
                📝 แปลงข้อความดิบ
              </button>
              <button className="btn btn-secondary" onClick={onOpenImportExport}>
                นำเข้าตัวอย่าง JSON
              </button>
              <button className="btn btn-primary" onClick={onCreateNewExam}>
                สร้างข้อสอบแรกของคุณ
              </button>
            </div>
          </div>
        ) : (
          <div className="exams-grid">
            {filteredExams.map((exam) => {
              const highScore = getExamHighScore(exam.id);
              const isPassed = highScore !== null && highScore >= exam.passPercentage;

              return (
                <div key={exam.id} className="exam-card glass-panel animate-fade">
                  <div>
                    <div className="exam-card-category">{exam.category || 'ทั่วไป'}</div>
                    <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 className="exam-card-title">{exam.title}</h3>
                      {highScore !== null ? (
                        <span className={`card-tag ${isPassed ? 'tag-success' : 'tag-warning'}`}>
                          {isPassed ? `ผ่าน (${highScore}%)` : `ไม่ผ่าน (${highScore}%)`}
                        </span>
                      ) : (
                        <span className="card-tag tag-info">ยังไม่เคยทำ</span>
                      )}
                    </div>
                    
                    <p className="exam-card-desc">{exam.description || 'ไม่มีคำอธิบายสำหรับข้อสอบนี้'}</p>
                  </div>

                  <div>
                    <div className="exam-card-meta">
                      <div className="meta-item">
                        <span>📝</span>
                        <span>{exam.questions.length} ข้อ</span>
                      </div>
                      <div className="meta-item">
                        <span>⏱️</span>
                        <span>{exam.timeLimit} นาที</span>
                      </div>
                      <div className="meta-item">
                        <span>🎯</span>
                        <span>เกณฑ์ผ่าน {exam.passPercentage}%</span>
                      </div>
                    </div>

                    <div className="exam-card-actions">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '8px 12px', fontSize: '13px' }} 
                          onClick={() => onEditExam(exam)}
                          title="แก้ไขข้อสอบนี้"
                        >
                          แก้ไข
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '8px 12px', fontSize: '13px' }} 
                          onClick={() => onDeleteExam(exam.id)}
                          title="ลบข้อสอบนี้ออกจากระบบ"
                        >
                          ลบ
                        </button>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => onStartExam(exam)}
                      >
                        ⚡ เริ่มสอบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Past Attempts History Section */}
        {history.length > 0 && (
          <div className="history-section" style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>ประวัติการทำข้อสอบล่าสุด</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((attempt) => {
                const exam = exams.find(e => e.id === attempt.examId);
                const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const isPassed = exam ? percentage >= exam.passPercentage : false;

                return (
                  <div 
                    key={attempt.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <h4 style={{ fontSize: '16px' }}>{attempt.examTitle}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        📅 วันที่ทำข้อสอบ: {attempt.date}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                        <span className="stat-label" style={{ fontSize: '10px' }}>คะแนน</span>
                        <span style={{ fontWeight: '700', color: isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                        <span className="stat-label" style={{ fontSize: '10px' }}>เวลาที่ใช้</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {Math.floor(attempt.timeSpent / 60)}ม. {attempt.timeSpent % 60}ส.
                        </span>
                      </div>

                      <span className={`card-tag ${isPassed ? 'tag-success' : 'tag-warning'}`}>
                        {isPassed ? 'สอบผ่าน' : 'ไม่ผ่าน'}
                      </span>

                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => onReviewAttempt(attempt)}
                      >
                        🔍 ตรวจสอบเฉลย
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
