import { useState, useEffect } from 'react';
import { getAllComplaints, updateStatus, deleteComplaint, getStats } from '../services/api';

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <span style={{ marginLeft: 10 }} className="cat-tag">{complaint.category}</span>
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
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

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

      {/* Filter */}
      <div className="filter-bar">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="loading">Loading all complaints...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No complaints in this category</p>
        </div>
      ) : (
        <div className="complaint-list">
          {filtered.map(c => (
            <div key={c.id} className={`complaint-card ${c.status}`}>
              <div>
                <div className="complaint-meta">
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className="cat-tag">{c.category}</span>
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
