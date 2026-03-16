'use client';

import { User, Calendar, Clock, Home, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function PerfilPage() {
  const router = useRouter();
  const { darkMode, toggle } = useDarkMode();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" />
          <span>SchedMaster</span>
        </div>
        <Link href="/home" className="btn-login">
          <Home size={18} /> Inicio
        </Link>
      </header>

      <section className="home-hero">
        <h1>Mi perfil</h1>
        <p>Consulta tu información y tu inscripción actual</p>
      </section>

      <section className="services-section">
        <div className="services-grid">

          <div className="card">
            <div className="card-header">
              <User size={20} />
              <span>Información personal</span>
            </div>
            <div className="form-row form-row-wrap">
              <div className="form-group">
                <span className="input-label">Nombre</span>
                <p>Ana López García</p>
              </div>
              <div className="form-group">
                <span className="input-label">Correo</span>
                <p>ana.lopez@uteq.edu.mx</p>
              </div>
              <div className="form-group">
                <span className="input-label">Carrera</span>
                <p>Ingeniería en Software</p>
              </div>
              <div className="form-group">
                <span className="input-label">División</span>
                <p>TIC</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Calendar size={20} />
              <span>Periodo inscrito</span>
            </div>
            <p className="message">Periodo Enero - Abril 2026</p>
            <div className="status">Activo</div>
          </div>

          <div className="card">
            <div className="card-header">
              <Clock size={20} />
              <span>Horario asignado</span>
            </div>
            <div className="tip-card">
              <p><strong>Día:</strong> Lunes y Miércoles</p>
              <p className="tip-card-hour"><strong>Hora:</strong> 18:00 - 19:00</p>
            </div>
          </div>

        </div>

        {/* Botones debajo de los cards */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '40px',
          paddingBottom: '60px',
        }}>
          <button className="dark-toggle" onClick={toggle} aria-label="Cambiar tema">
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="btn btn--outline" onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

      </section>
    </div>
  );
}