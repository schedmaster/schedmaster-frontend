'use client';

import Link from 'next/link';
import { Dumbbell, Apple, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

interface Anuncio {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  fotografia?: string;
  fecha_publicacion: string;
}

export default function HomeUserPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/anuncios`)
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" />
          <span>SchedMaster</span>
        </div>
        <Link href="/perfil" className="btn-login" style={{ padding: '10px 14px' }}>
          <User size={22} />
        </Link>
      </header>

      <section className="home-hero">
        <h1>Reserva tu <span className="highlight">bienestar</span></h1>
        <p>Elige el servicio que deseas y comienza tu experiencia saludable.</p>
      </section>

      <section className="services-section">
        <strong>Servicios</strong>
        <h2>Selecciona un servicio</h2>
        <div className="services-grid">
          <button className="service-card">
            <div className="service-icon"><Dumbbell size={28} /></div>
            <h3>Gimnasio</h3>
            <p>Reserva tu horario de entrenamiento</p>
          </button>
          <div className="service-card disabled">
            <div className="service-icon"><Apple size={28} /></div>
            <h3>Enfermería</h3>
            <p>Próximamente</p>
          </div>
          <div className="service-card disabled">
            <div className="service-icon"><Sparkles size={28} /></div>
            <h3>Próximamente</h3>
            <p>Nuevos talleres en camino</p>
          </div>
        </div>
      </section>

      <section className="tips-section">
        <strong>Consejos para ti</strong>
        <div className="tips-grid">
          <div className="tip-card">Mantente hidratado durante tu entrenamiento</div>
          <div className="tip-card">Incluye verduras en cada comida</div>
          <div className="tip-card">Dormir bien mejora tu rendimiento físico</div>
        </div>
      </section>

      <section className="tips-section">
        <strong>Anuncios</strong>
        <h2>Tablón del gimnasio</h2>

        <div className="tips-grid announcements-grid">
          {anuncios.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No hay anuncios disponibles</p>
          ) : (
            anuncios.map((a) => (
              <div className="card" key={a.id}>
                <div className="support-item">
                  <div className="state">SM</div>
                  <div>
                    <p className="announcement-title">
                      {a.titulo}
                    </p>
                    <small className="announcement-date">
                      {new Date(a.fecha_publicacion).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <p className="message">
                  {a.descripcion}
                </p>

                {a.fotografia && (
                  <img
                    src={`${BASE_URL}/imagenes/${a.fotografia}`}
                    alt="anuncio"
                    className="announcement-image"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}