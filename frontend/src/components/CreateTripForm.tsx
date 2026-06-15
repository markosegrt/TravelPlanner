import { useReducer, useState } from 'react';
import type { CreateTripRequest } from '../models/Trip';
import axios from 'axios';


interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  plannedBudget: string;
  generalNotes: string;
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'RESET' };

const initialState: FormState = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  plannedBudget: '',
  generalNotes: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function CreateTripForm({ onSubmit, onCancel }: {
  onSubmit: (data: CreateTripRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, dispatch] = useReducer(formReducer, initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name as keyof FormState, value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.startDate || !form.endDate) {
      setError('Name and dates are required.');
      return;
    }
    if (new Date(form.startDate) < new Date(today)) {
      setError('Start date cannot be in the past.');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    const budget = parseFloat(form.plannedBudget) || 0;
    if (budget < 0) {
      setError('Budget cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: form.name,
        description: form.description || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        plannedBudget: budget,
        generalNotes: form.generalNotes || undefined,
      });
      dispatch({ type: 'RESET' });
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
        <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Summer in Italy" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Start date</label>
          <input
            className="form-input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            min={today}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">End date</label>
          <input
            className="form-input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            min={form.startDate || today}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Planned budget ($)</label>
        <input className="form-input" type="number" name="plannedBudget" value={form.plannedBudget} onChange={handleChange} placeholder="0" min="0" step="0.01" />
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" name="generalNotes" value={form.generalNotes} onChange={handleChange} placeholder="Optional" />
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