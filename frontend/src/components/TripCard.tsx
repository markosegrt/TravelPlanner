import { useNavigate } from 'react-router-dom';
import type { Trip } from '../models/Trip';

export function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();

  const spentPercent = trip.plannedBudget > 0
    ? Math.min((trip.totalSpent / trip.plannedBudget) * 100, 100)
    : 0;
  const overBudget = trip.totalSpent > trip.plannedBudget;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="card"
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.05s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      <h3 style={{ marginBottom: 'var(--space-2)' }}>{trip.name}</h3>
      <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
        {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
      </p>

      <div className="flex-between" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
        <span className="text-muted">{trip.destinationCount} destination{trip.destinationCount !== 1 ? 's' : ''}</span>
        <span style={{ fontWeight: 600, color: overBudget ? 'var(--color-error)' : 'var(--color-text)' }}>
          ${trip.totalSpent.toFixed(0)} / ${trip.plannedBudget.toFixed(0)}
        </span>
      </div>

      {/* Budget progress bar */}
      <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          width: `${spentPercent}%`, height: '100%',
          background: overBudget ? 'var(--color-error)' : 'var(--color-primary)',
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}