import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import type { User } from '../models/User';
import type { AdminTrip } from '../models/AdminTrip';
import { Navbar } from '../components/Navbar';

type AdminTab = 'users' | 'trips';

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'users') {
        setUsers(await adminService.getAllUsers());
      } else {
        setTrips(await adminService.getAllTrips());
      }
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      await adminService.updateUserStatus(u.id, !u.isActive);
      await loadData();
    } catch {
      setError('Failed to update user status.');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Navbar />
      <div className="container">
        <button className="btn-ghost mb-4" onClick={() => navigate('/')} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'var(--color-text-muted)' }}>
          ← Back to trips
        </button>

        <h1 className="mb-4">Admin Panel</h1>

        {/* Tabovi */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-5)' }}>
          {(['users', 'trips'] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: 'var(--space-3) var(--space-4)', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--font-size-base)', fontWeight: 600,
                color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {t === 'users' ? 'Users' : 'All Trips'}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="flex-center" style={{ padding: 'var(--space-8)' }}><div className="spinner" /></div>
        ) : tab === 'users' ? (
          /* ===== USERS ===== */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Name</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Email</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Role</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{u.name}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }} className="text-muted">{u.email}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="tag">{u.role}</span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span style={{ color: u.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      {u.id === currentUser?.id ? (
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>You</span>
                      ) : (
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ===== ALL TRIPS ===== */
          trips.length === 0 ? (
            <div className="card text-muted flex-center" style={{ padding: 'var(--space-6)' }}>No trips in the system.</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', textAlign: 'left' }}>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Trip</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Owner</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Dates</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{t.destinationCount} destination{t.destinationCount !== 1 ? 's' : ''}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div>{t.ownerName}</div>
                        <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{t.ownerEmail}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }} className="text-muted">
                        {formatDate(t.startDate)} — {formatDate(t.endDate)}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <span style={{ fontWeight: 600, color: t.totalSpent > t.plannedBudget ? 'var(--color-error)' : 'var(--color-text)' }}>
                          ${t.totalSpent.toFixed(0)} / ${t.plannedBudget.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}