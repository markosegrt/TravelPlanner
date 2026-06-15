import { useState } from 'react';
import type { Destination, CreateDestinationRequest } from '../../models/Destination';
import axios from 'axios';

export function DestinationForm({ existing, tripStart, tripEnd, onSubmit, onCancel }: {
  existing?: Destination;
  tripStart: string;   // ISO — granica trip-a
  tripEnd: string;     // ISO — granica trip-a
  onSubmit: (data: CreateDestinationRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const toDateInput = (iso?: string) => (iso ? iso.split('T')[0] : '');

  // Granice za date input (yyyy-mm-dd format)
  const minDate = toDateInput(tripStart);
  const maxDate = toDateInput(tripEnd);

  const [formData, setFormData] = useState({
    name: existing?.name ?? '',
    location: existing?.location ?? '',
    arrivalDate: toDateInput(existing?.arrivalDate),
    departureDate: toDateInput(existing?.departureDate),
    notes: existing?.notes ?? '',
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

    if (!formData.name || !formData.location || !formData.arrivalDate || !formData.departureDate) {
      setError('Name, location, and dates are required.');
      return;
    }

    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);
    const tStart = new Date(minDate);
    const tEnd = new Date(maxDate);

    if (departure < arrival) {
      setError('Departure date cannot be before arrival date.');
      return;
    }
    // Strogo: ceo opseg destinacije mora biti unutar trip perioda
    if (arrival < tStart || departure > tEnd) {
      setError(`Destination dates must be within the trip period (${minDate} to ${maxDate}).`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        location: formData.location,
        arrivalDate: arrival.toISOString(),
        departureDate: departure.toISOString(),
        notes: formData.notes || undefined,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save destination.');
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
        <label className="form-label">Name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Rome" />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="Rome, Italy" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Arrival</label>
          <input
            className="form-input"
            type="date"
            name="arrivalDate"
            value={formData.arrivalDate}
            onChange={handleChange}
            min={minDate}
            max={maxDate}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Departure</label>
          <input
            className="form-input"
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={formData.arrivalDate || minDate}
            max={maxDate}
          />
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '-8px', marginBottom: 'var(--space-3)' }}>
        Trip period: {minDate} to {maxDate}
      </p>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : existing ? 'Save changes' : 'Add destination'}
        </button>
      </div>
    </form>
  );
}