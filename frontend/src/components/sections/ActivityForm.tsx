import { useState } from 'react';
import type { Activity, CreateActivityRequest } from '../../models/Activity';
import { ActivityStatus, ActivityStatusLabels } from '../../models/enums';
import axios from 'axios';

export function ActivityForm({ existing, tripStart, tripEnd, onSubmit, onCancel }: {
  existing?: Activity;
  tripStart: string;
  tripEnd: string;
  onSubmit: (data: CreateActivityRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const toDateInput = (iso?: string) => (iso ? iso.split('T')[0] : '');
  const toTimeInput = (t?: string) => (t ? t.substring(0, 5) : ''); // "hh:mm:ss" → "hh:mm"

  const minDate = toDateInput(tripStart);
  const maxDate = toDateInput(tripEnd);

  const [formData, setFormData] = useState({
    name: existing?.name ?? '',
    date: toDateInput(existing?.date),
    time: toTimeInput(existing?.time),
    location: existing?.location ?? '',
    description: existing?.description ?? '',
    estimatedCost: existing?.estimatedCost?.toString() ?? '',
    status: existing?.status ?? ActivityStatus.Planned,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'status' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.date) {
      setError('Name and date are required.');
      return;
    }

    const date = new Date(formData.date);
    if (date < new Date(minDate) || date > new Date(maxDate)) {
      setError(`Activity date must be within the trip period (${minDate} to ${maxDate}).`);
      return;
    }

    const cost = parseFloat(formData.estimatedCost) || 0;
    if (cost < 0) {
      setError('Estimated cost cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        date: date.toISOString(),
        time: formData.time ? `${formData.time}:00` : undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        estimatedCost: cost,
        status: formData.status,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save activity.');
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
        <label className="form-label">Activity name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Visit Colosseum" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Date</label>
          <input className="form-input" type="date" name="date" value={formData.date} onChange={handleChange} min={minDate} max={maxDate} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Time</label>
          <input className="form-input" type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Estimated cost ($)</label>
          <input className="form-input" type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} placeholder="0" min="0" step="0.01" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Status</label>
          <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
            {Object.values(ActivityStatus).map((s) => (
              <option key={s} value={s}>{ActivityStatusLabels[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : existing ? 'Save changes' : 'Add activity'}
        </button>
      </div>
    </form>
  );
}