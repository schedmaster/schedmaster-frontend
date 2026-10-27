'use client';

import SessionGuard from '../components/SessionGuard';

export default function AdminGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SessionGuard allowedRoles={[3, 4]}><div className="admin-workspace">{children}</div></SessionGuard>;
}
