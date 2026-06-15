import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import type { TripDetail } from '../models/Trip';
import { Navbar } from '../components/Navbar';
import { SectionTabs, type TripSection } from '../components/SectionTabs';
import { BudgetSummaryWidget } from '../components/BudgetSummaryWidget';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DestinationsSection } from '../components/sections/DestinationsSection';
import { ActivitiesSection } from '../components/sections/ActivitiesSection';
import { BudgetSection } from '../components/sections/BudgetSection';
import { ChecklistSection } from '../components/sections/ChecklistSection';
import { NotesSection } from '../components/sections/NotesSection';
import { ShareSection } from '../components/sections/ShareSection';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState<TripSection>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadTrip = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripService.getById(tripId);
      setTrip(data);
    } catch {
      setError('Failed to load trip.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const handleDeleteTrip = async () => {
    try {
      await tripService.remove(tripId);
      navigate('/');
    } catch {
      setError('Failed to delete trip.');
      setConfirmDelete(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container flex-center" style={{ padding: 'var(--space-8)' }}>
          <div className="spinner" />
        </div>
      </>
    );
  }

  if (error || !trip) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="alert alert-error">{error || 'Trip not found.'}</div>
          <button className="btn btn-outline" onClick={() => navigate('/')}>← Back to trips</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        {/* Header */}
        <button className="btn-ghost mb-4" onClick={() => navigate('/')} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'var(--color-text-muted)' }}>
          ← Back to trips
        </button>

        <div className="flex-between mb-4">
          <div>
            <h1>{trip.name}</h1>
            <p className="text-muted">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
            Delete trip
          </button>
        </div>

        <SectionTabs active={section} onChange={setSection} />

        {/* OVERVIEW */}
        {section === 'overview' && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <BudgetSummaryWidget summary={trip.budgetSummary} />

            <div className="card">
              <h4 style={{ marginBottom: 'var(--space-3)' }}>Trip Details</h4>
              {trip.description && (
                <p style={{ marginBottom: 'var(--space-3)' }}>{trip.description}</p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Destinations</p>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{trip.destinations.length}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Activities</p>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{trip.activities.length}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Expenses</p>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{trip.expenses.length}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Checklist items</p>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{trip.checklistItems.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {section === 'destinations' && (
          <DestinationsSection
            tripId={trip.id}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
            destinations={trip.destinations}
            onChanged={loadTrip}
          />
        )}
        {section === 'activities' && (
          <ActivitiesSection
            tripId={trip.id}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
            activities={trip.activities}
            onChanged={loadTrip}
          />
        )}
        {section === 'budget' && (
          <BudgetSection
            tripId={trip.id}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
            expenses={trip.expenses}
            summary={trip.budgetSummary}
            onChanged={loadTrip}
          />
        )}
        {section === 'checklist' && (
          <ChecklistSection
            tripId={trip.id}
            items={trip.checklistItems}
            onChanged={loadTrip}
          />
        )}
        {section === 'notes' && (
          <NotesSection trip={trip} onChanged={loadTrip} />
        )}
        {section === 'share' && (
          <ShareSection tripId={trip.id} tripName={trip.name} />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete trip?"
        message="This will permanently delete the trip and all related destinations, activities, expenses, and checklist items."
        onConfirm={handleDeleteTrip}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}