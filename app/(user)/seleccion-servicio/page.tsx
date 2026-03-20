'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Apple, Sparkles, X } from 'lucide-react';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const router = useRouter();

  const images = [
    '/gimnasio1.jpeg',
    '/gimnasio2.jpg',
    '/gimnasio3.jpg',
    '/gimnasio4.jpg',
  ];

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lista-espera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email }),
      });

      const data = await res.json();

      if (res.status === 409 && data.message === 'convocatoria_activa') {
        router.push(`/convocatoria-activa?data=${encodeURIComponent(JSON.stringify(data.periodo))}`);
        return;
      }

      if (!res.ok) {
        alert(data.message || 'Error');
        return;
      }

      setSent(true);
    } catch {
      alert('Error de conexión');
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setSent(false);
    setEmail('');
  };

  return (
    <div className="home-page">

      {/* HEADER */}
      <header className="home-header">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" />
          <span>SchedMaster</span>
        </div>
        <Link href="/login" className="btn btn--dark">Iniciar sesión</Link>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <Dumbbell />
          </div>

          <h1 className="hero-title">
            Transforma tu <span className="highlight">cuerpo y mente</span>
          </h1>

          <p className="hero-subtitle">
            Accede al gimnasio universitario y mejora tu bienestar cada día.
          </p>

          <button
            className="btn btn--blue btn--lg"
            onClick={() => setOpenModal(true)}
          >
            Quiero entrenar
          </button>
        </div>
      </section>

      {/* INFO */}
      <section className="services-section">
        <strong>Sobre el gimnasio</strong>
        <h2>Gimnasio universitario</h2>
        <p className="muted">
          Nuestras instalaciones están diseñadas para brindarte un espacio completo de entrenamiento.
          Las convocatorias se abren cada cuatrimestre para que puedas formar parte.
        </p>
      </section>

      {/* BENEFICIOS */}
      <section className="services-section">
        <strong>Beneficios</strong>
        <h2>¿Por qué entrenar aquí?</h2>

        <div className="services-grid">
          <div className="service-card">💪 Mejora tu condición física</div>
          <div className="service-card">🧠 Reduce el estrés</div>
          <div className="service-card">⚡ Aumenta tu energía</div>
          <div className="service-card">🏫 Instalaciones universitarias</div>
        </div>
      </section>

      {/* CARRUSEL */}
      <section className="services-section">
        <strong>Instalaciones</strong>
        <h2>Conoce el gimnasio</h2>

        <div className="card--glass">
          <div className="carousel">
            <button onClick={prevImg}>◀</button>
            <img src={images[currentImg]} className="carousel-img" />
            <button onClick={nextImg}>▶</button>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="services-section">
        <strong>Servicios</strong>
        <h2>Selecciona un servicio</h2>

        <div className="services-grid">
          <button className="service-card" onClick={() => setOpenModal(true)}>
            <div className="service-icon"><Dumbbell size={28} /></div>
            <h3>Gimnasio</h3>
            <p>Reserva tu horario de entrenamiento</p>
          </button>

          <Link href="/nutricion" className="service-card disabled">
            <div className="service-icon"><Apple size={28} /></div>
            <h3>Enfermería</h3>
            <p>Próximamente</p>
          </Link>

          <div className="service-card disabled">
            <div className="service-icon"><Sparkles size={28} /></div>
            <h3>Próximamente</h3>
            <p>Nuevos talleres en camino</p>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {openModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>

            {!sent ? (
              <>
                <h2>Convocatoria cerrada</h2>
                <p>Déjanos tu correo y te avisaremos cuando se abra.</p>

                <form onSubmit={handleSubmit} className="modal-form">
                  <input
                    type="email"
                    placeholder="tucorreo@uteq.edu.mx"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />

                  <button className="btn btn--blue btn--full btn--lg">
                    Notificarme
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <h3>Registro confirmado</h3>
                <p>Te notificaremos cuando se habilite.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}