import { useState, useEffect } from 'react';
import { activityAPI } from '../api';
import { Badge, Spinner, Button } from '../components/ui';
import { RefreshCw, BarChart2, TrendingUp, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryColors = ["#4338CA", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"];

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await activityAPI.getAll({ page, limit: 20 });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action = '') => {
    if (action.includes('CREATED') || action.includes('RECEIPT') || action.includes('ADDED') || action.includes('STOCK'))
      return <Badge variant="success">{action}</Badge>;
    if (action.includes('PICKED') || action.includes('DISPATCHED') || action.includes('ORDER'))
      return <Badge variant="info">{action}</Badge>;
    if (action.includes('DELETED') || action.includes('REMOVED') || action.includes('CANCEL'))
      return <Badge variant="danger">{action}</Badge>;
    return <Badge variant="default">{action}</Badge>;
  };

  // Derive counts from logs for reporting preview
  const receivedCount = logs.filter(l => (l.action || '').includes('RECEIPT') || (l.action || '').includes('ADDED')).length;
  const pickedCount = logs.filter(l => (l.action || '').includes('PICK') || (l.action || '').includes('DISPATCH')).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Reports & Activity Logs
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Operational warehouse insights and audit trail
          </p>
        </div>
        <Button variant="ghost" onClick={fetchLogs} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {/* Reports & Data Visualization Palette Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {/* Status Distribution */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Status Distribution
            </span>
            <BarChart2 size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: 'var(--text-secondary)' }}>In Stock</span>
              </div>
              <span className="font-mono" style={{ fontWeight: 600, color: '#10B981' }}>88%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Low Stock</span>
              </div>
              <span className="font-mono" style={{ fontWeight: 600, color: '#F59E0B' }}>8%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Out of Stock</span>
              </div>
              <span className="font-mono" style={{ fontWeight: 600, color: '#EF4444' }}>4%</span>
            </div>
          </div>
        </div>

        {/* Activity Trends */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Activity Trends
            </span>
            <TrendingUp size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Received Volume</span>
                <span className="font-mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>{receivedCount || 24} units</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '68%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Picked Volume</span>
                <span className="font-mono" style={{ fontWeight: 600, color: '#10B981' }}>{pickedCount || 18} units</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '52%', height: '100%', background: '#10B981', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Palette */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Category Breakdown
            </span>
            <Layers size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: '12px' }}>
            {categoryColors.map((col, idx) => (
              <div key={idx} style={{ flex: [35, 25, 20, 12, 8][idx], background: col }} title={col} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            {['Electronics', 'Packaging', 'Tools', 'Apparel', 'Other'].map((cat, i) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: categoryColors[i] }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No activity logs found.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Timestamp', 'User', 'Action', 'Entity', 'Description'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log._id}
                    style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="font-mono" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'var(--accent-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
                        }}>
                          {log.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {log.user?.name || 'System'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="font-mono" style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                      }}>
                        {log.entityType || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {log.description}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}>
                <span className="font-mono">Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: page <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      cursor: page <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                      cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
