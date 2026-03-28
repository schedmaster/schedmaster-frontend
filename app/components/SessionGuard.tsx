'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type SessionUser = {
  id_usuario?: number;
  id_rol?: number;
};

interface SessionGuardProps {
  children: React.ReactNode;
  allowedRoles?: number[];
  excludePaths?: string[];
}

function getDefaultRouteByRole(role?: number) {
  if (role === 3 || role === 4) return '/dashboard';
  if (role === 1 || role === 2) return '/anuncios';
  return '/login';
}

export default function SessionGuard({ children, allowedRoles, excludePaths = [] }: SessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (excludePaths.includes(pathname)) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(rawUser) as SessionUser;
      if (!user?.id_usuario || !user?.id_rol) {
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.id_rol)) {
        router.replace(getDefaultRouteByRole(user.id_rol));
        return;
      }

      setIsAuthorized(true);
    } catch {
      localStorage.removeItem('user');
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  }, [allowedRoles, excludePaths, pathname, router]);

  if (isChecking) {
    return <div className="loader">Validando sesión...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
