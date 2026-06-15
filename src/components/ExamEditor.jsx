import React, { useState, useEffect } from 'react';

export default function ExamEditor({ exam, onSave, onCancel }) {
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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [passPercentage, setPassPercentage] = useState(60);
  const [questions, setQuestions] = useState([]);
  
  // State for current question being created/edited
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qType, setQType] = useState('single-choice');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setDescription(exam.description);
      setTimeLimit(exam.timeLimit);
      setPassPercentage(exam.passPercentage);
      setQuestions(exam.questions);
    } else {
      // Clear forms for new exam
      setTitle('');
      setDescription('');
      setTimeLimit(15);
      setPassPercentage(60);
      setQuestions([]);
    }
  }, [exam]);

  const handleAddOrUpdateQuestion = (e) => {
    e.preventDefault();
    if (!qText.trim()) return;
    
    // Check if options are filled
    if (qOptions.some(opt => !opt.trim())) {
      alert("กรุณากรอกตัวเลือกให้ครบทุกช่อง");
      return;
    }

    // Check if correct answer is selected
    if (qType === 'multi-choice' && (!Array.isArray(qCorrect) || qCorrect.length === 0)) {
      alert("กรุณาเลือกตัวเลือกเฉลยที่ถูกต้องอย่างน้อย 1 ข้อ");
      return;
    }

    const newQuestion = {
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : `q-${Date.now()}`,
      text: qText,
      type: qType,
      options: [...qOptions],
      correctAnswer: qCorrect,
      explanation: qExplanation
    };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    // Reset question form
    setQText('');
    setQOptions(['', '', '', '']);
    setQType('single-choice');
    setQCorrect(0);
    setQExplanation('');
  };

  const handleEditQuestionClick = (index) => {
    const q = questions[index];
    setQText(q.text);
    setQOptions([...q.options]);
    setQType(q.type || 'single-choice');
    setQCorrect(q.correctAnswer);
    setQExplanation(q.explanation || '');
    setEditingQuestionIndex(index);
  };

  const handleDeleteQuestionClick = (index) => {
    if (window.confirm("คุณต้องการลบคำถามข้อนี้ใช่หรือไม่?")) {
      const filtered = questions.filter((_, i) => i !== index);
      setQuestions(filtered);
      if (editingQuestionIndex === index) {
        setEditingQuestionIndex(null);
        setQText('');
        setQOptions(['', '', '', '']);
        setQType('single-choice');
        setQCorrect(0);
        setQExplanation('');
      }
    }
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...qOptions];
    updated[idx] = value;
    setQOptions(updated);
  };

  const handleSaveExam = () => {
    if (!title.trim()) {
      alert("กรุณากรอกชื่อข้อสอบ");
      return;
    }
    if (questions.length === 0) {
      alert("กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ ก่อนบันทึกข้อสอบ");
      return;
    }

    const savedExam = {
      id: exam ? exam.id : `exam-${Date.now()}`,
      title,
      description,
      timeLimit: parseInt(timeLimit) || 15,
      passPercentage: parseInt(passPercentage) || 60,
      questions
    };

    onSave(savedExam);
  };

  return (
    <div className="creator-container glass-panel animate-fade">
      <div className="flex-between">
        <h2>{exam ? 'แก้ไขข้อสอบ' : 'สร้างชุดข้อสอบใหม่'}</h2>
        <button className="btn btn-secondary" onClick={onCancel}>ยกเลิก</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label htmlFor="exam-title">ชื่อวิชา / ชื่อข้อสอบ</label>
          <input
            id="exam-title"
            type="text"
            placeholder="ตัวอย่าง: ข้อสอบไวยากรณ์ภาษาอังกฤษม.ปลาย"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="exam-desc">คำอธิบายรายละเอียด</label>
          <textarea
            id="exam-desc"
            placeholder="รายละเอียดเพิ่มเติมของชุดข้อสอบ ขอบเขตเนื้อหา..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="exam-time">จำกัดเวลา (นาที)</label>
            <input
              id="exam-time"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exam-pass">เกณฑ์คะแนนผ่าน (%)</label>
            <input
              id="exam-pass"
              type="number"
              min="1"
              max="100"
              value={passPercentage}
              onChange={(e) => setPassPercentage(e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '10px 0' }} />

      {/* Editor Add Question Box */}
      <form onSubmit={handleAddOrUpdateQuestion} className="glass-panel" style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.15)' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px', color: 'var(--color-primary)' }}>
          {editingQuestionIndex !== null ? `แก้ไขคำถามข้อที่ ${editingQuestionIndex + 1}` : 'เพิ่มคำถามใหม่'}
        </h3>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="q-text">โจทย์คำถาม</label>
          <textarea
            id="q-text"
            placeholder="พิมพ์โจทย์ของคุณที่นี่..."
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="q-type">ประเภทคำถาม</label>
          <select 
            id="q-type" 
            value={qType} 
            onChange={(e) => {
              const newType = e.target.value;
              setQType(newType);
              setQCorrect(newType === 'multi-choice' ? [] : 0);
            }}
          >
            <option value="single-choice">Single Choice (ตอบถูกข้อเดียว)</option>
            <option value="multi-choice">Multi Choice (ตอบถูกหลายข้อ)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>ตัวเลือก (ทำเครื่องหมายหน้าตัวเลือกที่เป็นเฉลยที่ถูกต้อง)</label>
          <div className="q-edit-options">
            {qOptions.map((opt, idx) => {
              const isMulti = qType === 'multi-choice';
              const isChecked = isMulti
                ? (Array.isArray(qCorrect) && qCorrect.includes(idx))
                : (qCorrect === idx);

              const handleToggle = () => {
                if (isMulti) {
                  const current = Array.isArray(qCorrect) ? qCorrect : [];
                  if (current.includes(idx)) {
                    setQCorrect(current.filter(i => i !== idx).sort((a, b) => a - b));
                  } else {
                    setQCorrect([...current, idx].sort((a, b) => a - b));
                  }
                } else {
                  setQCorrect(idx);
                }
              };

              return (
                <div key={idx} className="q-edit-option-row">
                  <input
                    type={isMulti ? "checkbox" : "radio"}
                    name={isMulti ? `correct-choice-chk-${idx}` : "correct-choice-radio"}
                    className="q-edit-option-radio"
                    checked={isChecked}
                    onChange={handleToggle}
                    title={isMulti ? "คลิกเพื่อกำหนดให้ข้อนี้เป็นหนึ่งในคำตอบที่ถูก" : "คลิกเพื่อกำหนดให้ข้อนี้เป็นคำตอบที่ถูก"}
                  />
                  <input
                    type="text"
                    placeholder={`ตัวเลือก ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="q-explanation">คำอธิบายเฉลย (ใช้วิเคราะห์ภายหลังการสอบ)</label>
          <textarea
            id="q-explanation"
            placeholder="พิมพ์อธิบายว่าเพราะอะไรคำตอบนี้ถึงถูก หรือทำไมช้อยส์อื่นถึงผิด..."
            value={qExplanation}
            onChange={(e) => setQExplanation(e.target.value)}
            rows={2}
          />
        </div>

        <button type="submit" className="btn btn-outline-primary" style={{ width: '100%' }}>
          {editingQuestionIndex !== null ? 'บันทึกการแก้ไขคำถาม' : 'เพิ่มคำถามลงในชุดข้อสอบ'}
        </button>
      </form>

      {/* List of Questions in the exam */}
      <div style={{ marginTop: '15px' }}>
        <h3 style={{ marginBottom: '15px' }}>รายการคำถาม ({questions.length} ข้อ)</h3>
        {questions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '30px 0' }}>
            ยังไม่มีคำถามในชุดข้อสอบนี้ กรุณากรอกแบบฟอร์มด้านบนเพื่อเพิ่มคำถาม
          </p>
        ) : (
          <div className="creator-q-list">
            {questions.map((q, idx) => (
              <div key={q.id} className="creator-q-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                <div className="creator-q-header">
                  <span className="creator-q-index">ข้อที่ {idx + 1}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditQuestionClick(idx)}>
                      แก้ไข
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDeleteQuestionClick(idx)}>
                      ลบ
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: '500', fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {renderQuestionText(q.text)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '5px', color: q.correctAnswer === oIdx ? '#86efac' : 'inherit', fontWeight: q.correctAnswer === oIdx ? '600' : 'normal' }}>
                      <span>{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                      {q.correctAnswer === oIdx && <span>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '15px 0' }} />

      {/* Save / Cancel buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
        <button className="btn btn-primary" onClick={handleSaveExam} disabled={questions.length === 0}>
          💾 บันทึกชุดข้อสอบทั้งหมด
        </button>
      </div>
    </div>
  );
}
