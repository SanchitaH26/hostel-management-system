import { useState, useEffect } from 'react';
import {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  deactivateAnnouncement,
  deleteAnnouncement
} from '../services/api';

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const TYPE_STYLES = {
  INFO:    { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️', label: 'Info' },
  WARNING: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️', label: 'Warning' },
  URGENT:  { bg: '#fef2f2', border: '#ef4444', icon: '🚨', label: 'Urgent' },
};

// ── Student view — read only ───────────────────────────────────────
export function StudentAnnouncementBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    getAnnouncements()
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '14px', fontWeight: '600',
        color: 'var(--text-muted)', marginBottom: '10px',
        textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        📢 Hostel Announcements
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {announcements.map(a => {
          const s = TYPE_STYLES[a.type] || TYPE_STYLES.INFO;
          return (
            <div key={a.id} style={{
              background: s.bg,
              borderLeft: `4px solid ${s.border}`,
              borderRadius: '8px',
              padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>{s.icon}</span>
                <strong style={{ fontSize: '14px' }}>{a.title}</strong>
                <span style={{
                  fontSize: '11px', padding: '2px 8px',
                  background: s.border, color: 'white',
                  borderRadius: '10px', marginLeft: 'auto'
                }}>
                  {s.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{a.message}</p>
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#6b7280' }}>
                Posted {formatDate(a.createdAt)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin view — can create, deactivate, delete ────────────────────
export function AdminAnnouncementBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchAll = () => {
    getAllAnnouncements()
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAnnouncement(form);
      setForm({ title: '', message: '', type: 'INFO' });
      setShowForm(false);
      fetchAll();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    await deactivateAnnouncement(id);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    fetchAll();
  };

  return (
    <div style={{ marginBottom: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{
          fontSize: '14px', fontWeight: '600',
          color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0
        }}>
          📢 Announcement Board
        </h3>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}
          onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '16px', border: '1px solid #3b82f6' }}>
          <h4 style={{ marginBottom: '14px' }}>Post New Announcement</h4>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Water supply cut tomorrow" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Full details of the announcement..." required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                style={{ width: '100%' }}>
                <option value="INFO">ℹ️ Info — General information</option>
                <option value="WARNING">⚠️ Warning — Needs attention</option>
                <option value="URGENT">🚨 Urgent — Immediate action needed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements list */}
      {loading ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
      ) : announcements.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No announcements yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {announcements.map(a => {
            const s = TYPE_STYLES[a.type] || TYPE_STYLES.INFO;
            return (
              <div key={a.id} style={{
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                borderRadius: '8px',
                padding: '12px 16px',
                opacity: a.active ? 1 : 0.5,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span>{s.icon}</span>
                    <strong style={{ fontSize: '14px' }}>{a.title}</strong>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px',
                      background: s.border, color: 'white', borderRadius: '10px'
                    }}>
                      {s.label}
                    </span>
                    {!a.active && (
                      <span style={{
                        fontSize: '11px', padding: '2px 8px',
                        background: '#6b7280', color: 'white', borderRadius: '10px'
                      }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{a.message}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>
                    Posted {formatDate(a.createdAt)}
                  </p>
                </div>

                {/* Admin actions */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                  {a.active && (
                    <button
                      onClick={() => handleDeactivate(a.id)}
                      style={{
                        fontSize: '11px', padding: '4px 10px',
                        background: '#f59e0b', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer'
                      }}>
                      Deactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      fontSize: '11px', padding: '4px 10px',
                      background: '#ef4444', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer'
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}