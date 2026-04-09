'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, Clock, Home, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../../hooks/useDarkMode';
import AvisoPrivacidadModal from "@/app/components/AvisoPrivacidadModal"; 

interface User {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  estadoInscripcion?: string;

  carrera?: {
    nombre_carrera: string;
  };

  division?: {
    nombre_division: string;
  };

  ultimaInscripcion?: {
    horario?: {
      hora_inicio: string;
      hora_fin: string;
      periodo?: {
        nombre_periodo: string;
      };
      horarioDias?: {
        dia: {
          nombre: string;
        };
      }[];
    };
  };
}

export default function PerfilPage() {
  const router = useRouter();
  const { darkMode, toggle } = useDarkMode();

  const [user, setUser] = useState<User | null>(null);
  const [showAviso, setShowAviso] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
    } else {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando perfil...</p>;
  }

  const inscripcion = user.ultimaInscripcion;
  const horario = inscripcion?.horario;

  const dias = horario?.horarioDias
    ?.map(hd => hd.dia.nombre)
    .join(', ');

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" />
          <span>SchedMaster</span>
        </div>
        <Link href="/anuncios" className="btn-login">
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
              <UserIcon size={20} />
              <span>Información personal</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <span className="input-label">Nombre</span>
                <p>{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</p>
              </div>

              <div className="form-group">
                <span className="input-label">Correo</span>
                <p>{user.correo}</p>
              </div>

              <div className="form-group">
                <span className="input-label">Carrera</span>
                <p>{user.carrera?.nombre_carrera || 'No asignada'}</p>
              </div>

              <div className="form-group">
                <span className="input-label">División</span>
                <p>{user.division?.nombre_division || 'No asignada'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Calendar size={20} />
              <span>Periodo inscrito</span>
            </div>

            <p className="message">
              {horario?.periodo?.nombre_periodo || 'Sin periodo'}
            </p>

            <div className="status">
              {user.estadoInscripcion === 'aprobado' ? 'Activo' : 'Pendiente'}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Clock size={20} />
              <span>Horario asignado</span>
            </div>

            <div className="tip-card">
              <p><strong>Día:</strong> {dias || 'No disponible'}</p>
              <p className="tip-card-hour">
                <strong>Hora:</strong>{' '}
                {horario
                  ? `${horario.hora_inicio} - ${horario.hora_fin}`
                  : 'No disponible'}
              </p>
            </div>
          </div>

        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '40px',
          paddingBottom: '60px',
        }}>

          <button className="dark-toggle" onClick={toggle} aria-label="Cambiar tema">
            {mounted ? (
              darkMode ? <Moon size={18} /> : <Sun size={18} />
            ) : (
              <span style={{ width: 18, height: 18, display: 'inline-block' }} />
            )}
          </button>

          <button 
            className="btn btn--outline"
            onClick={() => setShowAviso(true)}
          >
            Aviso de privacidad
          </button>

          <button className="btn btn--outline" onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

      </section>

      <AvisoPrivacidadModal 
        open={showAviso} 
        onClose={() => setShowAviso(false)} 
      />

    </div>
  );
}