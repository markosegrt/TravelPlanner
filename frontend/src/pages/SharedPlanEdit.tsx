import { useState } from 'react';
import type { SharedPlan } from '../models/Share';
import type { Destination, CreateDestinationRequest } from '../models/Destination';
import type { Activity, CreateActivityRequest } from '../models/Activity';
import type { ChecklistItem } from '../models/ChecklistItem';
import { ActivityStatusLabels } from '../models/enums';
import { shareService } from '../services/shareService';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DestinationForm } from '../components/sections/DestinationForm';
import { ActivityForm } from '../components/sections/ActivityForm';

export function SharedPlanEdit({ token, plan, onChanged }: {
  token: string;
  plan: SharedPlan;
  onChanged: () => Promise<void>;
}) {
  const trip = plan.trip;

  // Destinations state
  const [showDestForm, setShowDestForm] = useState(false);
  const [editDest, setEditDest] = useState<Destination | null>(null);
  const [delDest, setDelDest] = useState<Destination | null>(null);

  // Activities state
  const [showActForm, setShowActForm] = useState(false);
  const [editAct, setEditAct] = useState<Activity | null>(null);
  const [delAct, setDelAct] = useState<Activity | null>(null);

  // Checklist state
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [delItem, setDelItem] = useState<ChecklistItem | null>(null);

  // Notes state
  const [notes, setNotes] = useState(trip.generalNotes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // ===== Destination handlers =====
  const createDest = async (data: CreateDestinationRequest) => {
    await shareService.createDestination(token, data);
    setShowDestForm(false);
    await onChanged();
  };
  const updateDest = async (data: CreateDestinationRequest) => {
    if (!editDest) return;
    await shareService.updateDestination(token, editDest.id, data);
    setEditDest(null);
    await onChanged();
  };
  const deleteDest = async () => {
    if (!delDest) return;
    await shareService.deleteDestination(token, delDest.id);
    setDelDest(null);
    await onChanged();
  };

  // ===== Activity handlers =====
  const createAct = async (data: CreateActivityRequest) => {
    await shareService.createActivity(token, data);
    setShowActForm(false);
    await onChanged();
  };
  const updateAct = async (data: CreateActivityRequest) => {
    if (!editAct) return;
    await shareService.updateActivity(token, editAct.id, data);
    setEditAct(null);
    await onChanged();
  };
  const deleteAct = async () => {
    if (!delAct) return;
    await shareService.deleteActivity(token, delAct.id);
    setDelAct(null);
    await onChanged();
  };

  // ===== Checklist handlers =====
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAddingItem(true);
    try {
      await shareService.createChecklistItem(token, { name: newItem.trim() });
      setNewItem('');
      await onChanged();
    } finally {
      setAddingItem(false);
    }
  };
  const toggleItem = async (item: ChecklistItem) => {
    await shareService.updateChecklistItem(token, item.id, {
      name: item.name,
      isCompleted: !item.isCompleted,
    });
    await onChanged();
  };
  const deleteItem = async () => {
    if (!delItem) return;
    await shareService.deleteChecklistItem(token, delItem.id);
    setDelItem(null);
    await onChanged();
  };

  // ===== Notes handler =====
  const saveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await shareService.updateNotes(token, notes);
      setNotesSaved(true);
      await onChanged();
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  };

  // Grupisanje aktivnosti po danu
  const grouped = trip.activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const day = a.date.split('T')[0];
    (acc[day] ??= []).push(a);
    return acc;
  }, {});
  const sortedDays = Object.keys(grouped).sort();

  const notesDirty = notes !== (trip.generalNotes ?? '');
  const completedCount = trip.checklistItems.filter((i) => i.isCompleted).length;

  return (
    <>
      {/* ===== DESTINATIONS ===== */}
      <div className="card">
        <div className="flex-between mb-4">
          <h4>Destinations</h4>
          <button className="btn btn-primary btn-sm" onClick={() => setShowDestForm(true)}>+ Add</button>
        </div>
        {trip.destinations.length === 0 ? (
          <p className="text-muted">No destinations yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {trip.destinations.map((d) => (
              <div key={d.id} className="flex-between" style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <strong>{d.name}</strong> — <span className="text-muted">{d.location}</span>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}</p>
                  {d.notes && <p style={{ fontSize: 'var(--font-size-sm)' }}>{d.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditDest(d)}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDelDest(d)} style={{ color: 'var(--color-error)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== ACTIVITIES ===== */}
      <div className="card">
        <div className="flex-between mb-4">
          <h4>Activities</h4>
          <button className="btn btn-primary btn-sm" onClick={() => setShowActForm(true)}>+ Add</button>
        </div>
        {trip.activities.length === 0 ? (
          <p className="text-muted">No activities yet.</p>
        ) : (
          sortedDays.map((day) => (
            <div key={day} style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              {grouped[day].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')).map((a) => (
                <div key={a.id} className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
                  <div>
                    {a.time && <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{a.time.substring(0, 5)} · </span>}
                    <span>{a.name}</span>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}> ({ActivityStatusLabels[a.status]})</span>
                    {a.location && <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}> · 📍 {a.location}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => setEditAct(a)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDelAct(a)} style={{ color: 'var(--color-error)' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* ===== CHECKLIST ===== */}
      <div className="card">
        <div className="flex-between mb-4">
          <h4>Checklist</h4>
          {trip.checklistItems.length > 0 && (
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              {completedCount} / {trip.checklistItems.length} done
            </span>
          )}
        </div>

        <form onSubmit={addItem} className="flex gap-2 mb-4">
          <input
            className="form-input"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item (e.g. Passport)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={addingItem || !newItem.trim()}>Add</button>
        </form>

        {trip.checklistItems.length === 0 ? (
          <p className="text-muted">No checklist items yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {trip.checklistItems.map((item) => (
              <div key={item.id} className="flex-between" style={{ opacity: item.isCompleted ? 0.6 : 1 }}>
                <label className="flex gap-3" style={{ alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleItem(item)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{
                    textDecoration: item.isCompleted ? 'line-through' : 'none',
                    color: item.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                  }}>
                    {item.name}
                  </span>
                </label>
                <button className="btn btn-ghost btn-sm" onClick={() => setDelItem(item)} style={{ color: 'var(--color-error)' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== NOTES ===== */}
      <div className="card">
        <div className="flex-between mb-4">
          <h4>Notes</h4>
          {notesSaved && <span className="text-success" style={{ fontSize: 'var(--font-size-sm)' }}>✓ Saved</span>}
        </div>
        <textarea
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write any notes about this trip..."
          style={{ minHeight: 150, marginBottom: 'var(--space-4)' }}
        />
        <div className="flex" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={saveNotes} disabled={savingNotes || !notesDirty}>
            {savingNotes ? 'Saving...' : 'Save notes'}
          </button>
        </div>
      </div>

      {/* ===== Destination modals ===== */}
      <Modal title="Add Destination" isOpen={showDestForm} onClose={() => setShowDestForm(false)}>
        <DestinationForm tripStart={trip.startDate} tripEnd={trip.endDate} onSubmit={createDest} onCancel={() => setShowDestForm(false)} />
      </Modal>
      <Modal title="Edit Destination" isOpen={!!editDest} onClose={() => setEditDest(null)}>
        {editDest && <DestinationForm existing={editDest} tripStart={trip.startDate} tripEnd={trip.endDate} onSubmit={updateDest} onCancel={() => setEditDest(null)} />}
      </Modal>
      <ConfirmDialog isOpen={!!delDest} title="Delete destination?" message={`Remove "${delDest?.name}"?`} onConfirm={deleteDest} onCancel={() => setDelDest(null)} />

      {/* ===== Activity modals ===== */}
      <Modal title="Add Activity" isOpen={showActForm} onClose={() => setShowActForm(false)}>
        <ActivityForm tripStart={trip.startDate} tripEnd={trip.endDate} onSubmit={createAct} onCancel={() => setShowActForm(false)} />
      </Modal>
      <Modal title="Edit Activity" isOpen={!!editAct} onClose={() => setEditAct(null)}>
        {editAct && <ActivityForm existing={editAct} tripStart={trip.startDate} tripEnd={trip.endDate} onSubmit={updateAct} onCancel={() => setEditAct(null)} />}
      </Modal>
      <ConfirmDialog isOpen={!!delAct} title="Delete activity?" message={`Remove "${delAct?.name}"?`} onConfirm={deleteAct} onCancel={() => setDelAct(null)} />

      {/* ===== Checklist confirm ===== */}
      <ConfirmDialog isOpen={!!delItem} title="Delete item?" message={`Remove "${delItem?.name}"?`} onConfirm={deleteItem} onCancel={() => setDelItem(null)} />
    </>
  );
}