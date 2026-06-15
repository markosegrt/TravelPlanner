import { useState } from 'react';
import type { Activity, CreateActivityRequest } from '../../models/Activity';
import { activityService } from '../../services/activityService';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';
import { StatusChip } from '../StatusChip';
import { ActivityForm } from './ActivityForm';

export function ActivitiesSection({ tripId, tripStart, tripEnd, activities, onChanged }: {
  tripId: number;
  tripStart: string;
  tripEnd: string;
  activities: Activity[];
  onChanged: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  // Grupisanje po danu [FACT: spec §3.3]
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, act) => {
    const day = act.date.split('T')[0];
    (acc[day] ??= []).push(act);
    return acc;
  }, {});
  const sortedDays = Object.keys(grouped).sort();

  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleCreate = async (data: CreateActivityRequest) => {
    await activityService.create(tripId, data);
    setShowForm(false);
    await onChanged();
  };

  const handleUpdate = async (data: CreateActivityRequest) => {
    if (!editing) return;
    await activityService.update(tripId, editing.id, data);
    setEditing(null);
    await onChanged();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await activityService.remove(tripId, deleteTarget.id);
    setDeleteTarget(null);
    await onChanged();
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h3>Activities</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add activity</button>
      </div>

      {activities.length === 0 ? (
        <div className="card text-muted flex-center" style={{ padding: 'var(--space-6)' }}>
          No activities yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
          {sortedDays.map((day) => (
            <div key={day}>
              <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary)' }}>{formatDay(day)}</h4>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {grouped[day]
                  .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
                  .map((a) => (
                    <div key={a.id} className="card">
                      <div className="flex-between">
                        <div>
                          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                            {a.time && <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{a.time.substring(0, 5)}</span>}
                            <h4 style={{ fontSize: 'var(--font-size-base)' }}>{a.name}</h4>
                            <StatusChip status={a.status} />
                          </div>
                          {a.location && <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>📍 {a.location}</p>}
                          {a.description && <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>{a.description}</p>}
                          {a.estimatedCost > 0 && <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>Est. ${a.estimatedCost.toFixed(2)}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => setEditing(a)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(a)} style={{ color: 'var(--color-error)' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title="Add Activity" isOpen={showForm} onClose={() => setShowForm(false)}>
        <ActivityForm tripStart={tripStart} tripEnd={tripEnd} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal title="Edit Activity" isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing && <ActivityForm existing={editing} tripStart={tripStart} tripEnd={tripEnd} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete activity?"
        message={`Remove "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}