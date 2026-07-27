import type { UserRole } from './types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  investigator: 'Investigator',
  merchant: 'Merchant',
  cardmember: 'Card Member',
};
