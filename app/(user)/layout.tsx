'use client';

import SessionGuard from '../components/SessionGuard';

export default function UserGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionGuard
      allowedRoles={[1, 2]}
      excludePaths={['/seleccion-servicio', '/convocatoria-activa']}
    >
      {children}
    </SessionGuard>
  );
}
