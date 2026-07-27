import { RoleGuard } from '@/components/role-guard';

export default function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={['admin', 'investigator']}>{children}</RoleGuard>;
}
