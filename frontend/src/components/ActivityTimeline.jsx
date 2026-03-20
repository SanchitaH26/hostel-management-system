import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export default function ActivityTimeline({ complaintId }) {
  const [logs, setLogs]       = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/complaints/${complaintId}/logs`);
      setLogs(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, complaintId]);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none',
          color: '#94a3b8', fontSize: '12px',
          cursor: 'pointer', padding: '0',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        {open ? '▲' : '▼'} {open ? 'Hide' : 'Show'} activity timeline
      </button>

      {/* Timeline */}
      {open && (
        <div style={{ marginTop: '10px' }}>
          {loading ? (
            <p style={{ fontSize: '12px', color: '#64748b' }}>Loading...</p>
          ) : logs.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748b' }}>No activity yet.</p>
          ) : (
            <div style={{
              position: 'relative',
              paddingLeft: '20px',
              borderLeft: '2px solid #334155'
            }}>
              {logs.map((log, i) => (
                <div key={log.id} style={{
                  position: 'relative',
                  marginBottom: '14px',
                  paddingLeft: '16px'
                }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: '-26px', top: '4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: i === logs.length - 1 ? '#3b82f6' : '#475569',
                    border: '2px solid #1e293b',
                    boxShadow: i === logs.length - 1 ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none'
                  }} />

                  {/* Action */}
                  <p style={{
                    margin: 0, fontSize: '13px',
                    color: i === logs.length - 1 ? '#93c5fd' : '#cbd5e1',
                    fontWeight: i === logs.length - 1 ? '600' : '400'
                  }}>
                    {log.action}
                  </p>

                  {/* By + timestamp */}
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    by {log.performedBy} &nbsp;•&nbsp; {formatDate(log.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}