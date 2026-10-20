import { useState, useEffect } from 'react';
import { productAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Th, Td, Tr, Badge, Button, Input, Select, Spinner, EmptyState, Textarea } from '../components/ui';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', sku: '', category: '', description: '', unit: 'piece', unitCost: '', reorderLevel: 10 };

const Products = () => {
  const { canManage, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productAPI.getAll({ search, category: categoryFilter }),
        productAPI.getCategories(),
      ]);
      setProducts(prods.data);
      setCategories(cats.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, categoryFilter]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || '',
      unit: product.unit,
      unitCost: product.unitCost,
      reorderLevel: product.reorderLevel,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || form.unitCost === '') {
      toast.error('Name, SKU, category, and unit cost are required');
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await productAPI.update(editProduct._id, form);
        toast.success('Product updated');
      } else {
        await productAPI.create(form);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await productAPI.deactivate(deleteModal._id);
      toast.success('Product deactivated');
      setDeleteModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate product');
    }
  };

  const categoryColors = ['blue', 'purple', 'cyan', 'indigo', 'green'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        action={
          canManage() && (
            <Button icon={Plus} onClick={openAdd}>Add Product</Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={fetchProducts}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" subtitle="Add your first product to get started" />
        ) : (
          <Table>
            <thead>
              <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                <Th>Name</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Unit</Th>
                <Th>Unit Cost</Th>
                <Th>Reorder Level</Th>
                {canManage() && <Th className="text-right">Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <Tr key={p._id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                        <Package size={14} style={{ color: 'var(--accent)' }} />
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {p.sku}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant="accent">{p.category}</Badge>
                  </Td>
                  <Td style={{ color: 'var(--text-secondary)' }}>{p.unit}</Td>
                  <Td className="font-mono" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>₹{p.unitCost?.toLocaleString('en-IN')}</Td>
                  <Td className="font-mono" style={{ color: 'var(--text-secondary)' }}>{p.reorderLevel}</Td>
                  {canManage() && (
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => setDeleteModal(p)}
                            style={{ padding: '6px', color: 'var(--badge-danger-text)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wireless Mouse"
              required
            />
            <Input
              label="SKU *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. WL-MOUSE-001"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category *"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Electronics"
              required
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g. piece, box, kg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Cost (₹) *"
              type="number"
              min="0"
              step="0.01"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label="Reorder Level"
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
              placeholder="10"
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional product description..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate confirmation */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Deactivate Product" size="sm">
        <p className="text-slate-300 mb-4">
          Are you sure you want to deactivate <strong className="text-white">"{deleteModal?.name}"</strong>?
          It will no longer appear in the catalog but existing inventory records will be preserved.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)} type="button">Cancel</Button>
          <Button variant="danger" onClick={handleDeactivate}>Deactivate</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
