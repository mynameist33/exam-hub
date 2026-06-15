import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passcode) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }
    
    const isCorrect = onLogin(passcode);
    if (!isCorrect) {
      setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPasscode('');
    }
  };

  return (
    <div className="flex-center animate-fade" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%)'
    }}>
      <div className="glass-panel" style={{ 
        padding: '40px 30px', 
        maxWidth: '400px', 
        width: '100%', 
        borderRadius: '20px', 
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Animated Lock Icon */}
        <div style={{ 
          width: '70px', 
          height: '70px', 
          background: 'rgba(99, 102, 241, 0.15)', 
          borderRadius: '50%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          margin: '0 auto 20px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-main)' }}>ความปลอดภัยส่วนบุคคล</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '25px' }}>
          กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน ExamHub
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="รหัสเข้าใช้งาน"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: error ? '1px solid var(--color-danger)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '0.1em',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ 
              color: '#fca5a5', 
              fontSize: '12.5px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              padding: '14px', 
              fontSize: '15px', 
              fontWeight: '600', 
              borderRadius: '10px',
              cursor: 'pointer',
              marginTop: '10px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            🔓 เข้าใช้งานระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
