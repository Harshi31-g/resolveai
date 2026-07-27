import { RoleGuard } from '@/components/role-guard';

export default function AIInvestigatorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={['admin', 'investigator']}>{children}</RoleGuard>;
}
