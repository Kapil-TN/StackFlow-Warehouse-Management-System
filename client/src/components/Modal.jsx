const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const maxWidth = {
    sm: '420px',
    md: '520px',
    lg: '680px',
    xl: '860px',
  }[size] || '520px';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              padding: '2px 6px',
              borderRadius: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
