'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Users, CalendarDays, UserPlus, CalendarCheck,
  Megaphone, BarChart3, Settings, LayoutGrid, LogOut, Clock,
  Sun, Moon, X
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import BrandLogo from './BrandLogo';

interface AdminSidebarProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

const SIDEBAR_BREAKPOINT = 1200;

const NAV_ITEMS = [
  { href: '/dashboard',           icon: Home,          label: 'Dashboard'     },
  { href: '/admin-usuarios',      icon: Users,         label: 'Usuarios'      },
  { href: '/admin-horarios',      icon: Clock,         label: 'Horarios'      },
  { href: '/admin-convocatorias', icon: CalendarDays,  label: 'Convocatorias' },
  { href: '/admin-inscripciones', icon: UserPlus,      label: 'Inscripciones' },
  { href: '/admin-asistencias',   icon: CalendarCheck, label: 'Asistencias'   },
  { href: '/admin-anuncios',      icon: Megaphone,     label: 'Anuncios'      },
  { href: '/admin-estadisticas',  icon: BarChart3,     label: 'Reportes'      }, 
];

export default function AdminSidebar({
  userName     = 'Admin UTEQ',
  userRole     = 'Administrador',
  userInitials = 'AU',
}: Readonly<AdminSidebarProps>) {

  const [open, setOpen] = useState(false);
  const { darkMode, toggle } = useDarkMode();
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    router.push('/login');
  };

  useEffect(() => {
    const closeOnDesktop = () => {
      if (globalThis.window.innerWidth > SIDEBAR_BREAKPOINT) {
        setOpen(false);
      }
    };

    closeOnDesktop();

    globalThis.window.addEventListener('resize', closeOnDesktop);
    return () => globalThis.window.removeEventListener('resize', closeOnDesktop);
  }, []);

  return (
    <>
      <button
        className={`menu-toggle ${open ? 'is-hidden' : ''}`}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <LayoutGrid />
      </button>

      {open && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${open ? 'active' : ''}`}
      >
        <div className="sb-brand">
          <div className="sb-brand-text">
            <Link href="/dashboard" onClick={() => setOpen(false)}><BrandLogo className="sm-logo--sidebar" eager /></Link>
            <p>Panel de Administración</p>
            <button className="theme-switch" type="button" onClick={toggle}>
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span>{darkMode ? 'Oscuro' : 'Claro'}</span>
            </button>
          </div>

          <button className="sb-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''} onClick={() => setOpen(false)}>
              <Icon /> {label}
            </Link>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="avatar">{userInitials}</div>
            <div className="sb-user-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>
          </div>

          <button className="btn-logout" type="button" onClick={handleLogout}>
            <LogOut /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
