'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Dumbbell, House, NotebookPen, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TABS = [
  { href: '/anuncios', label: 'Inicio', icon: House, paths: ['/anuncios'] },
  { href: '/convocatorias', label: 'Gym', icon: Dumbbell, paths: ['/convocatorias', '/mis-asistencias'] },
  { href: '/rutinas', label: 'Rutinas', icon: NotebookPen, paths: ['/rutinas', '/mis-rutinas'] },
  { href: '/biblioteca-ejercicios', label: 'Ejercicios', icon: BookOpen, paths: ['/biblioteca-ejercicios'] },
];

const SECTION_TABS = {
  gym: [
    { href: '/convocatorias', label: 'Convocatorias' },
    { href: '/mis-asistencias', label: 'Mis asistencias' },
  ],
  rutinas: [
    { href: '/rutinas', label: 'Explorar rutinas' },
    { href: '/mis-rutinas', label: 'Mis rutinas' },
  ],
};

export default function StudentShell() {
  const pathname = usePathname();
  const section = SECTION_TABS.gym.some(tab => tab.href === pathname)
    ? SECTION_TABS.gym
    : SECTION_TABS.rutinas.some(tab => tab.href === pathname)
      ? SECTION_TABS.rutinas
      : null;

  return (
    <header className="gx-app-topbar">
      <div className="gx-app-topbar-inner">
        <Link href="/anuncios" className="gx-brand">
          <span className="gx-brand-mark"><Dumbbell size={18} strokeWidth={2.4} /></span>
          <span className="gx-brand-name">SchedMaster</span>
        </Link>
        <div className="gx-app-topbar-actions">
          <ThemeToggle />
          <Link href="/perfil" className="gx-btn gx-btn--icon gx-btn--outline" aria-label="Mi perfil">
            <User size={18} />
          </Link>
        </div>
      </div>

      <nav className="gx-app-tabs" aria-label="Secciones de alumno">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`gx-app-tab ${tab.paths.includes(pathname) ? 'is-active' : ''}`}
            aria-current={pathname === tab.href ? 'page' : undefined}
          >
            <tab.icon size={18} strokeWidth={2} aria-hidden="true" />
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
      {section && <nav className="gx-section-tabs" aria-label="Vistas de la sección">
        {section.map(tab => <Link
          key={tab.href}
          href={tab.href}
          className={`gx-section-tab ${pathname === tab.href ? 'is-active' : ''}`}
          aria-current={pathname === tab.href ? 'page' : undefined}
        >{tab.label}</Link>)}
      </nav>}
    </header>
  );
}
