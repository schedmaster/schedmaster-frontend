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

interface AdminSidebarProps {
  userName?:     string;
  userRole?:     string;
  userInitials?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard',           icon: Home,          label: 'Dashboard'     },
  { href: '/admin-usuarios',      icon: Users,         label: 'Usuarios'      },
  { href: '/admin-horarios',      icon: Clock,         label: 'Horarios'      },
  { href: '/admin-convocatorias', icon: CalendarDays,  label: 'Convocatorias' },
  { href: '/admin-inscripciones', icon: UserPlus,      label: 'Inscripciones' },
  { href: '/admin-asistencias',   icon: CalendarCheck, label: 'Asistencias'   },
  { href: '/admin-anuncios',      icon: Megaphone,     label: 'Anuncios'      },
  { href: '/admin-estadisticas',  icon: BarChart3,     label: 'Estadísticas'  },
  { href: '/admin-configuracion', icon: Settings,      label: 'Configuración' },
];

export default function AdminSidebar({
  userName     = 'Admin UTEQ',
  userRole     = 'Administrador',
  userInitials = 'AU',
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggle } = useDarkMode();
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const query = window.matchMedia('(max-width: 980px)');

    const syncSidebarMode = () => {
      const mobile = query.matches;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };

    syncSidebarMode();
    query.addEventListener('change', syncSidebarMode);

    return () => query.removeEventListener('change', syncSidebarMode);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {!open && (
        isMobile && (
          <button className="menu-toggle" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <LayoutGrid />
          </button>
        )
      )}

      <aside
        className={`sidebar ${isMobile && open ? 'active' : ''}`}
        onClick={e => { if (isMobile && e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="sb-brand">
          <div className="sb-brand-main">
            <div className="sb-logo"><LayoutGrid /></div>
            <div className="sb-brand-text">
              <h1>SchedMaster</h1>
              <p>Panel de Administración</p>
              <div className="theme-switch" onClick={toggle}>
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>{darkMode ? 'Oscuro' : 'Claro'}</span>
              </div>
            </div>
          </div>

          {isMobile && (
            <button className="sb-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="nav" onClick={() => { if (isMobile) setOpen(false); }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
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