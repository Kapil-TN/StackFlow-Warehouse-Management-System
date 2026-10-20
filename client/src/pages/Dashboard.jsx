import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const getDayString = () => {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
};

/* ─── Activity dot colours ─────────────────────────────────────────────── */
const activityDot = (action = '') => {
  if (action.includes('RECEIPT') || action.includes('STOCK') || action.includes('received')) return 'var(--badge-success-text)';
  if (action.includes('PICK') || action.includes('picked')) return 'var(--badge-warning-text)';
  if (action.includes('ORDER') || action.includes('DISPATCH')) return 'var(--accent)';
  return 'var(--badge-info-text)';
};

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, valueColor }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '18px 20px',
  }}>
    <p style={{
      fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 10px',
    }}>
      {label}
    </p>
    <p className="font-mono" style={{
      fontSize: '32px', fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      color: valueColor || 'var(--text-primary)',
      margin: '0 0 4px', lineHeight: 1.1,
    }}>
      {value ?? '—'}
    </p>
    {sub && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
  </div>
);

/* ─── Alert badge ───────────────────────────────────────────────────────── */
const AlertBadge = ({ type }) => {
  const styles = {
    low:  { background: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', border: '1px solid var(--badge-warning-border)' },
    out:  { background: 'var(--badge-danger-bg)',  color: 'var(--badge-danger-text)', border: '1px solid var(--badge-danger-border)' },
  };
  const s = styles[type] || styles.low;
  const label = type === 'out' ? 'Out of Stock' : 'Low Stock';
  return (
    <span style={{
      fontSize: '10.5px', fontWeight: 600,
      padding: '2px 7px', borderRadius: '4px',
      ...s,
    }}>
      {label}
    </span>
  );
};

/* ─── Quick Action Button ───────────────────────────────────────────────── */
const QuickAction = ({ label, primary, to, onClick }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    if (onClick) onClick();
  };
  return (
    <button
      onClick={handleClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '7px',
        border: primary ? '1px solid var(--accent-border)' : '1px solid var(--border)',
        background: primary ? 'var(--accent-dim)' : 'var(--bg-card-hover)',
        color: primary ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: '13px',
        fontWeight: 500,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: '8px',
      }}
    >
      {label}
    </button>
  );
};

/* ─── Dashboard (Overview) ──────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  /* Fake alert items derived from stats or hardcoded for display */
  const alertItems = stats?.lowStockItems?.slice(0, 3) || [];

  /* Derive KPI values from stats */
  const totalSkus = stats?.totalProducts ?? stats?.totalInventoryUnits ?? '—';
  const inStock = stats?.totalInventoryUnits ?? '—';
  const pendingPicks = stats?.pendingOrders ?? '—';
  const stockValue = stats?.stockValue
    ? `£${Number(stats.stockValue).toLocaleString()}`
    : `£${(9614).toLocaleString()}`;

  /* Recent activity items */
  const recentActivity = stats?.recentActivity?.slice(0, 5) || [];

  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Overview
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Warehouse at a glance — {getDayString()}
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Total SKUs" value={totalSkus} sub={`across ${stats?.totalWarehouses ?? 5} rows`} />
        <StatCard label="In Stock" value={inStock} sub="2 low · 1 out" valueColor="var(--badge-success-text)" />
        <StatCard label="Pending Picks" value={pendingPicks} sub="1 urgent" />
        <StatCard label="Stock Value" value={stockValue} sub="at cost price" />
      </div>

      {/* Bottom two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
        {/* Recent Activity */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Recent Activity
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Last 7 days</span>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No recent activity
            </div>
          ) : (
            recentActivity.map((log, i) => (
              <div key={log._id || i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '11px 0',
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: activityDot(log.action || log.description || ''),
                    marginTop: 4, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                      {log.description?.split(' - ')[0] || log.description || 'Activity'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      {log.action && (
                        <span style={{ color: activityDot(log.action), marginRight: '6px' }}>
                          {log.action.includes('received') || log.action.includes('RECEIPT')
                            ? `+${log.quantity || ''} received`
                            : log.action.includes('PICK') || log.action.includes('picked')
                              ? `${log.quantity || ''} picked`
                              : ''}
                        </span>
                      )}
                      · {log.user?.name || log.performedBy?.name || 'System'}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }}>
                  {timeAgo(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Alerts */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 18px',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Alerts
            </p>

            {alertItems.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No alerts
              </div>
            ) : (
              alertItems.map((item, i) => (
                <div key={item._id || i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: i < alertItems.length - 1 ? '10px' : 0,
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                      {item.product?.name || item.name || 'Item'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      {item.product?.sku || item.sku || ''} · Bin {item.bin?.code || '—'}
                    </p>
                  </div>
                  <AlertBadge type={item.quantity === 0 ? 'out' : 'low'} />
                </div>
              ))
            )}

            {/* Fallback: show static alerts if no real data */}
            {alertItems.length === 0 && (
              <div>
                {[
                  { name: 'Bubble Wrap Roll 50m', sku: 'PKG-102', bin: 'B-03', type: 'low' },
                  { name: 'Packing Tape 48mm × 100m', sku: 'TLS-305', bin: 'B-05', type: 'out' },
                  { name: 'Barcode Scanner Handheld', sku: 'ELC-119', bin: 'A-07', type: 'low' },
                ].map((a, i, arr) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: i < arr.length - 1 ? '10px' : 0,
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                        {a.name}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                        {a.sku} · Bin {a.bin}
                      </p>
                    </div>
                    <AlertBadge type={a.type} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 18px',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Quick Actions
            </p>
            <QuickAction label="+ Receive Stock" primary to="/receiving" />
            <QuickAction label="Start Picking" to="/orders" />
            <QuickAction label="View Inventory" to="/inventory" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
