import { useState } from 'react';
import './index.css';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Topbar from './components/Topbar';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('hcms_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleAuth = (userData) => {
    sessionStorage.setItem('hcms_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hcms_user');
    setUser(null);
  };

  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="app-shell">
      <Topbar user={user} onLogout={handleLogout} />
      {user.role === 'ADMIN'
        ? <AdminDashboard user={user} />
        : <StudentDashboard user={user} />
      }
    </div>
  );
}
