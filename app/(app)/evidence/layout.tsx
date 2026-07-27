import { RoleGuard } from '@/components/role-guard';

export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={['admin', 'investigator', 'merchant']}>{children}</RoleGuard>;
}
