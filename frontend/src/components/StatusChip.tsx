import { ActivityStatus, ActivityStatusLabels } from '../models/enums';

export function StatusChip({ status }: { status: ActivityStatus }) {
  const classMap: Record<ActivityStatus, string> = {
    [ActivityStatus.Planned]: 'chip-planned',
    [ActivityStatus.Reserved]: 'chip-reserved',
    [ActivityStatus.Completed]: 'chip-completed',
    [ActivityStatus.Cancelled]: 'chip-cancelled',
  };

  return (
    <span className={`chip ${classMap[status]}`}>
      {ActivityStatusLabels[status]}
    </span>
  );
}