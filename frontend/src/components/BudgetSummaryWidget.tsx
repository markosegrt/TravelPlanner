import type { BudgetSummary } from '../models/Trip';

export function BudgetSummaryWidget({ summary }: { summary: BudgetSummary }) {
  const spentPercent = summary.plannedBudget > 0
    ? Math.min((summary.totalSpent / summary.plannedBudget) * 100, 100)
    : 0;
  const overBudget = summary.remaining < 0;

  return (
    <div className="card">
      <h4 style={{ marginBottom: 'var(--space-4)' }}>Budget Summary</h4>

      <div className="flex-between mb-4" style={{ gap: 'var(--space-4)' }}>
        <div>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Planned</p>
          <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            ${summary.plannedBudget.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Spent</p>
          <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            ${summary.totalSpent.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Remaining</p>
          <p style={{
            fontSize: 'var(--font-size-xl)', fontWeight: 700,
            color: overBudget ? 'var(--color-error)' : 'var(--color-success)',
          }}>
            ${summary.remaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          width: `${spentPercent}%`, height: '100%',
          background: overBudget ? 'var(--color-error)' : 'var(--color-primary)',
          transition: 'width 0.3s',
        }} />
      </div>
      {overBudget && (
        <p className="text-error" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
          Over budget by ${Math.abs(summary.remaining).toFixed(2)}
        </p>
      )}
    </div>
  );
}