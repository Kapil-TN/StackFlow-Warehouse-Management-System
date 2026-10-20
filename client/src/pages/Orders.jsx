import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Spinner, Badge } from '../components/ui';
import Modal from '../components/Modal';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Priority badge ──────────────────────────────────────────────────── */
const PriorityBadge = ({ priority }) => {
  const map = {
    urgent: { label: 'Urgent', bg: 'var(--badge-danger-bg)',  color: 'var(--badge-danger-text)', border: '1px solid var(--badge-danger-border)' },
    normal: { label: 'Normal', bg: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',   border: '1px solid var(--badge-info-border)' },
    low:    { label: 'Low',    bg: 'var(--muted)',            color: 'var(--muted-foreground)',  border: '1px solid var(--border)' },
  };
  const s = map[priority] || map.normal;
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
      background: s.bg, color: s.color, border: s.border,
    }}>
      {s.label}
    </span>
  );
};

/* ─── SKU chip ────────────────────────────────────────────────────────── */
const SkuChip = ({ sku }) => (
  <span
    className="font-mono"
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10.5px',
      padding: '3px 7px',
      borderRadius: '4px',
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)',
      fontWeight: 500,
    }}
  >
    {sku}
  </span>
);

/* ─── Order card ──────────────────────────────────────────────────────── */
const OrderCard = ({ order, onStartPick, onPickItems, onDispatch }) => {
  const totalItems = order.items?.length || 0;
  const pickedItems = order.items?.filter(i => i.picked)?.length || 0;
  const pct = totalItems > 0 ? Math.round((pickedItems / totalItems) * 100) : 0;

  const priority = order.priority || (order.status === 'pending' ? 'urgent' : 'normal');

  const dueDate = order.dueDate
    ? new Date(order.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : new Date(new Date(order.createdAt).getTime() + 86400000 * 2).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const skus = order.items?.map(i => i.product?.sku).filter(Boolean).slice(0, 3) || [];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '18px 20px',
      marginBottom: '12px',
      transition: 'border-color 0.15s, background-color 0.15s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {order.orderNumber}
          </span>
          <PriorityBadge priority={priority} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--badge-danger-text)', fontWeight: 500 }}>
          Due {dueDate}
        </span>
      </div>

      {/* Customer + item count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {order.customerName}
        </span>
        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '70px' }}>
          {pickedItems}/{totalItems} picked
        </span>
        <div style={{
          flex: 1, height: 4, background: 'var(--bg-base)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: pct === 100 ? 'var(--badge-success-solid)' : 'var(--accent)',
            borderRadius: '2px',
            transition: 'width 0.3s',
          }} />
        </div>
        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
          {pct}%
        </span>
      </div>

      {/* SKU chips + action button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {skus.map(s => <SkuChip key={s} sku={s} />)}
        </div>

        <div>
          {order.status === 'pending' && (
            <button
              onClick={() => onStartPick(order._id)}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Start Pick →
            </button>
          )}
          {order.status === 'picking' && (
            <button
              onClick={() => onPickItems(order)}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                background: 'var(--badge-success-solid)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Pick Items →
            </button>
          )}
          {order.status === 'picked' && (
            <button
              onClick={() => onDispatch(order._id)}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Dispatch →
            </button>
          )}
          {order.status === 'dispatched' && (
            <span style={{ fontSize: '12px', color: 'var(--badge-success-text)', fontWeight: 500 }}>✓ Complete</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Orders / Picking page ─────────────────────────────────────────────── */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [createData, setCreateData] = useState({ customerName: '', items: [{ product: '', quantity: 1 }] });
  const [submitting, setSubmitting] = useState(false);

  const [isPickOpen, setIsPickOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [pickSelections, setPickSelections] = useState({});

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await orderAPI.getAll(params);
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const prodRes = await productAPI.getAll();
      setProducts(prodRes.data);
      setCreateData({ customerName: '', items: [{ product: '', quantity: 1 }] });
      setIsCreateOpen(true);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const handleItemChange = (i, field, val) => {
    const items = [...createData.items];
    items[i][field] = val;
    setCreateData({ ...createData, items });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createData.customerName.trim()) return toast.error('Customer name is required');
    for (const i of createData.items) {
      if (!i.product) return toast.error('Select a product for each item');
    }
    try {
      setSubmitting(true);
      await orderAPI.create(createData);
      toast.success('Order created!');
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartPicking = async (orderId) => {
    try {
      await orderAPI.startPicking(orderId);
      toast.success('Picking started');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openPickModal = async (order) => {
    try {
      setActiveOrder(order);
      const res = await orderAPI.getInventoryAvailability(order._id);
      setAvailability(res.data);
      const init = {};
      res.data.forEach((item, idx) => {
        if (item.bins?.length > 0) {
          init[idx] = { bin: item.bins[0].bin._id, quantity: item.requiredQuantity };
        }
      });
      setPickSelections(init);
      setIsPickOpen(true);
    } catch {
      toast.error('Failed to load availability');
    }
  };

  const handleConfirmPick = async () => {
    try {
      const pickedItems = Object.keys(pickSelections).map(idx => ({
        orderItemIndex: parseInt(idx),
        pickedFrom: [{ bin: pickSelections[idx].bin, quantity: pickSelections[idx].quantity }],
      }));
      setSubmitting(true);
      await orderAPI.confirmPick(activeOrder._id, { pickedItems });
      toast.success('Picking confirmed!');
      setIsPickOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (orderId) => {
    try {
      await orderAPI.dispatch(orderId);
      toast.success('Order dispatched!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const awaitingPick = orders.filter(o => ['pending', 'picking'].includes(o.status));
  const displayOrders = statusFilter ? orders : awaitingPick;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
            Picking
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {awaitingPick.length} {awaitingPick.length === 1 ? 'order' : 'orders'} awaiting pick
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            padding: '8px 16px',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + New Order
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '20px',
        paddingBottom: '0',
      }}>
        {[
          { value: '', label: 'Awaiting Pick' },
          { value: 'picked', label: 'Picked' },
          { value: 'dispatched', label: 'Dispatched' },
          { value: 'all', label: 'All Orders' },
        ].map(tab => {
          const isActive = statusFilter === tab.value || (tab.value === '' && statusFilter === '');
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value === 'all' ? 'dispatched' : tab.value)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      {loading ? (
        <Spinner />
      ) : displayOrders.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
        }}>
          No orders to display.
        </div>
      ) : (
        displayOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onStartPick={handleStartPicking}
            onPickItems={openPickModal}
            onDispatch={handleDispatch}
          />
        ))
      )}

      {/* Create Order Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Order" size="lg">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Customer Name *
            </label>
            <input
              required
              placeholder="e.g. Retail Store Corp"
              value={createData.customerName}
              onChange={e => setCreateData({ ...createData, customerName: e.target.value })}
              style={{
                width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '8px 10px', fontSize: '13px', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Order Items</span>
              <button
                type="button"
                onClick={() => setCreateData({ ...createData, items: [...createData.items, { product: '', quantity: 1 }] })}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                  padding: '4px 10px', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Add Item
              </button>
            </div>

            {createData.items.map((item, idx) => (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px',
                alignItems: 'center', marginBottom: '8px',
                background: 'var(--bg-base)', padding: '10px 12px', borderRadius: '7px',
                border: '1px solid var(--border)',
              }}>
                <select
                  value={item.product}
                  onChange={e => handleItemChange(idx, 'product', e.target.value)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '7px 10px', fontSize: '13px',
                    color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <option value="">— Select Product —</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                  style={{
                    width: '64px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '7px 10px', fontSize: '13px',
                    color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', textAlign: 'center',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (createData.items.length === 1) return;
                    setCreateData({ ...createData, items: createData.items.filter((_, i) => i !== idx) });
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#ef4444',
                    cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              style={{
                padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 20px', borderRadius: '7px', fontSize: '13px',
                fontWeight: 500, border: 'none', background: 'var(--accent)',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creating…' : 'Submit Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pick Confirmation Modal */}
      <Modal isOpen={isPickOpen} onClose={() => setIsPickOpen(false)} title={`Pick: ${activeOrder?.orderNumber}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Select bin locations to pick from:
          </p>

          {availability.map((itemAvail, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px' }}>{itemAvail.product?.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', margin: 0 }}>SKU: {itemAvail.product?.sku}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Req: {itemAvail.requiredQuantity}
                </span>
              </div>
              {!itemAvail.sufficient ? (
                <div style={{
                  padding: '8px 12px', background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
                  fontSize: '12px', color: '#ef4444',
                }}>
                  Insufficient stock (available: {itemAvail.totalAvailable})
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pick from bin:</label>
                  <select
                    value={pickSelections[idx]?.bin || ''}
                    onChange={e => setPickSelections({ ...pickSelections, [idx]: { bin: e.target.value, quantity: itemAvail.requiredQuantity } })}
                    style={{
                      width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '6px', padding: '7px 10px', fontSize: '13px',
                      color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    {itemAvail.bins?.map(b => (
                      <option key={b._id} value={b.bin._id}>
                        Bin {b.bin.code} — {b.quantity} available
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <button
              onClick={() => setIsPickOpen(false)}
              style={{
                padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPick}
              disabled={submitting}
              style={{
                padding: '8px 20px', borderRadius: '7px', fontSize: '13px',
                fontWeight: 500, border: 'none', background: '#22c55e',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Confirming…' : 'Confirm & Deduct Stock'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
