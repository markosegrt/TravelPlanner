// Enumi kao const objekti 

export const UserRole = {
  User: 0,
  Admin: 1,
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ActivityStatus = {
  Planned: 0,
  Reserved: 1,
  Completed: 2,
  Cancelled: 3,
} as const;
export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

export const ExpenseCategory = {
  Transport: 0,
  Accommodation: 1,
  Food: 2,
  Tickets: 3,
  Shopping: 4,
  Other: 5,
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const AccessLevel = {
  View: 0,
  Edit: 1,
} as const;
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.Planned]: 'Planned',
  [ActivityStatus.Reserved]: 'Reserved',
  [ActivityStatus.Completed]: 'Completed',
  [ActivityStatus.Cancelled]: 'Cancelled',
};

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Transport]: 'Transport',
  [ExpenseCategory.Accommodation]: 'Accommodation',
  [ExpenseCategory.Food]: 'Food',
  [ExpenseCategory.Tickets]: 'Tickets',
  [ExpenseCategory.Shopping]: 'Shopping',
  [ExpenseCategory.Other]: 'Other',
};