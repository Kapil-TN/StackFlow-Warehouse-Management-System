import { useState, useEffect } from 'react';
import { warehouseAPI, binAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Th, Td, Tr, Badge, Button, Input, Spinner, EmptyState } from '../components/ui';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Warehouse, Grid3x3, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Warehouses = () => {
  const { canManage, isAdmin } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('warehouses');
  const [expandedWH, setExpandedWH] = useState(null);

  // Warehouse modal
  const [whModal, setWhModal] = useState(false);
  const [editWH, setEditWH] = useState(null);
  const [whForm, setWhForm] = useState({ name: '', code: '', location: '' });

  // Bin modal
  const [binModal, setBinModal] = useState(false);
  const [editBin, setEditBin] = useState(null);
  const [binForm, setBinForm] = useState({ warehouse: '', code: '', capacity: '' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [wh, b] = await Promise.all([warehouseAPI.getAll(), binAPI.getAll()]);
      setWarehouses(wh.data);
      setBins(b.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Warehouse handlers
  const openAddWH = () => { setEditWH(null); setWhForm({ name: '', code: '', location: '' }); setWhModal(true); };
  const openEditWH = (w) => { setEditWH(w); setWhForm({ name: w.name, code: w.code, location: w.location }); setWhModal(true); };
  const saveWH = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editWH) { await warehouseAPI.update(editWH._id, whForm); toast.success('Warehouse updated'); }
      else { await warehouseAPI.create(whForm); toast.success('Warehouse created'); }
      setWhModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save warehouse'); }
    finally { setSaving(false); }
  };
  const deleteWH = async (id) => {
    if (!confirm('Delete this warehouse? This will fail if it has bins.')) return;
    try { await warehouseAPI.delete(id); toast.success('Warehouse deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  // Bin handlers
  const openAddBin = (warehouseId = '') => {
    setEditBin(null);
    setBinForm({ warehouse: warehouseId, code: '', capacity: '' });
    setBinModal(true);
  };
  const openEditBin = (b) => {
    setEditBin(b);
    setBinForm({ warehouse: b.warehouse?._id || b.warehouse, code: b.code, capacity: b.capacity });
    setBinModal(true);
  };
  const saveBin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editBin) { await binAPI.update(editBin._id, binForm); toast.success('Bin updated'); }
      else { await binAPI.create(binForm); toast.success('Bin created'); }
      setBinModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save bin'); }
    finally { setSaving(false); }
  };
  const deleteBin = async (id) => {
    if (!confirm('Delete this bin? This will fail if it has inventory.')) return;
    try { await binAPI.delete(id); toast.success('Bin deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const statusColor = { available: 'green', occupied: 'yellow', full: 'red' };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Warehouses & Bins"
        subtitle="Manage storage locations and bins"
        action={canManage() && (
          <div className="flex gap-2">
            <Button variant="secondary" icon={Grid3x3} onClick={() => { setActiveTab('bins'); openAddBin(); }} size="sm">Add Bin</Button>
            <Button icon={Plus} onClick={openAddWH} size="sm">Add Warehouse</Button>
          </div>
        )}
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '4px', width: 'fit-content',
      }}>
        {['warehouses', 'bins'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
              textTransform: 'capitalize', cursor: 'pointer', border: 'none',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-foreground)' : 'var(--text-muted)',
              transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : activeTab === 'warehouses' ? (
        /* Warehouse list with expandable bins */
        <div className="space-y-3">
          {warehouses.length === 0 ? (
            <Card><EmptyState icon={Warehouse} title="No warehouses" subtitle="Create your first warehouse" /></Card>
          ) : warehouses.map((wh) => {
            const whBins = bins.filter((b) => b.warehouse?._id === wh._id || b.warehouse === wh._id);
            const isExpanded = expandedWH === wh._id;
            return (
              <Card key={wh._id}>
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedWH(isExpanded ? null : wh._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                      <Warehouse size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{wh.name}</p>
                      <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{wh.code}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{wh.location}</span>
                        <span>{whBins.length} bin{whBins.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManage() && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); openAddBin(wh._id); }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Add bin">
                          <Plus size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openEditWH(wh); }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
                          <Edit2 size={14} />
                        </button>
                        {isAdmin() && (
                          <button onClick={(e) => { e.stopPropagation(); deleteWH(wh._id); }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
                    {whBins.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0', margin: 0 }}>No bins in this warehouse</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {whBins.map((bin) => (
                          <div key={bin._id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }} className="relative group">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{bin.code}</p>
                              <Badge variant={bin.status === 'active' ? 'success' : 'default'}>{bin.status}</Badge>
                            </div>
                            <div style={{ width: '100%', background: 'var(--muted)', borderRadius: '9999px', height: '6px', marginBottom: '4px' }}>
                              <div
                                style={{
                                  height: '100%',
                                  borderRadius: '9999px',
                                  transition: 'all 0.3s',
                                  background: bin.utilization >= 90 ? 'var(--badge-danger-solid)' : bin.utilization >= 60 ? '#f59e0b' : 'var(--badge-success-solid)',
                                  width: `${Math.min(bin.utilization, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{bin.currentStock}/{bin.capacity} units ({bin.utilization}%)</p>
                            {canManage() && (
                              <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                                <button onClick={() => openEditBin(bin)} style={{ padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                  <Edit2 size={11} />
                                </button>
                                {isAdmin() && (
                                  <button onClick={() => deleteBin(bin._id)} style={{ padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--badge-danger-text)', cursor: 'pointer' }}>
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* All bins table */
        <Card>
          {bins.length === 0 ? (
            <EmptyState icon={Grid3x3} title="No bins" subtitle="Create bins within warehouses" />
          ) : (
            <Table>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <Th>Bin Code</Th>
                  <Th>Warehouse</Th>
                  <Th>Capacity</Th>
                  <Th>Current Stock</Th>
                  <Th>Utilization</Th>
                  <Th>Status</Th>
                  {canManage() && <Th className="text-right">Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {bins.map((bin) => (
                  <Tr key={bin._id}>
                    <Td><span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bin.code}</span></Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{bin.warehouse?.name || '—'}</Td>
                    <Td className="font-mono" style={{ color: 'var(--text-primary)' }}>{bin.capacity}</Td>
                    <Td className="font-mono" style={{ color: 'var(--text-primary)' }}>{bin.currentStock}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '80px', background: 'var(--muted)', borderRadius: '9999px', height: '6px' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '9999px',
                              background: bin.utilization >= 90 ? 'var(--badge-danger-solid)' : bin.utilization >= 60 ? '#f59e0b' : 'var(--badge-success-solid)',
                              width: `${Math.min(bin.utilization, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bin.utilization}%</span>
                      </div>
                    </Td>
                    <Td><Badge variant={bin.status === 'active' ? 'success' : 'default'}>{bin.status}</Badge></Td>
                    {canManage() && (
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditBin(bin)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded">
                            <Edit2 size={14} />
                          </button>
                          {isAdmin() && (
                            <button onClick={() => deleteBin(bin._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                    )}
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Warehouse Modal */}
      <Modal isOpen={whModal} onClose={() => setWhModal(false)} title={editWH ? 'Edit Warehouse' : 'Add Warehouse'} size="sm">
        <form onSubmit={saveWH} className="space-y-4">
          <Input label="Warehouse Name *" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} placeholder="Main Warehouse" required />
          <Input label="Code *" value={whForm.code} onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })} placeholder="WH-MAIN" required />
          <Input label="Location *" value={whForm.location} onChange={(e) => setWhForm({ ...whForm, location: e.target.value })} placeholder="Building A, Industrial Estate" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setWhModal(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editWH ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Bin Modal */}
      <Modal isOpen={binModal} onClose={() => setBinModal(false)} title={editBin ? 'Edit Bin' : 'Add Bin'} size="sm">
        <form onSubmit={saveBin} className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Warehouse *</label>
            <select
              value={binForm.warehouse}
              onChange={(e) => setBinForm({ ...binForm, warehouse: e.target.value })}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              required
              disabled={!!editBin}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <Input label="Bin Code *" value={binForm.code} onChange={(e) => setBinForm({ ...binForm, code: e.target.value.toUpperCase() })} placeholder="A-01-01" required />
          <Input label="Capacity (units) *" type="number" min="1" value={binForm.capacity} onChange={(e) => setBinForm({ ...binForm, capacity: e.target.value })} placeholder="100" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBinModal(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editBin ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
