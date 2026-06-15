import React, { useState, useEffect } from 'react';
import { defaultExams } from './utils/defaultExams';
import Dashboard from './components/Dashboard';
import ExamTaker from './components/ExamTaker';
import ExamEditor from './components/ExamEditor';
import ExamResults from './components/ExamResults';
import ImportExport from './components/ImportExport';
import TextConverter from './components/TextConverter';

function App() {
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'taker' | 'editor' | 'results'
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Initialize and load data from LocalStorage
  useEffect(() => {
    const storedExams = localStorage.getItem('xamprep_exams');
    const storedHistory = localStorage.getItem('xamprep_history');

    if (storedExams) {
      setExams(JSON.parse(storedExams));
    } else {
      // Load sample exams on first load
      setExams(defaultExams);
      localStorage.setItem('xamprep_exams', JSON.stringify(defaultExams));
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

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
  const handleImportExam = (newExam) => {
    const updatedExams = [newExam, ...exams];
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

  // Start taking an exam
  const handleStartExam = (exam) => {
    setActiveExam(exam);
    setPage('taker');
  };

  // Submit completed exam
  const handleSubmitExam = (resultSummary) => {
    const newAttempt = {
      id: `attempt-${Date.now()}`,
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

    // Limit history to 3 latest versions/attempts per exam
    const thisExamHistory = history.filter(h => h.examId === activeExam.id);
    const limitedThisExamHistory = thisExamHistory.slice(0, 2); // Keep top 2 oldest of the recent 3
    const otherExamsHistory = history.filter(h => h.examId !== activeExam.id);
    
    const updatedHistory = [newAttempt, ...limitedThisExamHistory, ...otherExamsHistory];
    saveHistoryToLocalStorage(updatedHistory);
    
    setActiveResult(resultSummary);
    setPage('results');
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
        <div className="app-logo" onClick={handleBackToDashboard}>
          {/* Custom SVG Logo */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          ExamHub
        </div>
        <div className="nav-actions">
          {page !== 'dashboard' && (
            <button className="btn btn-secondary" onClick={handleBackToDashboard}>
              🏠 กลับหน้าหลัก
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'dashboard' && (
          <Dashboard
            exams={exams}
            history={history}
            onStartExam={handleStartExam}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
            onCreateNewExam={handleCreateNewExam}
            onOpenImportExport={() => setIsImportExportOpen(true)}
            onOpenTextConverter={() => setPage('converter')}
            onReviewAttempt={handleReviewAttempt}
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
