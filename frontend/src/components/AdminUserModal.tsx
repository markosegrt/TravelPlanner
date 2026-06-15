import { useState, useEffect } from 'react';
import type { User } from '../models/User';
import { adminService } from '../services/adminService';
import { Modal } from './Modal';
import axios from 'axios';

export function AdminUserModal({ user, isOpen, onClose, onSaved }: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [role, setRole] = useState('User');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  
    useEffect(() => {
        if (user) setRole(user.role);
    }, [user]);

  const handleSaveRole = async () => {
    if (!user) return;
    setError('');
    setSuccess('');
    setSavingRole(true);
    try {
      await adminService.updateUserRole(user.id, role);
      setSuccess('Role updated.');
      await onSaved();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to update role.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSavingRole(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await adminService.resetUserPassword(user.id, newPassword);
      setSuccess('Password reset successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to reset password.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <Modal title={`Manage ${user.name}`} isOpen={isOpen} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ROLE */}
      <div style={{ marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <h4 style={{ marginBottom: 'var(--space-3)' }}>Role</h4>
        <div className="form-group">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSaveRole} disabled={savingRole}>
          {savingRole ? 'Saving...' : 'Update role'}
        </button>
        <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}>
          Current role: {user.role}
        </p>
      </div>

      {/* RESET PASSWORD */}
      <div>
        <h4 style={{ marginBottom: 'var(--space-3)' }}>Reset password</h4>
        <div className="form-group">
          <label className="form-label">New password</label>
          <input
            className="form-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm new password</label>
          <input
            className="form-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleResetPassword} disabled={savingPassword}>
          {savingPassword ? 'Resetting...' : 'Reset password'}
        </button>
      </div>
    </Modal>
  );
}