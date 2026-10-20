/* ─── Shared UI Component Styles ─────────────────────────────────────────── */

/* PageHeader */
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* Card */
export const Card = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.15s ease, background-color 0.15s ease',
      ...style,
    }}
  >
    {children}
  </div>
);

/* StatCard - matches the "Total SKUs / In Stock / Pending Picks / Stock Value" cards */
export const StatCard = ({ label, value, sub, valueColor }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '18px 20px',
  }}>
    <p style={{
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--text-muted)',
      margin: '0 0 8px'
    }}>
      {label}
    </p>
    <p className="font-mono" style={{
      fontSize: '30px',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      color: valueColor || 'var(--text-primary)',
      margin: '0 0 4px',
      lineHeight: 1.1
    }}>
      {value ?? '—'}
    </p>
    {sub && (
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{sub}</p>
    )}
  </div>
);

/* Badge */
export const Badge = ({ children, variant = 'default', style: extraStyle = {} }) => {
  const variants = {
    default:   { background: 'var(--muted)',            color: 'var(--muted-foreground)',  border: '1px solid var(--border)' },
    success:   { background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)', border: '1px solid var(--badge-success-border)' },
    warning:   { background: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', border: '1px solid var(--badge-warning-border)' },
    danger:    { background: 'var(--badge-danger-bg)',  color: 'var(--badge-danger-text)',  border: '1px solid var(--badge-danger-border)' },
    info:      { background: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    border: '1px solid var(--badge-info-border)' },
    purple:    { background: 'var(--accent-dim)',       color: 'var(--accent)',            border: '1px solid var(--accent-border)' },
    accent:    { background: 'var(--accent-dim)',       color: 'var(--accent)',            border: '1px solid var(--accent-border)' },
  };
  const s = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      ...s,
      ...extraStyle,
    }}>
      {children}
    </span>
  );
};

/* OrderStatusBadge */
export const OrderStatusBadge = ({ status }) => {
  const map = {
    pending:    { label: 'Pending',    variant: 'warning' },
    picking:    { label: 'Picking',    variant: 'info' },
    picked:     { label: 'Picked',     variant: 'purple' },
    dispatched: { label: 'Dispatched', variant: 'success' },
  };
  const cfg = map[status] || { label: status, variant: 'default' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

/* Spinner */
export const Spinner = ({ size = 'md' }) => {
  const dim = { sm: 16, md: 28, lg: 44 }[size];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: dim,
        height: dim,
        border: '2px solid var(--border)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
};

/* EmptyState */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    textAlign: 'center',
  }}>
    {Icon && <Icon size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />}
    <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 6px' }}>{title}</p>
    {description && <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px' }}>{description}</p>}
    {action && action}
  </div>
);

/* Button */
export const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, style: extraStyle = {}, icon: Icon, loading
}) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 500,
    borderRadius: '7px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'background 0.15s, opacity 0.15s',
    fontFamily: 'inherit',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px',
    padding: size === 'sm' ? '5px 12px' : size === 'lg' ? '10px 22px' : '7px 16px',
  };
  const variants = {
    primary:   { background: 'var(--accent)', color: 'var(--accent-foreground)' },
    secondary: { background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '1px solid var(--border)' },
    danger:    { background: 'var(--badge-danger-solid)', color: '#fff' },
    success:   { background: 'var(--badge-success-solid)', color: '#fff' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    outline:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    warning:   { background: '#f59e0b', color: '#fff' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...extraStyle }}
    >
      {loading ? (
        <span style={{
          width: 12, height: 12,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 13 : 15} />
      ) : null}
      {children}
    </button>
  );
};

/* Input */
export const Input = ({ label, error, icon: Icon, style: extraStyle = {}, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    {label && (
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {Icon && (
        <span style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex',
        }}>
          <Icon size={14} />
        </span>
      )}
      <input
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--badge-danger-solid)' : 'var(--border)'}`,
          borderRadius: '7px',
          padding: Icon ? '8px 10px 8px 32px' : '8px 10px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.15s',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          ...extraStyle,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--ring)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--badge-danger-solid)' : 'var(--border)'}
        {...props}
      />
    </div>
    {error && <p style={{ fontSize: '11px', color: 'var(--badge-danger-text)', margin: 0 }}>{error}</p>}
  </div>
);

/* Select */
export const Select = ({ label, error, children, style: extraStyle = {}, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    {label && (
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
    )}
    <select
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: `1px solid ${error ? 'var(--badge-danger-solid)' : 'var(--border)'}`,
        borderRadius: '7px',
        padding: '8px 10px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        outline: 'none',
        appearance: 'none',
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        ...extraStyle,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--ring)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--badge-danger-solid)' : 'var(--border)'}
      {...props}
    >
      {children}
    </select>
    {error && <p style={{ fontSize: '11px', color: 'var(--badge-danger-text)', margin: 0 }}>{error}</p>}
  </div>
);

/* Textarea */
export const Textarea = ({ label, error, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    {label && (
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
    )}
    <textarea
      rows={3}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: `1px solid ${error ? 'var(--badge-danger-solid)' : 'var(--border)'}`,
        borderRadius: '7px',
        padding: '8px 10px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--ring)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--badge-danger-solid)' : 'var(--border)'}
      {...props}
    />
    {error && <p style={{ fontSize: '11px', color: 'var(--badge-danger-text)', margin: 0 }}>{error}</p>}
  </div>
);

/* Table Components */
export const Table = ({ children }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
      {children}
    </table>
  </div>
);

export const Th = ({ children, style: extraStyle = {} }) => (
  <th style={{
    padding: '11px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
    ...extraStyle,
  }}>
    {children}
  </th>
);

export const Td = ({ children, style: extraStyle = {} }) => (
  <td style={{
    padding: '13px 16px',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-light)',
    ...extraStyle,
  }}>
    {children}
  </td>
);

export const Tr = ({ children, style: extraStyle = {}, onClick }) => (
  <tr
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.12s',
      ...extraStyle,
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    {children}
  </tr>
);

/* SKU tag */
export const SkuTag = ({ children }) => (
  <span
    className="font-mono"
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '2px 7px',
      letterSpacing: '0.02em',
    }}
  >
    {children}
  </span>
);
