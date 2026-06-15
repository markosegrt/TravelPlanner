import { useState } from 'react';
import type { TripDetail } from '../../models/Trip';
import { tripService } from '../../services/tripService';
import axios from 'axios';

export function NotesSection({ trip, onChanged }: {
  trip: TripDetail;
  onChanged: () => Promise<void>;
}) {
  const [notes, setNotes] = useState(trip.generalNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = notes !== (trip.generalNotes ?? '');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      // Notes su polje trip-a — šaljemo ceo trip, menjamo samo notes
      await tripService.update(trip.id, {
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        plannedBudget: trip.plannedBudget,
        generalNotes: notes || undefined,
      });
      setSaved(true);
      await onChanged();
      // Sakrij "Saved" poruku posle 2s
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save notes.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h3>Notes</h3>
        {saved && <span className="text-success" style={{ fontSize: 'var(--font-size-sm)' }}>✓ Saved</span>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <textarea
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write any notes about this trip..."
          style={{ minHeight: 200, marginBottom: 'var(--space-4)' }}
        />
        <div className="flex" style={{ justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? 'Saving...' : 'Save notes'}
          </button>
        </div>
      </div>
    </div>
  );
}