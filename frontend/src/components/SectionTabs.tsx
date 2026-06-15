export type TripSection =
  | 'overview' | 'destinations' | 'activities'
  | 'budget' | 'checklist' | 'notes' | 'share';

const TABS: { key: TripSection; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'destinations', label: 'Destinations' },
  { key: 'activities', label: 'Activities' },
  { key: 'budget', label: 'Budget' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'notes', label: 'Notes' },
  { key: 'share', label: 'Share' },
];

export function SectionTabs({ active, onChange }: {
  active: TripSection;
  onChange: (s: TripSection) => void;
}) {
  return (
    <div style={{
      display: 'flex', gap: 'var(--space-1)',
      borderBottom: '1px solid var(--color-border)',
      marginBottom: 'var(--space-5)', overflowX: 'auto',
    }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 'var(--font-size-base)',
            fontWeight: 600, whiteSpace: 'nowrap',
            color: active === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: active === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}