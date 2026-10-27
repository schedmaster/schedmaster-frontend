'use client';

import { Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import StudentShell from '../../components/StudentShell';
import Reveal from '../../components/Reveal';
import { gxFontClass } from '../../styles/fonts';
import { apiFetch } from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

const getAnnouncementImageUrl = (fotografia?: string | null) => {
  if (!fotografia) return null;
  if (/^https?:\/\//i.test(fotografia) || fotografia.startsWith('/')) return fotografia;
  return `${BASE_URL}/imagenes/${fotografia}`;
};

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
    apiFetch('/anuncios')
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className={`gx-scope gx-app ${gxFontClass}`}>
      <StudentShell />

      <section className="gx-app-hero">
        <h1>Tablón del <span className="gx-grad-text">gimnasio</span></h1>
        <p>Mantente al tanto de los avisos y novedades de tu comunidad universitaria.</p>
      </section>

      <section className="gx-app-section">
        <div className="gx-app-section-label">
          <div>
            <span>Anuncios</span>
            <h2>Novedades recientes</h2>
          </div>
        </div>

        <div className="gx-announcement-grid">
          {anuncios.length === 0 ? (
            <p className="gx-announcement-empty">No hay anuncios disponibles</p>
          ) : (
            anuncios.map((a, i) => {
              const imageUrl = getAnnouncementImageUrl(a.fotografia);

              return (
                <Reveal as="div" key={a.id} delay={(i % 3) * 60} className="gx-card gx-card--hover gx-announcement-card">
                  <div className="gx-announcement-head">
                    <span className="gx-announcement-avatar"><Megaphone size={16} /></span>
                    <div>
                      <p className="gx-announcement-title">{a.titulo}</p>
                      <span className="gx-announcement-date">
                        {new Date(a.fecha_publicacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p>{a.descripcion}</p>

                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="anuncio"
                      className="gx-announcement-image"
                    />
                  )}
                </Reveal>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
