'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, clearSession, getToken } from '../lib/api';

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

export default function SessionGuard({ children, allowedRoles, excludePaths = [] }: Readonly<SessionGuardProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const roleKey = allowedRoles?.join(',') || '';
  const excludeKey = excludePaths.join(',');

  useEffect(() => {
    if (excludeKey.split(',').includes(pathname)) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser || !getToken()) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(rawUser) as SessionUser;
      if (!user?.id_usuario || !user?.id_rol) {
        clearSession();
        router.replace('/login');
        return;
      }

      if (roleKey && !roleKey.split(',').map(Number).includes(user.id_rol)) {
        router.replace(getDefaultRouteByRole(user.id_rol));
        return;
      }

      const response = await apiFetch('/auth/me');
      if (!response.ok) {
        clearSession();
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (data.status !== 'approved') {
        router.replace('/pending');
        return;
      }
      localStorage.setItem('user', JSON.stringify(data.usuario));
      if (data.token) localStorage.setItem('sessionToken', data.token);
      if (!cancelled) setIsAuthorized(true);
    } catch (error) {
      console.error('Error validando sesion:', error);
      clearSession();
      router.replace('/login');
    } finally {
      if (!cancelled) setIsChecking(false);
    }
    };
    void check();
    return () => { cancelled = true; };
  }, [roleKey, excludeKey, pathname, router]);

  if (isChecking) {
    return <div className="loader">Validando sesión...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
