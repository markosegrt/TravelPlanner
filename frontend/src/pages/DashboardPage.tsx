import { useState, useEffect } from 'react';
import { tripService } from '../services/tripService';
import type { Trip, CreateTripRequest } from '../models/Trip';
import { Navbar } from '../components/Navbar';
import { TripCard } from '../components/TripCard';
import { Modal } from '../components/Modal';
import { CreateTripForm } from '../components/CreateTripForm';

export function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripService.getAll();
      setTrips(data);
    } catch {
      setError('Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateTripRequest) => {
    await tripService.create(data);
    setShowCreate(false);
    await loadTrips();
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="flex-between mb-4">
          <h1>My Trips</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create New Trip
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 20 }} />
                <div className="skeleton" style={{ height: 6, width: '100%' }} />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="card flex-center" style={{ flexDirection: 'column', padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🌍</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No trips yet</h3>
            <p className="text-muted mb-4">Start planning your first adventure.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Create New Trip
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      <Modal title="Create New Trip" isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <CreateTripForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>
    </>
  );
}