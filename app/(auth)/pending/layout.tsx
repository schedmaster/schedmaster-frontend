'use client';

import SessionGuard from '../../components/SessionGuard';

export default function PendingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SessionGuard>{children}</SessionGuard>;
}
