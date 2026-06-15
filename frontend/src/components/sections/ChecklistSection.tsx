import { useState } from 'react';
import type { ChecklistItem } from '../../models/ChecklistItem';
import { checklistService } from '../../services/checklistService';
import { ConfirmDialog } from '../ConfirmDialog';

export function ChecklistSection({ tripId, items, onChanged }: {
  tripId: number;
  items: ChecklistItem[];
  onChanged: () => Promise<void>;
}) {
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChecklistItem | null>(null);

  const completedCount = items.filter((i) => i.isCompleted).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setAdding(true);
    try {
      await checklistService.create(tripId, { name: newItem.trim() });
      setNewItem('');
      await onChanged();
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    await checklistService.update(tripId, item.id, {
      name: item.name,
      isCompleted: !item.isCompleted,
    });
    await onChanged();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await checklistService.remove(tripId, deleteTarget.id);
    setDeleteTarget(null);
    await onChanged();
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h3>Checklist</h3>
        {items.length > 0 && (
          <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            {completedCount} / {items.length} done
          </span>
        )}
      </div>

      {/* Inline add */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          className="form-input"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item (e.g. Passport)"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={adding || !newItem.trim()}>
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <div className="card text-muted flex-center" style={{ padding: 'var(--space-6)' }}>
          No checklist items yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: item.isCompleted ? 0.6 : 1,
              }}
            >
              <label className="flex gap-3" style={{ alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggle(item)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span style={{
                  textDecoration: item.isCompleted ? 'line-through' : 'none',
                  color: item.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                }}>
                  {item.name}
                </span>
              </label>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDeleteTarget(item)}
                style={{ color: 'var(--color-error)' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete item?"
        message={`Remove "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}