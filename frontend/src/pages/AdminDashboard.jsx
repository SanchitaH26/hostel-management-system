import { useState, useEffect } from 'react';
import { getAllComplaints, updateStatus, deleteComplaint, getStats } from '../services/api';
import { AdminAnnouncementBoard } from '../components/AnnouncementBoard';

const CATEGORIES = ['WATER', 'ELECTRICITY', 'INTERNET', 'CLEANLINESS', 'FURNITURE', 'OTHER'];

const PRIORITY_STYLES = {
  LOW:    { background: '#dcfce7', color: '#166534', label: '🟢 Low' },
  MEDIUM: { background: '#fef9c3', color: '#854d0e', label: '🟡 Medium' },
  HIGH:   { background: '#ffedd5', color: '#9a3412', label: '🟠 High' },
  URGENT: { background: '#fee2e2', color: '#991b1b', label: '🔴 URGENT' },
};

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  return (
    <span style={{
      background: s.background, color: s.color,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '700', marginLeft: '6px'
    }}>
      {s.label}
    </span>
  );
}

function RemarkModal({ complaint, onClose, onSave }) {
  const [status, setStatus] = useState(complaint.status);
  const [remark, setRemark] = useState(complaint.adminRemark || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(complaint.id, status, remark);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }}>
      <div className="card" style={{ width: 460, border: '1px solid #3e3e3e' }}>
        <h2 style={{ marginBottom: 16 }}>Update Complaint #{complaint.id}</h2>
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{complaint.title}</strong>
          <span style={{ marginLeft: 8 }} className="cat-tag">{complaint.category}</span>
          {complaint.priority && <PriorityBadge priority={complaint.priority} />}
        </div>
        <div className="form-group">
          <label>Update Status</label>
          <select className="status-select" value={status} onChange={e => setStatus(e.target.value)}
            style={{ width: '100%' }}>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
        <div className="form-group">
          <label>Admin Remark (Optional)</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)}
            placeholder="e.g. Electrician assigned, will resolve by tomorrow..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats]           = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);

  // ── Search & Filter state ──────────────────────────────────────
  const [searchText, setSearchText]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [sortBy, setSortBy]                 = useState('priority'); // 'priority' | 'date' | 'status'

  const fetchAll = async () => {
    try {
      const [cRes, sRes] = await Promise.all([getAllComplaints(), getStats()]);
      setComplaints(cRes.data);
      setStats(sRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (id, status, remark) => {
    await updateStatus(id, status, remark);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    await deleteComplaint(id);
    fetchAll();
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterStatus('ALL');
    setFilterCategory('ALL');
    setFilterPriority('ALL');
    setSortBy('priority');
  };

  // ── Apply filters ──────────────────────────────────────────────
  const filtered = complaints
    .filter(c => {
      const matchStatus   = filterStatus === 'ALL'   || c.status === filterStatus;
      const matchCategory = filterCategory === 'ALL' || c.category === filterCategory;
      const matchPriority = filterPriority === 'ALL' || c.priority === filterPriority;
      const matchSearch   = searchText.trim() === '' ||
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        c.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (c.student?.name || '').toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchCategory && matchPriority && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      }
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'status') {
        const order = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2 };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
      }
      return 0;
    });

  const hasActiveFilters = searchText || filterStatus !== 'ALL' ||
                           filterCategory !== 'ALL' || filterPriority !== 'ALL';

  return (
    <div className="page">
      {selected && (
        <RemarkModal complaint={selected} onClose={() => setSelected(null)} onSave={handleSave} />
      )}

      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <div className="page-subtitle">Complaint Management // {user.email}</div>
        </div>
        <button className="btn btn-outline" onClick={fetchAll}>↻ Refresh</button>
      </div>

      {/* Announcement Board */}
      <AdminAnnouncementBoard />

      {/* Stats */}
      <div className="card-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card open">
          <div className="stat-number">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card inprog">
          <div className="stat-number">{stats.inProgress ?? stats['inProgress']}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* ── Search & Filter bar ── */}
      <div style={{ marginBottom: '16px' }}>

        {/* Search box */}
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="🔍 Search by title, description or student name..."
          style={{
            width: '100%', padding: '10px 14px', marginBottom: '10px',
            borderRadius: '8px', border: '1.5px solid #e2e8f0',
            fontSize: '13px', background: 'var(--card)', color: 'var(--text)',
            boxSizing: 'border-box'
          }}
        />

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Status */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'var(--card)', color: 'var(--text)' }}>
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Category */}
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'var(--card)', color: 'var(--text)' }}>
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Priority */}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'var(--card)', color: 'var(--text)' }}>
            <option value="ALL">All Priorities</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'var(--card)', color: 'var(--text)' }}>
            <option value="priority">Sort: Priority</option>
            <option value="date">Sort: Newest First</option>
            <option value="status">Sort: Status</option>
          </select>

          {/* Clear */}
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{
              padding: '8px 12px', borderRadius: '8px',
              border: '1.5px solid #e2e8f0', fontSize: '13px',
              background: 'transparent', color: '#ef4444', cursor: 'pointer'
            }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Result count */}
        {hasActiveFilters && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Showing {filtered.length} of {complaints.length} complaints
          </p>
        )}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="loading">Loading all complaints...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>{hasActiveFilters ? 'No complaints match your filters' : 'No complaints found'}</p>
          {hasActiveFilters && (
            <button className="btn btn-outline" onClick={clearFilters}
              style={{ marginTop: '10px', fontSize: '13px' }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="complaint-list">
          {filtered.map(c => (
            <div key={c.id} className={`complaint-card ${c.status}`}>
              <div>
                <div className="complaint-meta">
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className="cat-tag">{c.category}</span>
                  {c.priority && <PriorityBadge priority={c.priority} />}
                </div>
                <div className="complaint-title">{c.title}</div>
                <div className="complaint-desc">{c.description}</div>
                {c.adminRemark && (
                  <div className="admin-remark">↳ Remark: {c.adminRemark}</div>
                )}
                <div className="complaint-info">
                  <span>#{c.id}</span>
                  <span>
                    By: <strong style={{ color: 'var(--text)' }}>
                      {c.student?.name}
                    </strong>
                    {c.student?.roomNumber && ` · Room ${c.student.roomNumber}`}
                  </span>
                  <span>Filed {formatDate(c.createdAt)}</span>
                </div>
              </div>

              <div className="complaint-actions">
                <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px' }}
                  onClick={() => setSelected(c)}>
                  Update
                </button>
                <button className="btn btn-danger" style={{ fontSize: 11, padding: '6px 14px' }}
                  onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}