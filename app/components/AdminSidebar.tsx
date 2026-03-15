'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import {
  Home,
  Users,
  CalendarDays,
  UserPlus,
  CalendarCheck,
  Megaphone,
  BarChart3,
  Settings, 
  LayoutGrid, 
  LogOut,
  Clock // 👈 1. Importamos el ícono del reloj para los horarios
} from 'lucide-react';

interface AdminSidebarProps {
  userName?:     string;
  userRole?:     string;
  userInitials?: string;
}

// 👈 2. Agregamos "Horarios" al arreglo (lo puse debajo de Usuarios)
const NAV_ITEMS = [
  { href: '/dashboard',            icon: Home,          label: 'Dashboard'       },
  { href: '/admin-usuarios',       icon: Users,         label: 'Usuarios'        },
  { href: '/admin-horarios',       icon: Clock,         label: 'Horarios'        }, // NUEVO 
  { href: '/admin-convocatorias',  icon: CalendarDays,  label: 'Convocatorias'   },
  { href: '/admin-inscripciones',  icon: UserPlus,      label: 'Inscripciones'   },
  { href: '/admin-asistencias',    icon: CalendarCheck, label: 'Asistencias'     },
  { href: '/admin-anuncios',       icon: Megaphone,     label: 'Anuncios'        },
  { href: '/admin-estadisticas',   icon: BarChart3,     label: 'Estadísticas'    },
  { href: '/admin-configuracion',  icon: Settings,      label: 'Configuración'   },
];

export default function AdminSidebar({
  userName     = 'Admin UTEQ',
  userRole     = 'Administrador',
  userInitials = 'AU',
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); 

  // 🚪 Lógica independiente de Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {!open && (
        <button className="menu-toggle" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <LayoutGrid />
        </button>
      )}

      <aside className={`sidebar ${open ? 'active' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>

        <div className="sb-brand">
          <div className="sb-logo"><LayoutGrid /></div>
          <div className="sb-brand-text">
            <h1>SchedMaster</h1>
            <p>Panel de Administración</p>
          </div>
        </div>

        <nav className="nav" onClick={() => setOpen(false)}>
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
          {/* 🚨 Conectamos el botón directamente a nuestra función local */}
          <button className="btn-logout" type="button" onClick={handleLogout}>
            <LogOut /> Cerrar sesión
          </button>
        </div>

      </aside>
    </>
  );
}