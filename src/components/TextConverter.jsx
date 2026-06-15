import { useState } from 'react';

export default function TextConverter({ onImport, onCancel }) {
  const [title, setTitle] = useState('ข้อสอบนำเข้าจากข้อความดิบ');
  const [category, setCategory] = useState('ทั่วไป');
  const [description, setDescription] = useState('ชุดข้อสอบที่แปลงจากข้อความตัวอักษรธรรมดา');
  const [timeLimit, setTimeLimit] = useState(15);
  const [passPercentage, setPassPercentage] = useState(70);
  
  const [rawText, setRawText] = useState('');

  const sampleRawText = `1. What is Cortex XSOAR?
A. Security Orchestration, Automation, and Response
B. A database system
C. A firewall appliance
D. An antivirus software
Answer: A
Explanation: Cortex XSOAR is Palo Alto Networks' security orchestration, automation, and response platform.

2. ข้อใดกล่าวถึงประโยชน์ของ Playbook ใน XSOAR ได้ถูกต้องที่สุด?
A. ช่วยควบคุมอัตราการเข้างานของพนักงาน
B. ช่วยทำงานอัตโนมัติซ้ำ ๆ (Automation) และลดเวลาตอบสนองเหตุการณ์ (MTTR)
C. ใช้เป็นฐานข้อมูลเก็บความลับขององค์กร
D. ใช้ในการจำกัดสิทธิ์ผู้ใช้งานในระบบ
เฉลย: B
คำอธิบาย: Playbooks มีหน้าที่จัดลำดับขั้นตอนการตอบสนองต่อภัยคุกคามแบบอัตโนมัติ ช่วยลดภาระของนักวิเคราะห์และลดเวลาในการสืบสวนหาความจริง`;

  // Parser Logic
  const parseQuestions = (textToParse) => {
    if (!textToParse.trim()) {
      return [];
    }

    const lines = textToParse.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const questions = [];
    let currentQuestion = null;

    const questionRegex = /^(\d+[.)\-\s]+|Q\d+[:.\s]+)(.*)/i;
    const optionRegex = /^([A-Ga-gก-จ])[.)\-\s:]+(.*)/;
    const answerRegex = /^(Answer|เฉลย|Ans|คำตอบ|เฉลยข้อ)[\s:\-=]+([A-Ga-gก-จ1-7]|\d)/i;
    const explanationRegex = /^(Explanation|คำอธิบาย|เฉลยละเอียด|เหตุผล|คำแปล)[\s:\-=]+(.*)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Check if it's a new question
      const qMatch = line.match(questionRegex);
      if (qMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: `q-parsed-${questions.length}`,
          text: qMatch[2].trim(),
          type: 'single-choice',
          options: [],
          correctAnswer: 0,
          explanation: ''
        };
        continue;
      }

      // 2. Check if it's an option (A-G)
      const optMatch = line.match(optionRegex);
      if (optMatch && currentQuestion) {
        currentQuestion.options.push(optMatch[2].trim());
        continue;
      }

      // 3. Check if it's the correct answer
      const ansMatch = line.match(answerRegex);
      if (ansMatch && currentQuestion) {
        const ansPart = line.split(/Answer|เฉลย|Ans|คำตอบ|เฉลยข้อ/i)[1] || '';
        const chars = ansPart.match(/[A-Ga-gก-จ1-7]/g);
        
        if (chars && chars.length > 1) {
          const indices = chars.map(char => {
            const val = char.toUpperCase();
            if (['A', 'ก', '1'].includes(val)) return 0;
            if (['B', 'ข', '2'].includes(val)) return 1;
            if (['C', 'ค', '3'].includes(val)) return 2;
            if (['D', 'ง', '4'].includes(val)) return 3;
            if (['E', 'จ', '5'].includes(val)) return 4;
            if (['F', 'ฉ', '6'].includes(val)) return 5;
            if (['G', 'ช', '7'].includes(val)) return 6;
            return 0;
          });
          currentQuestion.correctAnswer = [...new Set(indices)].sort((a, b) => a - b);
          currentQuestion.type = 'multi-choice';
        } else {
          const ansVal = ansMatch[2].trim().toUpperCase();
          let ansIdx = 0;
          if (['A', 'ก', '1'].includes(ansVal)) ansIdx = 0;
          else if (['B', 'ข', '2'].includes(ansVal)) ansIdx = 1;
          else if (['C', 'ค', '3'].includes(ansVal)) ansIdx = 2;
          else if (['D', 'ง', '4'].includes(ansVal)) ansIdx = 3;
          else if (['E', 'จ', '5'].includes(ansVal)) ansIdx = 4;
          else if (['F', 'ฉ', '6'].includes(ansVal)) ansIdx = 5;
          else if (['G', 'ช', '7'].includes(ansVal)) ansIdx = 6;
          currentQuestion.correctAnswer = ansIdx;
          currentQuestion.type = 'single-choice';
        }
        continue;
      }

      // 4. Check if it's an explanation
      const expMatch = line.match(explanationRegex);
      if (expMatch && currentQuestion) {
        currentQuestion.explanation = expMatch[2].trim();
        continue;
      }

      // 5. Fallback - append text to either question text or explanation
      if (currentQuestion) {
        if (currentQuestion.options.length === 0) {
          currentQuestion.text += '\n' + line;
        } else {
          currentQuestion.explanation += (currentQuestion.explanation ? '\n' : '') + line;
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const parsedQuestions = parseQuestions(rawText);

  const handleLoadSample = () => {
    setRawText(sampleRawText);
  };

  const handleImportClick = () => {
    if (!title.trim()) {
      alert("กรุณากรอกชื่อวิชา");
      return;
    }
    if (parsedQuestions.length === 0) {
      alert("ไม่พบข้อสอบที่สามารถแปลงได้ กรุณากรอกข้อความด้านล่างตามโครงสร้างตัวอย่าง");
      return;
    }

    // Double check that every question has at least 2 options
    const invalidQ = parsedQuestions.find(q => q.options.length < 2);
    if (invalidQ) {
      alert(`คำถาม "${invalidQ.text.substring(0, 30)}..." มีตัวเลือกน้อยกว่า 2 ข้อ กรุณาตรวจทานรูปแบบคำถามในกล่องข้อความ`);
      return;
    }

    const examData = {
      title,
      category: category.trim() || 'ทั่วไป',
      description,
      timeLimit: parseInt(timeLimit) || 15,
      passPercentage: parseInt(passPercentage) || 70,
      questions: parsedQuestions
    };

    onImport(examData);
    alert(`นำเข้าข้อสอบสำเร็จ! ทั้งหมด ${parsedQuestions.length} ข้อ`);
  };

  return (
    <div className="creator-container glass-panel animate-fade" style={{ maxWidth: '100%' }}>
      <div className="flex-between">
        <div>
          <h2>เครื่องมือแปลงข้อความดิบเป็นข้อสอบ (Text-to-Exam Converter)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            คัดลอกโจทย์ที่มีอยู่จาก AI หรือเว็บไซต์ต่าง ๆ มาวางระบบจะพยายามแยกแยะคำถาม ช้อยส์ และเฉลยให้อัตโนมัติ
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onCancel}>ยกเลิก</button>
      </div>

      {/* Meta configuration */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px', padding: '20px', background: 'rgba(0,0,0,0.1)' }}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1.5 }}>
            <label htmlFor="conv-title">ชื่อข้อสอบ / วิชา</label>
            <input
              id="conv-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="conv-category">หมวดหมู่ / เรื่อง</label>
            <input
              id="conv-category"
              type="text"
              placeholder="ตัวอย่าง: JavaScript"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="conv-desc">คำอธิบายสั้นๆ</label>
            <input
              id="conv-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: '10px' }}>
          <div className="form-group">
            <label htmlFor="conv-time">เวลาทำข้อสอบ (นาที)</label>
            <input
              id="conv-time"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="conv-pass">เกณฑ์ผ่าน (%)</label>
            <input
              id="conv-pass"
              type="number"
              min="1"
              max="100"
              value={passPercentage}
              onChange={(e) => setPassPercentage(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Double Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px', marginTop: '15px' }} className="form-row">
        {/* Left Side: Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <label>ข้อความข้อสอบดิบ (Raw Text)</label>
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={handleLoadSample}>
              📄 โหลดตัวอย่างรูปแบบข้อความ
            </button>
          </div>
          <textarea
            style={{ minHeight: '400px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
            placeholder={`วางข้อสอบของคุณที่นี่ เช่น:

1. ข้อใดถูกต้องเกี่ยวกับ DNS?
A. แปลงชื่อโดเมนเป็น IP Address
B. ส่งอีเมล
C. ใช้โอนย้ายไฟล์
D. ตรวจจับไวรัส
เฉลย: A
คำอธิบาย: DNS (Domain Name System) ทำหน้าที่แปลงชื่อเว็บให้เป็นตัวเลข IP`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            💡 **คำแนะนำในการพิมพ์/วางข้อความ:**<br/>
            - ขึ้นต้นแต่ละข้อด้วยตัวเลข เช่น `1.` หรือ `Q1.` หรือ `ข้อ 1.` เพื่อสร้างข้อใหม่<br/>
            - ช้อยส์ตัวเลือกให้ขึ้นต้นด้วยตัวอักษร เช่น `A.` `B.` หรือ `ก.` `ข.` แยกบรรทัดกัน<br/>
            - เขียนคำตอบข้อที่ถูกด้วย `เฉลย: A` หรือ `Answer: B`<br/>
            - เขียนคำอธิบายเฉลยด้วย `คำอธิบาย:` หรือ `Explanation:` เพื่ออธิบายเหตุผล
          </div>
        </div>

        {/* Right Side: Parsing Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
          <label>ตัวอย่างผลลัพธ์การแปลง ({parsedQuestions.length} ข้อ)</label>
          {parsedQuestions.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '80px 20px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)' }}>
              กรุณาป้อนข้อความข้อสอบทางฝั่งซ้าย เพื่อพรีวิวโครงสร้างข้อสอบอัตโนมัติ
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {parsedQuestions.map((q, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '14px', marginBottom: '5px' }}>
                    ข้อที่ {idx + 1}: {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '10px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx} 
                        style={{ 
                          fontSize: '13px', 
                          color: q.correctAnswer === oIdx ? 'var(--color-success)' : 'var(--text-muted)',
                          fontWeight: q.correctAnswer === oIdx ? '600' : 'normal'
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {q.correctAnswer === oIdx && '✓ (เฉลย)'}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px dashed var(--color-primary)', paddingLeft: '8px', marginTop: '8px' }}>
                      <strong>คำอธิบาย:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '15px 0' }} />

      {/* Footer controls */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-primary" onClick={handleImportClick} disabled={parsedQuestions.length === 0}>
          📥 นำเข้าข้อสอบเข้าระบบ
        </button>
      </div>
    </div>
  );
}
