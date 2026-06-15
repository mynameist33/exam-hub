import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Reset state to try rendering children again
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    // Also try to navigate to home or reset state if needed
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(20, 10, 10, 0.4)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
            }}>
              ⚠️
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#fca5a5',
              marginBottom: '15px'
            }}>
              เกิดข้อผิดพลาดบางอย่างในแอปพลิเคชัน
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              ระบบตรวจพบข้อผิดพลาดขณะแสดงผลหน้าเว็บนี้ คุณสามารถลองโหลดหน้าเว็บใหม่อีกครั้ง หรือกลับไปเริ่มต้นใหม่ที่หน้าหลัก
            </p>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                🧹 ล้างข้อมูลประวัติและรีเซ็ตแอป
              </button>
              
              <button
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                🔄 โโหลดหน้าเว็บใหม่ (Reload)
              </button>
            </div>

            {this.state.error && (
              <div style={{ textAlign: 'left', marginTop: '20px' }}>
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: 0,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {this.state.showDetails ? '▼ ซ่อนข้อมูลรายละเอียดความผิดพลาด' : '▶ แสดงข้อมูลรายละเอียดความผิดพลาด (Technical Details)'}
                </button>
                
                {this.state.showDetails && (
                  <pre style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '12px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
