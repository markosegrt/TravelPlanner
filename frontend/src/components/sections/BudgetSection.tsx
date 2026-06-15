import { useState } from 'react';
import type { Expense, CreateExpenseRequest } from '../../models/Expense';
import type { BudgetSummary } from '../../models/Trip';
import { ExpenseCategoryLabels } from '../../models/enums';
import { expenseService } from '../../services/expenseService';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';
import { BudgetSummaryWidget } from '../BudgetSummaryWidget';
import { ExpenseForm } from './ExpenseForm';

export function BudgetSection({ tripId, tripStart, tripEnd, expenses, summary, onChanged }: {
  tripId: number;
  tripStart: string;
  tripEnd: string;
  expenses: Expense[];
  summary: BudgetSummary;
  onChanged: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleCreate = async (data: CreateExpenseRequest) => {
    await expenseService.create(tripId, data);
    setShowForm(false);
    await onChanged();
  };

  const handleUpdate = async (data: CreateExpenseRequest) => {
    if (!editing) return;
    await expenseService.update(tripId, editing.id, data);
    setEditing(null);
    await onChanged();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await expenseService.remove(tripId, deleteTarget.id);
    setDeleteTarget(null);
    await onChanged();
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {/* [FACT: spec §3.4] Auto-računati budget summary */}
      <BudgetSummaryWidget summary={summary} />

      <div>
        <div className="flex-between mb-4">
          <h3>Expenses</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add expense</button>
        </div>

        {expenses.length === 0 ? (
          <div className="card text-muted flex-center" style={{ padding: 'var(--space-6)' }}>
            No expenses yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {expenses.map((e) => (
              <div key={e.id} className="card" style={{ padding: 'var(--space-4)' }}>
                <div className="flex-between">
                  <div className="flex gap-3" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>{e.name}</span>
                        <span className="tag">{ExpenseCategoryLabels[e.category]}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {formatDate(e.date)}{e.description ? ` · ${e.description}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3" style={{ alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>${e.amount.toFixed(2)}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(e)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(e)} style={{ color: 'var(--color-error)' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal title="Add Expense" isOpen={showForm} onClose={() => setShowForm(false)}>
        <ExpenseForm tripStart={tripStart} tripEnd={tripEnd} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal title="Edit Expense" isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing && <ExpenseForm existing={editing} tripStart={tripStart} tripEnd={tripEnd} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete expense?"
        message={`Remove "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}