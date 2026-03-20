import { useState, useEffect } from 'react';
import { submitComplaint, getStudentComplaints } from '../services/api';
import ActivityTimeline from '../components/ActivityTimeline';
import { StudentAnnouncementBoard } from '../components/AnnouncementBoard';

const CATEGORIES = ['WATER', 'ELECTRICITY', 'INTERNET', 'CLEANLINESS', 'FURNITURE', 'OTHER'];

const PRIORITIES = [
  { value: 'LOW',    label: '🟢 Low',    desc: 'Minor inconvenience, no urgency' },
  { value: 'MEDIUM', label: '🟡 Medium', desc: 'Noticeable problem, needs attention' },
  { value: 'HIGH',   label: '🟠 High',   desc: 'Significantly affects daily routine' },
  { value: 'URGENT', label: '🔴 Urgent', desc: 'Emergency / safety risk' },
];

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW:    { background: '#dcfce7', color: '#166534' },
    MEDIUM: { background: '#fef9c3', color: '#854d0e' },
    HIGH:   { background: '#ffedd5', color: '#9a3412' },
    URGENT: { background: '#fee2e2', color: '#991b1b' },
  };
  const s = styles[priority] || styles.MEDIUM;
  const p = PRIORITIES.find(x => x.value === priority);
  return (
    <span style={{
      background: s.background, color: s.color,
      padding: '2px 8px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '700', marginLeft: '6px'
    }}>
      {p ? p.label : priority}
    </span>
  );
}

export default function StudentDashboard({ user }) {
  const [tab, setTab]               = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter]         = useState('ALL');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [suggestion, setSuggestion] = useState('');

  // ── Search & Filter state ──────────────────────────────────────
  const [searchText, setSearchText]       = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const [form, setForm] = useState({
    title: '', description: '', category: 'WATER', priority: 'MEDIUM'
  });

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
    setSuggestion('');
    try {
      await submitComplaint(user.id, form);
      setSuccess('✅ Complaint submitted successfully!');
      setForm({ title: '', description: '', category: 'WATER', priority: 'MEDIUM' });
      fetchComplaints();
      setTimeout(() => { setTab('complaints'); setSuccess(''); }, 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.error === 'PRIORITY_MISMATCH') {
        setError(data.message);
        if (data.suggestedPriority) setSuggestion(data.suggestedPriority);
      } else {
        setError(data?.error || 'Failed to submit complaint');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const applySuggestion = () => {
    set('priority', suggestion);
    setSuggestion('');
    setError('');
  };

  // ── Apply all filters + search ─────────────────────────────────
  const filtered = complaints.filter(c => {
    const matchStatus   = filter === 'ALL' || c.status === filter;
    const matchCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchPriority = filterPriority === 'ALL' || c.priority === filterPriority;
    const matchSearch   = searchText.trim() === '' ||
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.description.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchCategory && matchPriority && matchSearch;
  });

  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved:   complaints.filter(c => c.status === 'RESOLVED').length,
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterCategory('ALL');
    setFilterPriority('ALL');
    setFilter('ALL');
  };

  const hasActiveFilters = searchText || filterCategory !== 'ALL' ||
                           filterPriority !== 'ALL' || filter !== 'ALL';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Student Portal</h1>
          <div className="page-subtitle">Room {user.roomNumber || 'N/A'} // {user.email}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('new')}>+ New Complaint</button>
      </div>

      {/* Announcements */}
      <StudentAnnouncementBoard />

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
          {/* ── Status filter bar ── */}
          <div className="filter-bar">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* ── Search & extra filters ── */}
          <div style={{
            display: 'flex', gap: '10px', flexWrap: 'wrap',
            marginBottom: '16px', alignItems: 'center'
          }}>
            {/* Search box */}
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="🔍 Search by title or description..."
              style={{
                flex: '1', minWidth: '200px', padding: '8px 12px',
                borderRadius: '8px', border: '1.5px solid #e2e8f0',
                fontSize: '13px', background: 'var(--card)'
              }}
            />

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1.5px solid #e2e8f0', fontSize: '13px',
                background: 'var(--card)', color: 'var(--text)'
              }}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1.5px solid #e2e8f0', fontSize: '13px',
                background: 'var(--card)', color: 'var(--text)'
              }}
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1.5px solid #e2e8f0', fontSize: '13px',
                background: 'transparent', color: '#ef4444',
                cursor: 'pointer'
              }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Result count */}
          {hasActiveFilters && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Showing {filtered.length} of {complaints.length} complaints
            </p>
          )}

          {loading ? (
            <div className="loading">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
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
                      <div className="admin-remark">↳ Admin: {c.adminRemark}</div>
                    )}
                    <div className="complaint-info">
                      <span>#{c.id}</span>
                      <span>Filed {formatDate(c.createdAt)}</span>
                      {c.updatedAt !== c.createdAt && <span>Updated {formatDate(c.updatedAt)}</span>}
                    </div>
                    <ActivityTimeline complaintId={c.id} />
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

          {error && (
            <div className="error-msg" style={{ marginBottom: '12px' }}>
              <div>{error}</div>
              {suggestion && (
                <button type="button" onClick={applySuggestion} style={{
                  marginTop: '10px', padding: '6px 14px',
                  background: '#1d4ed8', color: 'white',
                  border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                }}>
                  ✅ Use suggested priority: {suggestion}
                </button>
              )}
            </div>
          )}

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
              <label>Priority Level</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                style={{
                  width: '100%', padding: '10px',
                  borderRadius: '8px', border: '1.5px solid #e2e8f0',
                  fontSize: '14px', background: 'white'
                }}>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {p.desc}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                ⚠ AI will verify your selected priority matches the description
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the issue in detail — since when, exact location, severity..." required />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Validating...' : 'Submit Complaint →'}
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