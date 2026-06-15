import React, { useState } from 'react';

export default function ImportExport({ isOpen, onClose, onImport, exams }) {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const sampleJSON = {
    title: "ภาษาไทยเบื้องต้น",
    category: "ภาษาไทย",
    description: "ทดสอบความรู้ภาษาไทยพื้นฐานเกี่ยวกับคำราชาศัพท์และการใช้คำภาษาต่างประเทศ",
    timeLimit: 15,
    passPercentage: 60,
    questions: [
      {
        text: "คำราชาศัพท์ใดหมายถึง 'หัวใจ'?",
        options: ["พระโอษฐ์", "พระอุระ", "พระหทัย", "พระนลาฏ"],
        correctAnswer: 2,
        explanation: "พระหทัย หมายถึง หัวใจ, พระโอษฐ์ หมายถึง ปาก, พระอุระ หมายถึง อก, พระนลาฏ หมายถึง หน้าผาก"
      },
      {
        text: "ข้อใดเป็นคำภาษาอังกฤษที่คนไทยนำมาใช้ทับศัพท์?",
        options: ["เก้าอี้", "คอมพิวเตอร์", "เซมเบ้", "บะหมี่"],
        correctAnswer: 1,
        explanation: "คอมพิวเตอร์ (Computer) เป็นคำภาษาอังกฤษ ส่วนเก้าอี้และบะหมี่มาจากภาษาจีน และเซมเบ้มาจากภาษาญี่ปุ่น"
      }
    ]
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Basic validation
      if (!parsed.title) throw new Error("ขาดฟิลด์ 'title' (ชื่อข้อสอบ)");
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("ต้องมีฟิลด์ 'questions' ที่เป็นอาเรย์ของคำถามอย่างน้อย 1 ข้อ");
      }

      parsed.questions.forEach((q, idx) => {
        if (!q.text) throw new Error(`คำถามข้อที่ ${idx + 1} ไม่มีข้อความคำถาม ('text')`);
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`คำถามข้อที่ ${idx + 1} ต้องมีตัวเลือกตอบ ('options') อย่างน้อย 2 ตัวเลือก`);
        }
        
        const isMulti = q.type === 'multi-choice' || Array.isArray(q.correctAnswer);
        if (isMulti) {
          if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
            throw new Error(`คำถามข้อที่ ${idx + 1} แบบเลือกตอบหลายข้อ เฉลย 'correctAnswer' ต้องเป็นอาเรย์ของตัวเลขดัชนีที่ไม่ว่าง`);
          }
          q.correctAnswer.forEach(ans => {
            if (typeof ans !== 'number' || ans < 0 || ans >= q.options.length) {
              throw new Error(`คำถามข้อที่ ${idx + 1} ดัชนีเฉลยในอาเรย์ 'correctAnswer' ต้องเป็นตัวเลขระหว่าง 0 ถึง ${q.options.length - 1}`);
            }
          });
        } else {
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            throw new Error(`คำถามข้อที่ ${idx + 1} ตัวเลือกคำตอบที่ถูกต้อง ('correctAnswer') ต้องเป็นดัชนีตัวเลข (0, 1, 2...) ที่สอดคล้องกับขนาดตัวเลือก`);
          }
        }
      });

      // Format import
      const newExam = {
        id: `exam-imported-${Date.now()}`,
        title: parsed.title,
        category: parsed.category || 'ทั่วไป',
        description: parsed.description || 'นำเข้าข้อสอบด้วยไฟล์ข้อความ',
        timeLimit: parseInt(parsed.timeLimit) || 10,
        passPercentage: parseInt(parsed.passPercentage) || 60,
        questions: parsed.questions.map((q, idx) => ({
          id: `q-imported-${Date.now()}-${idx}`,
          text: q.text,
          type: q.type || (Array.isArray(q.correctAnswer) ? 'multi-choice' : 'single-choice'),
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'ไม่ได้ระบุคำอธิบายคำตอบที่ถูกต้อง'
        }))
      };

      onImport(newExam);
      setJsonText('');
      setErrorMsg('');
      onClose();
    } catch (err) {
      setErrorMsg(`นำเข้าข้อมูลผิดพลาด: ${err.message}`);
    }
  };

  const handleCopySample = () => {
    setJsonText(JSON.stringify(sampleJSON, null, 2));
    setErrorMsg('');
  };

  // Export current exams
  const handleExportExams = () => {
    // Simplify for export - remove the unique IDs so they are cleaner to share
    const exportable = exams.map(({ title, category, description, timeLimit, passPercentage, questions }) => ({
      title,
      category: category || 'ทั่วไป',
      description,
      timeLimit,
      passPercentage,
      questions: questions.map(({ text, type, options, correctAnswer, explanation }) => ({
        text,
        type,
        options,
        correctAnswer,
        explanation
      }))
    }));
    
    setJsonText(JSON.stringify(exportable, null, 2));
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel animate-fade" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>นำเข้า / ส่งออก ข้อสอบ (JSON)</h2>
          <button className="btn btn-secondary" style={{ padding: '5px 10px' }} onClick={onClose}>✕</button>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          คุณสามารถนำเข้าข้อสอบจาก AI หรือคัดลอกส่งออกข้อสอบที่มีอยู่เพื่อแชร์กับเพื่อนได้
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCopySample}>
            ใช้ตัวอย่างการนำเข้า
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExportExams}>
            ส่งออกข้อสอบทั้งหมด
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="json-input">ข้อความ JSON</label>
          <textarea
            id="json-input"
            className="json-textarea"
            placeholder='วางโค้ด JSON ของข้อสอบที่นี่...'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>

        {errorMsg && (
          <div className="color-danger-text" style={{ fontSize: '13px', textAlign: 'left' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={!jsonText.trim()}>
            ยืนยันการนำเข้า
          </button>
        </div>
      </div>
    </div>
  );
}
