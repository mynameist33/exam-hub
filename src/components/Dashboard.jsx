import { useState } from 'react';

export default function Dashboard({ 
  exams, 
  history, 
  srs = [],
  onStartSrsReview,
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
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'analytics'
  const [now] = useState(() => Date.now());
  const dueSrsCount = srs ? srs.filter(card => card.nextReview <= now).length : 0;

  const totalExams = exams.filter(Boolean).length;

  // Extract unique categories dynamically, filtering out null/undefined exams
  const categories = ['ทั้งหมด', ...new Set(exams.filter(Boolean).map(e => e.category || 'ทั่วไป'))];

  // Filter exams based on selected category safely
  const filteredExams = selectedCategory === 'ทั้งหมด'
    ? exams.filter(Boolean)
    : exams.filter(e => e && (e.category || 'ทั่วไป') === selectedCategory);

  // Calculate Stats dynamically based on selected category safely
  const filteredHistory = selectedCategory === 'ทั้งหมด'
    ? history.filter(Boolean)
    : history.filter(Boolean).filter(h => {
        const exam = exams.find(e => e && e.id === h.examId);
        return exam && (exam.category || 'ทั่วไป') === selectedCategory;
      });

  const totalExamsDisplay = selectedCategory === 'ทั้งหมด' ? totalExams : filteredExams.length;
  const examsTakenDisplay = filteredHistory.length;
  
  const averageScoreDisplay = examsTakenDisplay > 0 
    ? Math.round(filteredHistory.reduce((sum, h) => sum + (h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0), 0) / examsTakenDisplay)
    : 0;

  const totalTimeSpentSecondsDisplay = filteredHistory.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
  const totalTimeMinutesDisplay = Math.round(totalTimeSpentSecondsDisplay / 60);

  // Extract unique categories (excluding 'ทั้งหมด') for breakdown list
  const uniqueCategoriesOnly = [...new Set(exams.filter(Boolean).map(e => e.category || 'ทั่วไป'))];

  // Helper to find highest score for a specific exam
  const getExamHighScore = (examId) => {
    const examAttempts = history.filter(Boolean).filter(h => h.examId === examId);
    if (examAttempts.length === 0) return null;
    
    const maxPercent = Math.max(...examAttempts.map(h => Math.round(h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0)));
    return maxPercent;
  };

  return (
    <div className="dashboard-grid animate-fade">
      {/* Sidebar Stats Panel */}
      <div className="stats-sidebar glass-panel">
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '15px' }}>
          {selectedCategory === 'ทั้งหมด' ? 'รายงานภาพรวม' : `รายงาน: ${selectedCategory}`}
        </h3>

        {dueSrsCount > 0 && (
          <div className="srs-due-card animate-pulse" style={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            padding: '16px 14px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🧠</div>
            <div style={{ fontWeight: '700', fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-main)' }}>ถึงกำหนดทบทวนความจำ!</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
              มีคำถามที่คุณเคยตอบผิดสะสมอยู่ <strong>{dueSrsCount} ข้อ</strong> ที่พร้อมให้ทบทวนวันนี้
            </div>
            <button 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '9px', 
                fontSize: '12.5px', 
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                fontWeight: '600'
              }}
              onClick={onStartSrsReview}
            >
              🚀 เริ่มทบทวนเลย
            </button>
          </div>
        )}
        
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
              const catHistory = history.filter(Boolean).filter(h => {
                const exam = exams.find(e => e && e.id === h.examId);
                return exam && (exam.category || 'ทั่วไป') === cat;
              });
              const catAvg = catHistory.length > 0
                ? Math.round(catHistory.reduce((sum, h) => sum + (h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0), 0) / catHistory.length)
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
        <div className="section-header" style={{ marginBottom: '15px' }}>
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

        {/* Tab Navigation */}
        <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          <button 
            className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
            style={{
              background: activeTab === 'exams' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'exams' ? 'var(--color-primary-light)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13.5px',
              transition: 'all 0.2s',
              borderBottom: activeTab === 'exams' ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
          >
            📦 รายการข้อสอบ
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--color-primary-light)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13.5px',
              transition: 'all 0.2s',
              borderBottom: activeTab === 'analytics' ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
          >
            📊 สถิติและการวิเคราะห์เชิงลึก
          </button>
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

        {activeTab === 'exams' ? (
          totalExams === 0 ? (
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
        )) : (
          <div className="analytics-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
            {/* Row 1: Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="glass-panel text-center" style={{ padding: '20px' }}>
                <span className="stat-label" style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>อัตราสอบผ่าน</span>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-success)', marginTop: '8px' }}>
                  {(() => {
                    const totalAttempts = filteredHistory.length;
                    if (totalAttempts === 0) return '0%';
                    const passedAttempts = filteredHistory.filter(h => {
                      const exam = exams.find(e => e && e.id === h.examId);
                      const passPercent = exam ? exam.passPercentage : 70;
                      return (h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0) >= passPercent;
                    }).length;
                    return `${Math.round((passedAttempts / totalAttempts) * 100)}%`;
                  })()}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  จากประวัติการสอบทั้งหมด
                </span>
              </div>

              <div className="glass-panel text-center" style={{ padding: '20px' }}>
                <span className="stat-label" style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>เวลาทำข้อสอบเฉลี่ย</span>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-light)', marginTop: '8px' }}>
                  {(() => {
                    const totalAttempts = filteredHistory.length;
                    if (totalAttempts === 0) return '0 ม.';
                    const avgTimeSeconds = Math.round(filteredHistory.reduce((sum, h) => sum + (h.timeSpent || 0), 0) / totalAttempts);
                    return `${Math.floor(avgTimeSeconds / 60)}ม. ${avgTimeSeconds % 60}ส.`;
                  })()}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  ต่อการสอบหนึ่งครั้ง
                </span>
              </div>

              <div className="glass-panel text-center" style={{ padding: '20px' }}>
                <span className="stat-label" style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>ความเร็วในการตอบ</span>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginTop: '8px' }}>
                  {(() => {
                    const totalTime = filteredHistory.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
                    const totalQ = filteredHistory.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
                    if (totalQ === 0) return '0 ส./ข้อ';
                    const pace = Math.round(totalTime / totalQ);
                    let label = " ⏱️";
                    if (pace < 45) label = " ⚡";
                    if (pace > 90) label = " 🔍";
                    return `${pace} ส./ข้อ${label}`;
                  })()}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  เวลาเฉลี่ยรายคำถาม
                </span>
              </div>
            </div>

            {/* Row 2: Chart Area & Category mastery */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* SVG Trend Chart */}
              <div className="glass-panel" style={{ padding: '20px', minHeight: '320px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-main)' }}>📈 แนวโน้มพัฒนาการคะแนน (10 ครั้งล่าสุด)</h3>
                {filteredHistory.length === 0 ? (
                  <div style={{ display: 'flex', height: '220px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    ไม่มีประวัติการสอบสำหรับหมวดหมู่นี้
                  </div>
                ) : (
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox="0 0 500 240" style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                      {(() => {
                        const points = [...filteredHistory]
                          .reverse()
                          .slice(-10)
                          .map((h, idx, arr) => {
                            const scorePercent = h.totalQuestions > 0 ? (h.score / h.totalQuestions) : 0;
                            const left = 45;
                            const right = 20;
                            const top = 25;
                            const bottom = 35;
                            const w = 500 - left - right;
                            const h_chart = 240 - top - bottom;
                            const x = left + (arr.length > 1 ? (idx / (arr.length - 1)) * w : w / 2);
                            const y = top + (1 - scorePercent) * h_chart;
                            return { x, y, score: Math.round(scorePercent * 100), date: h.date.split(' ')[0] };
                          });

                        if (points.length === 0) return null;

                        const left = 45;
                        const right = 20;
                        const top = 25;
                        const bottom = 35;
                        const h_chart = 240 - top - bottom;

                        // Grid lines (Y-axis grid: 0%, 25%, 50%, 75%, 100%)
                        const gridValues = [0, 0.25, 0.5, 0.75, 1];
                        const gridLines = gridValues.map(v => {
                          const y = top + (1 - v) * h_chart;
                          return (
                            <g key={v}>
                              <line x1={left} y1={y} x2={500 - right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                              <text x={left - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="9">{v * 100}%</text>
                            </g>
                          );
                        });

                        // Path strings
                        const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                        const areaD = `M ${points[0].x} ${240 - bottom} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${240 - bottom} Z`;

                        return (
                          <>
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                              </linearGradient>
                            </defs>
                            {gridLines}
                            {points.length > 1 && <path d={areaD} fill="url(#chartGrad)" />}
                            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#6366f1" strokeWidth="3" />
                                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{p.score}%</text>
                                <text x={p.x} y={240 - bottom + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="8">#{idx + 1}</text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* Category Mastery */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-main)' }}>🏷️ สถิติความเชี่ยวชาญรายหมวดหมู่</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {uniqueCategoriesOnly.map(cat => {
                    const catHistory = history.filter(Boolean).filter(h => {
                      const exam = exams.find(e => e && e.id === h.examId);
                      return exam && (exam.category || 'ทั่วไป') === cat;
                    });
                    const catAvg = catHistory.length > 0
                      ? Math.round(catHistory.reduce((sum, h) => sum + (h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0), 0) / catHistory.length)
                      : 0;

                    const examInCategory = exams.filter(e => e && (e.category || 'ทั่วไป') === cat);
                    const attemptedCount = new Set(catHistory.map(h => h.examId)).size;

                    return (
                      <div key={cat} style={{ background: 'rgba(99, 102, 241, 0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-main)' }}>{cat}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: catAvg >= 70 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                            {catHistory.length > 0 ? `เฉลี่ย ${catAvg}%` : 'ไม่มีข้อมูล'}
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${catAvg}%`, 
                            background: catAvg >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #818cf8)', 
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                        <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>สอบแล้ว {attemptedCount}/{examInCategory.length} วิชา</span>
                          <span>ทั้งหมด {catHistory.length} ครั้ง</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Weak Areas & Smart Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Weak Areas */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-main)' }}>⚠️ หัวข้อที่ควรทบทวนเพิ่ม (Weak Areas)</h3>
                {(() => {
                  const weakExams = exams.filter(Boolean).map(exam => {
                    const attempts = history.filter(h => h.examId === exam.id);
                    if (attempts.length === 0) return null;
                    const avg = Math.round(attempts.reduce((sum, h) => sum + (h.totalQuestions > 0 ? (h.score / h.totalQuestions) * 100 : 0), 0) / attempts.length);
                    return { exam, avg, attemptsCount: attempts.length };
                  })
                  .filter(Boolean)
                  .filter(item => item.avg < item.exam.passPercentage)
                  .sort((a, b) => a.avg - b.avg)
                  .slice(0, 3);

                  if (weakExams.length === 0) {
                    return (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-success)', fontSize: '13.5px' }}>
                        🎉 ยอดเยี่ยม! คะแนนเฉลี่ยของคุณผ่านเกณฑ์ทุกวิชาแล้ว หรือยังไม่ได้ทำข้อสอบวิชาใดเลย
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {weakExams.map(({ exam, avg, attemptsCount }) => (
                        <div key={exam.id} className="flex-between" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', padding: '12px 15px', borderRadius: '10px', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{exam.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              เกณฑ์ผ่าน {exam.passPercentage}% | สอบไปแล้ว {attemptsCount} ครั้ง
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-danger)' }}>{avg}%</span>
                            <button 
                              className="btn btn-primary" 
                              style={{ display: 'block', fontSize: '11px', padding: '4px 8px', marginTop: '6px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', width: 'auto', marginLeft: 'auto' }}
                              onClick={() => onStartExam(exam)}
                            >
                              สอบซ่อม ⚡
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Smart Tips */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-main)' }}>💡 คำแนะนำส่วนบุคคล</h3>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>ลองใช้ Shuffle Mode:</strong> ช่วยลดการจำตำแหน่งของคำตอบ (สุ่มทั้งโจทย์และคำตอบ A, B, C, D)
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>วิเคราะห์จากโหมดฝึกซ้อม:</strong> เปิดโหมดฝึกซ้อมเพื่อทบทวนเฉลยอย่างละเอียดทันทีหลังตอบ ช่วยสร้างความเข้าใจได้ดียิ่งขึ้น
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>จัดสรรเวลาการทำข้อสอบ:</strong> ตรวจสอบ "ความเร็วในการตอบ" พยายามควบคุมให้อยู่ในเกณฑ์ต่ำกว่า 60 วินาทีต่อข้อเพื่อความคุ้นชินในห้องสอบจริง
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Past Attempts History Section */}
        {history.filter(Boolean).length > 0 && (
          <div className="history-section" style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>ประวัติการทำข้อสอบล่าสุด</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.filter(Boolean).map((attempt) => {
                const exam = exams.find(e => e && e.id === attempt.examId);
                const percentage = attempt.totalQuestions > 0 ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
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
                      gap: '15px'
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
