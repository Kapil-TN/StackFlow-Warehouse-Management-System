import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader, Card, Table, Th, Td, Tr, Badge, Button,
  Input, Select, Spinner, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'operator',
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdd = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'operator',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!editUser && !form.password) {
      toast.error('Password is required for new users');
      return;
    }

    setSaving(true);
    try {
      if (editUser) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await authAPI.updateUser(editUser._id, payload);
        toast.success('User updated successfully');
      } else {
        await authAPI.createUser(form);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await authAPI.deleteUser(deleteModal._id);
      toast.success('User deleted');
      setDeleteModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="purple">Admin</Badge>;
      case 'warehouse_manager':
        return <Badge variant="info">Manager</Badge>;
      case 'operator':
      default:
        return <Badge variant="default">Operator</Badge>;
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle="Create, manage, and assign roles for system operators and managers"
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={fetchUsers} icon={RefreshCw}>
              Refresh
            </Button>
            <Button variant="primary" onClick={openAdd} icon={Plus}>
              Add User
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                padding: '8px 10px 8px 34px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              width: '180px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="warehouse_manager">Warehouse Manager</option>
            <option value="operator">Operator</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description={search || roleFilter ? "Try adjusting your search criteria" : "Click 'Add User' to register your first team member"}
            action={
              <Button variant="primary" onClick={openAdd} icon={Plus}>
                Add User
              </Button>
            }
          />
        ) : (
          <Table>
            <thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Created At</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = currentUser?._id === u._id;
                return (
                  <Tr key={u._id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: u.role === 'admin'
                              ? 'linear-gradient(135deg, var(--accent), #7c3aed)'
                              : 'var(--bg-card-hover)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: u.role === 'admin' ? '#fff' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {u.name?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {isSelf && (
                              <span style={{ fontSize: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '4px' }}>
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{roleBadge(u.role)}</Td>
                    <Td>
                      <Badge variant="success">Active</Badge>
                    </Td>
                    <Td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          title="Edit User"
                          style={{
                            padding: '6px',
                            color: 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModal(u)}
                          disabled={isSelf}
                          title={isSelf ? "Cannot delete your own account" : "Delete User"}
                          style={{
                            padding: '6px',
                            color: isSelf ? 'var(--text-muted)' : 'var(--badge-danger-text)',
                            background: 'none',
                            border: 'none',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            opacity: isSelf ? 0.4 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Full Name *
            </label>
            <Input
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="e.g. john@stackflow.internal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              {editUser ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <Input
              type="password"
              placeholder={editUser ? 'Leave blank to keep unchanged' : 'Minimum 6 characters'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editUser}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Role *
            </label>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="operator">Operator (Receiving, Picking & Orders)</option>
              <option value="warehouse_manager">Warehouse Manager (Stock & Catalog Management)</option>
              <option value="admin">Administrator (Full Access & User Management)</option>
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete user <strong style={{ color: 'var(--text-primary)' }}>{deleteModal?.name}</strong> ({deleteModal?.email})? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
