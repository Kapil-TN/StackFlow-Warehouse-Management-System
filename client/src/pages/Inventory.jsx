import { useState, useEffect } from 'react';
import { inventoryAPI, warehouseAPI } from '../api';
import { Spinner, Badge, SkuTag, Input } from '../components/ui';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Status badge helper ──────────────────────────────────────────────── */
const statusBadge = (qty) => {
  if (qty === 0) return <Badge variant="danger">Out of Stock</Badge>;
  if (qty <= 20) return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
};

/* ─── Inventory ─────────────────────────────────────────────────────────── */
const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'bin'

  useEffect(() => { fetchData(); }, [selectedWarehouse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWarehouse) params.warehouseId = selectedWarehouse;
      const [invRes, whRes] = await Promise.all([
        inventoryAPI.getAll(params),
        warehouseAPI.getAll(),
      ]);
      setInventory(invRes.data);
      setWarehouses(whRes.data);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filtered = inventory.filter(item => {
    const s = search.toLowerCase();
    const name = item.product?.name?.toLowerCase() || '';
    const sku  = item.product?.sku?.toLowerCase()  || '';
    const bin  = item.bin?.code?.toLowerCase()      || '';
    const textMatch = !search || name.includes(s) || sku.includes(s) || bin.includes(s);

    let statusMatch = true;
    if (statusFilter === 'in') statusMatch = item.quantity > 20;
    if (statusFilter === 'low') statusMatch = item.quantity > 0 && item.quantity <= 20;
    if (statusFilter === 'out') statusMatch = item.quantity === 0;

    return textMatch && statusMatch;
  });

  const totalUnits = inventory.reduce((a, b) => a + (b.quantity || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
            Inventory
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {inventory.length} SKUs · {totalUnits.toLocaleString()} units total
          </p>
        </div>

        {/* List / Bin Map toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {['list', 'bin'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: view === v ? 'var(--bg-card-hover)' : 'transparent',
                color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'inherit',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {v === 'list' ? 'List' : 'Bin Map'}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '14px',
      }}>
        {/* Search */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            placeholder="Search products or SKUs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '8px 10px 8px 32px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Category dropdown */}
        <select
          value={selectedWarehouse}
          onChange={e => setSelectedWarehouse(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            padding: '8px 28px 8px 12px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a5a6a'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          <option value="">All categories</option>
          {warehouses.map(wh => (
            <option key={wh._id} value={wh._id}>{wh.name}</option>
          ))}
        </select>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            padding: '8px 28px 8px 12px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a5a6a'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          <option value="">All statuses</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
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
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No inventory items match your filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Product', 'SKU', 'On Hand', 'Reserved', 'Bin', 'Status'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    textAlign: i >= 2 && i <= 4 ? 'center' : 'left',
                    fontSize: '10px',
                    fontWeight: 600,
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
              {filtered.map((item, i) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.product?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <SkuTag>{item.product?.sku || 'N/A'}</SkuTag>
                  </td>
                  <td className="font-mono" style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {item.quantity}
                  </td>
                  <td className="font-mono" style={{ padding: '13px 16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.reserved || 0}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                    <span className="font-mono" style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {item.bin?.code || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {statusBadge(item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
