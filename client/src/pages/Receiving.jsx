import { useState, useEffect } from 'react';
import { receiptAPI, productAPI, binAPI } from '../api';
import { Spinner, Badge, Button } from '../components/ui';
import { CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Step indicator ─────────────────────────────────────────────────────── */
const StepBar = ({ step }) => {
  const steps = [
    { n: 1, label: 'Receipt Details' },
    { n: 2, label: 'Add Items' },
    { n: 3, label: 'Confirm' },
    { n: 4, label: 'Complete' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '28px' }}>
      {steps.map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;

        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: done || active ? 'none' : '1px solid var(--border)',
                background: done
                  ? 'var(--accent)'
                  : active
                    ? 'transparent'
                    : 'transparent',
                borderColor: active ? 'var(--accent)' : done ? 'transparent' : 'var(--border)',
                borderStyle: 'solid',
                borderWidth: '1px',
                fontSize: '13px',
                fontWeight: 600,
                color: done ? '#fff' : active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircle2 size={18} /> : s.n}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: active || done ? 500 : 400,
                color: active ? 'var(--accent)' : done ? 'var(--accent)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                background: done ? 'var(--accent)' : 'var(--border)',
                margin: '0 4px',
                marginBottom: '20px',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Form input styles ────────────────────────────────────────────────── */
const FieldInput = ({ label, optional, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
      {label} {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>}
    </label>
    <input
      style={{
        width: '100%',
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        padding: '9px 12px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  </div>
);

const FieldSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      <select
        style={{
          width: '100%',
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: '9px 32px 9px 12px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          outline: 'none',
          appearance: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props}
      >
        {children}
      </select>
      <span style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '10px',
      }}>▼</span>
    </div>
  </div>
);

const FieldTextarea = ({ label, optional, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
      {label} {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>}
    </label>
    <textarea
      rows={3}
      style={{
        width: '100%',
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        padding: '9px 12px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  </div>
);

/* ─── NavButton ─────────────────────────────────────────────────────────── */
const NavButton = ({ label, primary, disabled, onClick, type = 'button' }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: '9px 20px',
      borderRadius: '7px',
      fontSize: '13px',
      fontWeight: 500,
      fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background 0.15s',
      border: primary ? 'none' : '1px solid var(--border)',
      background: primary ? 'var(--accent)' : 'transparent',
      color: primary ? '#fff' : 'var(--text-secondary)',
    }}
  >
    {label}
  </button>
);

/* ─── Receiving page ────────────────────────────────────────────────────── */
const Receiving = () => {
  const [step, setStep] = useState(1);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const [products, setProducts] = useState([]);
  const [bins, setBins]         = useState([]);

  const [formData, setFormData] = useState({
    supplierName: '',
    deliveryReference: '',
    deliveryDate: new Date().toISOString().slice(0, 10),
    notes: '',
    items: [{ product: '', bin: '', quantity: 1, unitCost: 0 }],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReceipts(); }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await receiptAPI.getAll();
      setReceipts(res.data);
    } catch {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const openWizard = async () => {
    try {
      const [prodRes, binRes] = await Promise.all([productAPI.getAll(), binAPI.getAll()]);
      setProducts(prodRes.data);
      setBins(binRes.data);
      setFormData({
        supplierName: '',
        deliveryReference: `DEL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-001`,
        deliveryDate: new Date().toISOString().slice(0, 10),
        notes: '',
        items: [{ product: '', bin: '', quantity: 1, unitCost: 0 }],
      });
      setStep(1);
      setShowWizard(true);
    } catch {
      toast.error('Failed to load form data');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'product' && value) {
      const p = products.find(pr => pr._id === value);
      if (p?.unitCost !== undefined) newItems[index].unitCost = p.unitCost;
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product: '', bin: '', quantity: 1, unitCost: 0 }] });
  };

  const removeItem = (i) => {
    if (formData.items.length === 1) { toast.error('At least one item required'); return; }
    setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) });
  };

  const goNext = () => {
    if (step === 1) {
      if (!formData.supplierName.trim()) return toast.error('Supplier is required');
    }
    if (step === 2) {
      for (const item of formData.items) {
        if (!item.product) return toast.error('Select a product for each item');
        if (!item.bin)     return toast.error('Select a bin for each item');
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await receiptAPI.create(formData);
      toast.success('Stock received and inventory updated!');
      setStep(4);
      fetchReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create receipt');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Wizard panel ─────────────────────────────────────────────────────── */
  const WizardPanel = () => (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '28px 32px',
      marginBottom: '24px',
    }}>
      <StepBar step={step} />

      {/* Step 1 */}
      {step === 1 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Receipt Details
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
            Enter the delivery information before adding items.
          </p>

          <FieldSelect label="Supplier" value={formData.supplierName} onChange={e => setFormData({ ...formData, supplierName: e.target.value })}>
            <option value="">Select a supplier...</option>
            <option value="Acme Logistics">Acme Logistics</option>
            <option value="Swift Retail Group">Swift Retail Group</option>
            <option value="PackPro Supplies">PackPro Supplies</option>
            <option value="Other">Other</option>
          </FieldSelect>

          <FieldInput
            label="Delivery Reference"
            placeholder="e.g. DEL-20260903-001"
            value={formData.deliveryReference}
            onChange={e => setFormData({ ...formData, deliveryReference: e.target.value })}
          />

          <FieldInput
            label="Delivery Date"
            type="date"
            value={formData.deliveryDate}
            onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
          />

          <FieldTextarea
            label="Notes"
            optional
            placeholder="Any delivery notes..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <NavButton label="Continue to Items →" primary onClick={goNext} />
          </div>
        </>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Add Items
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {formData.items.length} {formData.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Add each product included in this delivery.
          </p>

          {formData.items.map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Item {i + 1}
                </span>
                <button
                  onClick={() => removeItem(i)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
                  }}
                >
                  Remove
                </button>
              </div>

              {/* Product Name select */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Product Name
                </label>
                <select
                  value={item.product}
                  onChange={e => handleItemChange(i, 'product', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: item.product ? 'var(--text-primary)' : 'var(--text-muted)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">e.g. AA Batteries (Pack of 20)</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>SKU</label>
                  <input
                    readOnly
                    value={item.product ? (products.find(p => p._id === item.product)?.sku || '') : ''}
                    placeholder="ELC-001"
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      outline: 'none',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'default',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleItemChange(i, 'quantity', parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Bin Location</label>
                  <select
                    value={item.bin}
                    onChange={e => handleItemChange(i, 'bin', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: item.bin ? 'var(--text-primary)' : 'var(--text-muted)',
                      outline: 'none',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">A-01</option>
                    {bins.map(b => (
                      <option key={b._id} value={b._id}>{b.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Unit Cost (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitCost}
                    onChange={e => handleItemChange(i, 'unitCost', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 0',
              fontFamily: 'inherit',
              display: 'block',
              margin: '4px auto 0',
            }}
          >
            + Add Item
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <NavButton label="← Back" onClick={() => setStep(1)} />
            <NavButton label="Review Order →" primary onClick={goNext} />
          </div>
        </>
      )}

      {/* Step 3 – Confirm */}
      {step === 3 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Confirm Receipt
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
            Review the details before posting to inventory.
          </p>

          <div style={{ marginBottom: '16px' }}>
            {[
              { l: 'Supplier', v: formData.supplierName },
              { l: 'Reference', v: formData.deliveryReference },
              { l: 'Delivery Date', v: formData.deliveryDate },
              { l: 'Notes', v: formData.notes || '—' },
            ].map(r => (
              <div key={r.l} style={{
                display: 'flex',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <span style={{ width: '140px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{r.l}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{r.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Items ({formData.items.length})
            </p>
            {formData.items.map((item, i) => {
              const prod = products.find(p => p._id === item.product);
              const b = bins.find(b => b._id === item.bin);
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < formData.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{prod?.name || 'Unknown'}</span>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong></span>
                    <span>Bin: <strong style={{ color: 'var(--text-primary)' }}>{b?.code || '—'}</strong></span>
                    <span>£{item.unitCost}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <NavButton label="← Back" onClick={() => setStep(2)} />
            <button
              disabled={submitting}
              onClick={handleSubmit}
              style={{
                padding: '9px 24px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'inherit',
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Posting…' : 'Post to Inventory →'}
            </button>
          </div>
        </>
      )}

      {/* Step 4 – Complete */}
      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle2 size={28} style={{ color: 'var(--badge-success-solid)' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Stock Received!
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
            The delivery has been posted to inventory.
          </p>
          <button
            onClick={() => { setShowWizard(false); setStep(1); }}
            style={{
              padding: '9px 24px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'inherit',
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Receive Stock
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Record an <em style={{ fontStyle: 'normal', color: 'var(--text-secondary)' }}>incoming delivery</em> and post items to inventory.
          </p>
        </div>
        {!showWizard && (
          <button
            onClick={openWizard}
            style={{
              padding: '8px 18px',
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
            + New Receipt
          </button>
        )}
      </div>

      {/* Wizard */}
      {showWizard && <WizardPanel />}

      {/* Past receipts table */}
      {!showWizard && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {loading ? (
            <Spinner />
          ) : receipts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No receipts yet. Click "+ New Receipt" to get started.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Receipt #', 'Supplier', 'Reference', 'Date', 'Received By', 'Items', 'Status'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: i >= 5 ? 'center' : 'left',
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
                {receipts.map((r, i) => (
                  <tr
                    key={r._id}
                    style={{ borderBottom: i < receipts.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="font-mono" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                      {r.receiptNumber}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.supplierName}</td>
                    <td className="font-mono" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{r.deliveryReference}</td>
                    <td className="font-mono" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{new Date(r.deliveryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.receivedBy?.name || 'System'}</td>
                    <td className="font-mono" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{r.items?.length || 0}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Badge variant="success">Completed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Receiving;
