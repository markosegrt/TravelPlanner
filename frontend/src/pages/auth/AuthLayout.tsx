import type { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--color-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-3)',
          }}>
            ✈
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>TravelPlanner</h1>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-1)' }}>{title}</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-5)' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}