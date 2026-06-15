import { useState } from 'react';
import type { Destination, CreateDestinationRequest } from '../../models/Destination';
import { destinationService } from '../../services/destinationService';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';
import { DestinationForm } from './DestinationForm';

export function DestinationsSection({ tripId, tripStart, tripEnd, destinations, onChanged }: {
  tripId: number;
  tripStart: string;
  tripEnd: string;
  destinations: Destination[];
  onChanged: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleCreate = async (data: CreateDestinationRequest) => {
    await destinationService.create(tripId, data);
    setShowForm(false);
    await onChanged();
  };

  const handleUpdate = async (data: CreateDestinationRequest) => {
    if (!editing) return;
    await destinationService.update(tripId, editing.id, data);
    setEditing(null);
    await onChanged();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await destinationService.remove(tripId, deleteTarget.id);
    setDeleteTarget(null);
    await onChanged();
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h3>Destinations</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add destination</button>
      </div>

      {destinations.length === 0 ? (
        <div className="card text-muted flex-center" style={{ padding: 'var(--space-6)' }}>
          No destinations yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {destinations.map((d) => (
            <div key={d.id} className="card">
              <div className="flex-between">
                <div>
                  <h4>{d.name}</h4>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{d.location}</p>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                    {formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}
                  </p>
                  {d.notes && <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>{d.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(d)}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(d)} style={{ color: 'var(--color-error)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        <Modal title="Add Destination" isOpen={showForm} onClose={() => setShowForm(false)}>
            <DestinationForm
            tripStart={tripStart}
            tripEnd={tripEnd}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            />
        </Modal>

        <Modal title="Edit Destination" isOpen={!!editing} onClose={() => setEditing(null)}>
            {editing && (
            <DestinationForm
                existing={editing}
                tripStart={tripStart}
                tripEnd={tripEnd}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
            />
            )}
        </Modal>

        <ConfirmDialog
            isOpen={!!deleteTarget}
            title="Delete destination?"
            message={`Remove "${deleteTarget?.name}" from this trip?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}