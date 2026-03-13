import { useState, useEffect } from 'react';
import { submitComplaint, getStudentComplaints } from '../services/api';

const CATEGORIES = ['WATER', 'ELECTRICITY', 'INTERNET', 'CLEANLINESS', 'FURNITURE', 'OTHER'];

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StudentDashboard({ user }) {
  const [tab, setTab] = useState('complaints'); // 'complaints' | 'new'
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'WATER' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchComplaints = async () => {
    try {
      const res = await getStudentComplaints(user.id);
      setComplaints(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await submitComplaint(user.id, form);
      setSuccess('Complaint submitted successfully!');
      setForm({ title: '', description: '', category: 'WATER' });
      fetchComplaints();
      setTimeout(() => { setTab('complaints'); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Student Portal</h1>
          <div className="page-subtitle">Room {user.roomNumber || 'N/A'} // {user.email}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('new')}>+ New Complaint</button>
      </div>

      {/* Stats */}
      <div className="card-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Raised</div>
        </div>
        <div className="stat-card open">
          <div className="stat-number">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card inprog">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'complaints' ? 'active' : ''}`} onClick={() => setTab('complaints')}>
          My Complaints
        </button>
        <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
          + Raise Complaint
        </button>
      </div>

      {/* Complaints List */}
      {tab === 'complaints' && (
        <>
          <div className="filter-bar">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>No complaints found</p>
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
                      <div className="admin-remark">↳ Admin: {c.adminRemark}</div>
                    )}
                    <div className="complaint-info">
                      <span>#{c.id}</span>
                      <span>Filed {formatDate(c.createdAt)}</span>
                      {c.updatedAt !== c.createdAt && <span>Updated {formatDate(c.updatedAt)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Complaint Form */}
      {tab === 'new' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h2>Raise a Complaint</h2>

          {success && <div className="success-msg">{success}</div>}
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Complaint Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. No water supply in block A" required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the issue in detail — since when, exact location, severity..." required />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint →'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setTab('complaints')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
