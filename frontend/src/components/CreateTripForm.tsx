import { useState } from 'react';
import type { CreateTripRequest } from '../models/Trip';
import axios from 'axios';

export function CreateTripForm({ onSubmit, onCancel }: {
  onSubmit: (data: CreateTripRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '',
    plannedBudget: '', generalNotes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('Name and dates are required.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    const budget = parseFloat(formData.plannedBudget) || 0;
    if (budget < 0) {
      setError('Budget cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        plannedBudget: budget,
        generalNotes: formData.generalNotes || undefined,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create trip.');
      } else {
        setError('An unexpected error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Trip name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Summer in Italy" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" name="description" value={formData.description} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Start date</label>
          <input className="form-input" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">End date</label>
          <input className="form-input" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Planned budget ($)</label>
        <input className="form-input" type="number" name="plannedBudget" value={formData.plannedBudget} onChange={handleChange} placeholder="0" min="0" step="0.01" />
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" name="generalNotes" value={formData.generalNotes} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create trip'}
        </button>
      </div>
    </form>
  );
}