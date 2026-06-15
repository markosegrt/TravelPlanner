import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '../services/shareService';
import type { SharedPlan } from '../models/Share';
import { AccessLevel, ActivityStatusLabels, ExpenseCategoryLabels } from '../models/enums';

export function SharedPlanPage() {
  const { token } = useParams<{ token: string }>();

  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlan = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await shareService.getSharedPlan(token);
      setPlan(data);
    } catch {
      setError('This share link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🔗</div>
        <h2>{error || 'Plan not found.'}</h2>
      </div>
    );
  }

  const trip = plan.trip;
  const isEdit = plan.accessLevel === AccessLevel.Edit;

  // Grupisanje aktivnosti po danu
  const groupedActivities = trip.activities.reduce<Record<string, typeof trip.activities>>((acc, act) => {
    const day = act.date.split('T')[0];
    (acc[day] ??= []).push(act);
    return acc;
  }, {});
  const sortedDays = Object.keys(groupedActivities).sort();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header banner sa access badge */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container flex-between" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>✈</div>
            <span style={{ fontWeight: 700 }}>TravelPlanner</span>
          </div>
          <span className="chip" style={{ background: isEdit ? 'var(--color-accent)' : 'var(--color-info)' }}>
            {isEdit ? 'Edit access' : 'View only'}
          </span>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {/* Trip header */}
        <div>
          <h1>{trip.name}</h1>
          <p className="text-muted">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
          {trip.description && <p style={{ marginTop: 'var(--space-2)' }}>{trip.description}</p>}
        </div>

        {/* Budget */}
        <div className="card">
          <h4 style={{ marginBottom: 'var(--space-3)' }}>Budget</h4>
          <div className="flex gap-4">
            <div><p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Planned</p><p style={{ fontWeight: 700 }}>${trip.budgetSummary.plannedBudget.toFixed(2)}</p></div>
            <div><p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Spent</p><p style={{ fontWeight: 700 }}>${trip.budgetSummary.totalSpent.toFixed(2)}</p></div>
            <div><p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Remaining</p><p style={{ fontWeight: 700, color: trip.budgetSummary.remaining < 0 ? 'var(--color-error)' : 'var(--color-success)' }}>${trip.budgetSummary.remaining.toFixed(2)}</p></div>
          </div>
        </div>

        {/* Destinations */}
        {trip.destinations.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Destinations</h4>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {trip.destinations.map((d) => (
                <div key={d.id} style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <strong>{d.name}</strong> — <span className="text-muted">{d.location}</span>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}</p>
                  {d.notes && <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>{d.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {trip.activities.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Activities</h4>
            {sortedDays.map((day) => (
              <div key={day} style={{ marginBottom: 'var(--space-4)' }}>
                <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                {groupedActivities[day].map((a) => (
                  <div key={a.id} style={{ marginBottom: 'var(--space-2)' }}>
                    {a.time && <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{a.time.substring(0, 5)} · </span>}
                    <span>{a.name}</span>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}> ({ActivityStatusLabels[a.status]})</span>
                    {a.location && <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>📍 {a.location}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Expenses */}
        {trip.expenses.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Expenses</h4>
            {trip.expenses.map((e) => (
              <div key={e.id} className="flex-between" style={{ paddingBottom: 'var(--space-2)' }}>
                <span>{e.name} <span className="tag">{ExpenseCategoryLabels[e.category]}</span></span>
                <strong>${e.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        {trip.checklistItems.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Checklist</h4>
            {trip.checklistItems.map((c) => (
              <div key={c.id} style={{ marginBottom: 'var(--space-1)' }}>
                {c.isCompleted ? '☑' : '☐'} <span style={{ textDecoration: c.isCompleted ? 'line-through' : 'none', color: c.isCompleted ? 'var(--color-text-muted)' : 'inherit' }}>{c.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {trip.generalNotes && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Notes</h4>
            <p>{trip.generalNotes}</p>
          </div>
        )}

        <p className="text-muted flex-center" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-4)' }}>
          Shared via TravelPlanner
        </p>
      </div>
    </div>
  );
}