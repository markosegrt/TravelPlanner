import { useState } from 'react';
import type { Expense, CreateExpenseRequest } from '../../models/Expense';
import { ExpenseCategory, ExpenseCategoryLabels } from '../../models/enums';
import axios from 'axios';

export function ExpenseForm({ existing, tripStart, tripEnd, onSubmit, onCancel }: {
  existing?: Expense;
  tripStart: string;
  tripEnd: string;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const toDateInput = (iso?: string) => (iso ? iso.split('T')[0] : '');

  const minDate = toDateInput(tripStart);
  const maxDate = toDateInput(tripEnd);

  const [formData, setFormData] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? ExpenseCategory.Transport,
    amount: existing?.amount?.toString() ?? '',
    date: toDateInput(existing?.date),
    description: existing?.description ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'category' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.amount || !formData.date) {
      setError('Name, amount, and date are required.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0) {
      setError('Amount cannot be negative.');
      return;
    }

    const date = new Date(formData.date);
    if (date < new Date(minDate) || date > new Date(maxDate)) {
      setError(`Expense date must be within the trip period (${minDate} to ${maxDate}).`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        category: formData.category,
        amount,
        date: date.toISOString(),
        description: formData.description || undefined,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save expense.');
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
        <label className="form-label">Expense name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Flight tickets" />
      </div>

      <div className="flex gap-3">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Category</label>
          <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
            {Object.values(ExpenseCategory).map((c) => (
              <option key={c} value={c}>{ExpenseCategoryLabels[c]}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Amount ($)</label>
          <input className="form-input" type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0" min="0" step="0.01" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input className="form-input" type="date" name="date" value={formData.date} onChange={handleChange} min={minDate} max={maxDate} />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Optional" />
      </div>

      <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : existing ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}