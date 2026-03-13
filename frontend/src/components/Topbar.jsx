export default function Topbar({ user, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-brand">
        SHCMS <span>// Hostel Complaint System</span>
      </div>
      <div className="topbar-right">
        <div className="user-pill">
          <strong>{user.role}</strong> · {user.name}
        </div>
        <button className="btn btn-outline" style={{ padding: '5px 14px', fontSize: 11 }}
          onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
