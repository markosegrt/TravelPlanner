import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: 'var(--space-3) 0',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div className="container flex-between" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="flex" style={{ alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700,
            }}>✈</div>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>
              TravelPlanner
            </span>
          </div>
        </Link>

        <div className="flex" style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
          {isAdmin && (
            <Link to="/admin" className="text-muted" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              Admin
            </Link>
          )}
          <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            {user?.name}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}