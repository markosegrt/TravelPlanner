import type { ReactNode } from 'react';

export function Modal({ title, isOpen, onClose, children }: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex-between mb-4">
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 20, lineHeight: 1, padding: '0 8px', cursor: 'pointer', border: 'none', background: 'none' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}