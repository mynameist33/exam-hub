import { useState, useEffect } from 'react';
import { defaultExams } from './utils/defaultExams';
import Dashboard from './components/Dashboard';
import ExamTaker from './components/ExamTaker';
import ExamEditor from './components/ExamEditor';
import ExamResults from './components/ExamResults';
import ImportExport from './components/ImportExport';
import TextConverter from './components/TextConverter';
import ErrorBoundary from './components/ErrorBoundary';

const getTimestamp = () => Date.now();

function App() {
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'taker' | 'editor' | 'results'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('examhub_theme') || 'dark';
  });

  const [srs, setSrs] = useState(() => {
    try {
      const stored = localStorage.getItem('examhub_srs');
      if (stored && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      console.error("Failed to parse SRS from LocalStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('examhub_theme', theme);
  }, [theme]);

  const saveSrsToLocalStorage = (updatedSrs) => {
    setSrs(updatedSrs);
    localStorage.setItem('examhub_srs', JSON.stringify(updatedSrs));
  };
  const [exams, setExams] = useState(() => {
    try {
      const storedExams = localStorage.getItem('xamprep_exams');
      if (storedExams && storedExams !== 'null') {
        const parsedExams = JSON.parse(storedExams);
        if (Array.isArray(parsedExams)) {
          // Migrate existing default exams and user-imported ones to include categories safely
          let migrated = false;
          const updatedExams = parsedExams.map(exam => {
            if (!exam) return exam;
            const defaultMatch = defaultExams.find(d => d.id === exam.id);
            let category = exam.category;
            
            if (defaultMatch && !category) {
              category = defaultMatch.category;
            } else if (!category || category === 'ทั่วไป') {
              // Fallback title-based matching for previously imported or created exams safely
              const titleLower = (exam.title || '').toLowerCase();
              if (titleLower.includes('xsoar') || titleLower.includes('pcsae')) {
                category = 'Cortex XSOAR';
              } else if (titleLower.includes('javascript') || titleLower.includes('js ')) {
                category = 'JavaScript';
              } else if (titleLower.includes('วิทยาศาสตร์') || titleLower.includes('science')) {
                category = 'Science';
              }
            }

            if (category && exam.category !== category) {
              migrated = true;
              return { ...exam, category };
            }
            return exam;
          });

          if (migrated) {
            localStorage.setItem('xamprep_exams', JSON.stringify(updatedExams));
          }
          return updatedExams;
        }
      }
      // Load sample exams on first load
      localStorage.setItem('xamprep_exams', JSON.stringify(defaultExams));
      return defaultExams;
    } catch (e) {
      console.error("Failed to parse exams from LocalStorage:", e);
      return defaultExams;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('xamprep_history');
      if (storedHistory && storedHistory !== 'null') {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          return parsedHistory;
        }
      }
      return [];
    } catch (e) {
      console.error("Failed to parse history from LocalStorage:", e);
      return [];
    }
  });

  const [activeExam, setActiveExam] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Sync exams to LocalStorage
  const saveExamsToLocalStorage = (updatedExams) => {
    setExams(updatedExams);
    localStorage.setItem('xamprep_exams', JSON.stringify(updatedExams));
  };

  // Sync history to LocalStorage
  const saveHistoryToLocalStorage = (updatedHistory) => {
    setHistory(updatedHistory);
    localStorage.setItem('xamprep_history', JSON.stringify(updatedHistory));
  };

  // Import Exam Handler
  // Import Exam Handler
  const handleImportExam = (newExamOrExams) => {
    const assignIds = (exam, examIdx = 0) => {
      const importTime = getTimestamp();
      return {
        ...exam,
        id: exam.id || `exam-imported-${importTime}-${examIdx}`,
        questions: exam.questions.map((q, qIdx) => ({
          ...q,
          id: q.id || `q-imported-${importTime}-${examIdx}-${qIdx}`
        }))
      };
    };

    let updatedExams;
    if (Array.isArray(newExamOrExams)) {
      const formatted = newExamOrExams.map((exam, idx) => assignIds(exam, idx));
      updatedExams = [...formatted, ...exams];
    } else {
      updatedExams = [assignIds(newExamOrExams), ...exams];
    }
    saveExamsToLocalStorage(updatedExams);
  };

  // Save/Create Exam from Editor
  const handleSaveExam = (savedExam) => {
    let updatedExams;
    const exists = exams.some(e => e.id === savedExam.id);

    if (exists) {
      updatedExams = exams.map(e => e.id === savedExam.id ? savedExam : e);
    } else {
      updatedExams = [savedExam, ...exams];
    }

    saveExamsToLocalStorage(updatedExams);
    setPage('dashboard');
    setActiveExam(null);
  };

  // Delete Exam Handler
  const handleDeleteExam = (examId) => {
    if (window.confirm("คุณต้องการลบชุดข้อสอบนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนคืนได้")) {
      const updatedExams = exams.filter(e => e.id !== examId);
      saveExamsToLocalStorage(updatedExams);
      
      // Optionally clean history for this exam
      const updatedHistory = history.filter(h => h.examId !== examId);
      saveHistoryToLocalStorage(updatedHistory);
    }
  };

  // Reset Exams to Defaults Handler
  const handleResetExams = () => {
    if (window.confirm("คุณต้องการรีเซ็ตคลังข้อสอบกลับเป็นค่าเริ่มต้นทั้งหมดใช่หรือไม่? ข้อมูลประวัติการสอบและการแก้ไขข้อสอบปัจจุบันของคุณจะถูกล้างออก")) {
      localStorage.removeItem('xamprep_exams');
      localStorage.removeItem('xamprep_history');
      setExams(defaultExams);
      setHistory([]);
      localStorage.setItem('xamprep_exams', JSON.stringify(defaultExams));
      alert("รีเซ็ตคลังข้อสอบกลับเป็นค่าเริ่มต้นเสร็จสิ้น!");
    }
  };

  // Start taking an exam
  const handleStartExam = (exam) => {
    setActiveExam(exam);
    setPage('taker');
  };

  // Submit completed exam
  const handleSubmitExam = (resultSummary) => {
    // 1. If this is an SRS review session, handle it differently
    if (activeExam.isSrsSession) {
      const updatedSrsQueue = [...srs];
      activeExam.questions.forEach((q, idx) => {
        const uAns = resultSummary.userAnswers[idx];
        const isCorrect = q.type === 'multi-choice'
          ? (Array.isArray(uAns) && Array.isArray(q.correctAnswer) && uAns.length === q.correctAnswer.length && uAns.every(val => q.correctAnswer.includes(val)))
          : (uAns === q.correctAnswer);
        
        const cardIdx = updatedSrsQueue.findIndex(item => item.examId === q.srsCard.examId && item.questionId === q.id);
        if (cardIdx !== -1) {
          if (isCorrect) {
            // Double interval
            const nextInterval = q.srsCard.interval * 2;
            updatedSrsQueue[cardIdx] = {
              ...updatedSrsQueue[cardIdx],
              interval: nextInterval,
              nextReview: getTimestamp() + nextInterval * 24 * 3600 * 1000
            };
          } else {
            // Reset interval to 1 day
            updatedSrsQueue[cardIdx] = {
              ...updatedSrsQueue[cardIdx],
              interval: 1,
              nextReview: getTimestamp() + 24 * 3600 * 1000
            };
          }
        }
      });
      saveSrsToLocalStorage(updatedSrsQueue);
      alert(`ทบทวนความจำเสร็จสิ้น! ตอบถูก ${resultSummary.score}/${resultSummary.totalQuestions} ข้อ`);
      handleBackToDashboard();
      return;
    }

    // Standard exam submission logic
    const newAttempt = {
      id: `attempt-${getTimestamp()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      score: resultSummary.score,
      totalQuestions: resultSummary.totalQuestions,
      userAnswers: resultSummary.userAnswers,
      timeSpent: resultSummary.timeSpent,
      date: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Add wrong answers to SRS queue
    const updatedSrsQueue = [...srs];
    let srsAddedCount = 0;
    activeExam.questions.forEach((q, idx) => {
      const uAns = resultSummary.userAnswers[idx];
      const isCorrect = q.type === 'multi-choice'
        ? (Array.isArray(uAns) && Array.isArray(q.correctAnswer) && uAns.length === q.correctAnswer.length && uAns.every(val => q.correctAnswer.includes(val)))
        : (uAns === q.correctAnswer);

      if (!isCorrect && q.id) {
        const exists = updatedSrsQueue.some(item => item.examId === activeExam.id && item.questionId === q.id);
        if (!exists) {
          updatedSrsQueue.push({
            examId: activeExam.id,
            examTitle: activeExam.title,
            questionId: q.id,
            interval: 1,
            nextReview: getTimestamp() + 24 * 3600 * 1000
          });
          srsAddedCount++;
        }
      }
    });

    if (srsAddedCount > 0) {
      saveSrsToLocalStorage(updatedSrsQueue);
    }

    // Limit history to 3 latest versions/attempts per exam
    const thisExamHistory = history.filter(h => h.examId === activeExam.id);
    const limitedThisExamHistory = thisExamHistory.slice(0, 2); // Keep top 2 oldest of the recent 3
    const otherExamsHistory = history.filter(h => h.examId !== activeExam.id);
    
    const updatedHistory = [newAttempt, ...limitedThisExamHistory, ...otherExamsHistory];
    saveHistoryToLocalStorage(updatedHistory);
    
    setActiveResult(resultSummary);
    setPage('results');
  };

  const handleStartSrsReview = () => {
    const now = getTimestamp();
    const dueCards = srs.filter(card => card.nextReview <= now);
    
    if (dueCards.length === 0) {
      alert("ไม่มีข้อสอบที่ถึงกำหนดทบทวนในวันนี้!");
      return;
    }

    const srsQuestions = [];
    dueCards.forEach(card => {
      const matchingExam = exams.find(e => e && e.id === card.examId);
      if (matchingExam) {
        const matchingQuestion = matchingExam.questions.find(q => q.id === card.questionId);
        if (matchingQuestion) {
          srsQuestions.push({
            ...matchingQuestion,
            srsCard: card,
            originalExamTitle: matchingExam.title
          });
        }
      }
    });

    if (srsQuestions.length === 0) {
      alert("ไม่พบคำถามเดิมในระบบแล้ว ข้อมูลวิชาอาจถูกลบไปแล้ว");
      return;
    }

    const tempSrsExam = {
      id: 'srs-review-session',
      title: '🧠 ทบทวนความจำ Spaced Repetition',
      description: 'ทบทวนเฉพาะหัวข้อที่ตอบผิดสะสมเพื่อเสริมสร้างความจำระยะยาว',
      timeLimit: Math.max(5, Math.round(srsQuestions.length * 1.5)), // 1.5 mins per question
      passPercentage: 100,
      category: 'ทบทวนประจำวัน',
      questions: srsQuestions,
      isSrsSession: true
    };

    setActiveExam(tempSrsExam);
    setPage('taker');
  };

  const handleEditExam = (exam) => {
    setActiveExam(exam);
    setPage('editor');
  };

  const handleCreateNewExam = () => {
    setActiveExam(null);
    setPage('editor');
  };

  const handleRetakeExam = () => {
    setPage('taker');
  };

  const handleBackToDashboard = () => {
    setPage('dashboard');
    setActiveExam(null);
    setActiveResult(null);
  };

  const handleReviewAttempt = (attempt) => {
    const matchingExam = exams.find(e => e.id === attempt.examId);
    if (!matchingExam) {
      alert("ไม่พบข้อมูลชุดข้อสอบเดิมในระบบแล้ว (อาจถูกลบไปแล้ว) จึงไม่สามารถเข้าตรวจคำตอบย้อนหลังได้");
      return;
    }
    
    setActiveExam(matchingExam);
    setActiveResult({
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      userAnswers: attempt.userAnswers,
      timeSpent: attempt.timeSpent
    });
    setPage('results');
  };

  return (
    <div className="app-container">
      {/* Dynamic Logo Gradient */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Global Header */}
      <header className="app-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="app-logo" onClick={handleBackToDashboard}>
            {/* Custom SVG Logo */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ExamHub
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.08)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.02em', border: '1px solid rgba(255, 255, 255, 0.05)', height: 'fit-content', cursor: 'default' }}>v1.1.0</span>
        </div>
        <div className="nav-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }} 
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {page !== 'dashboard' && (
            <button className="btn btn-secondary" onClick={handleBackToDashboard}>
              🏠 กลับหน้าหลัก
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <ErrorBoundary>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'dashboard' && (
          <Dashboard
            exams={exams}
            history={history}
            srs={srs}
            onStartSrsReview={handleStartSrsReview}
            onStartExam={handleStartExam}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
            onCreateNewExam={handleCreateNewExam}
            onOpenImportExport={() => setIsImportExportOpen(true)}
            onOpenTextConverter={() => setPage('converter')}
            onReviewAttempt={handleReviewAttempt}
            onResetExams={handleResetExams}
          />
        )}

        {page === 'converter' && (
          <TextConverter
            onImport={(examData) => {
              handleImportExam(examData);
              setPage('dashboard');
            }}
            onCancel={handleBackToDashboard}
          />
        )}

        {page === 'taker' && activeExam && (
          <ExamTaker
            exam={activeExam}
            onSubmit={handleSubmitExam}
            onCancel={handleBackToDashboard}
          />
        )}

        {page === 'editor' && (
          <ExamEditor
            key={activeExam?.id || 'new'}
            exam={activeExam}
            onSave={handleSaveExam}
            onCancel={handleBackToDashboard}
          />
        )}

        {page === 'results' && activeExam && activeResult && (
          <ExamResults
            result={activeResult}
            exam={activeExam}
            onRetake={handleRetakeExam}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>
      </ErrorBoundary>

      {/* Modals */}
      <ImportExport
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImport={handleImportExam}
        exams={exams}
      />
    </div>
  );
}

export default App;
