'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Apple, Sparkles, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import AlertModal from '../../components/AlertModal';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const { darkMode, toggle } = useDarkMode();
  const router = useRouter();

  const images = [
    '/gimnasio1.jpeg',
    '/gimnasio2.jpeg',
    '/gimnasio3.jpeg',
    '/gimnasio4.jpeg',
    '/gimnasio5.jpeg',
  ];

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);

  // 🔥 VALIDAR CONVOCATORIA ANTES
  const handleQuieroEntrenar = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/convocatoria-activa`);
      const data = await res.json();

      if (res.ok && data.activa) {
        router.push(`/convocatoria-activa?data=${encodeURIComponent(JSON.stringify(data.periodo))}`);
        return;
      }

      // 👉 si no hay convocatoria
      setOpenModal(true);

    } catch {
      setAlertMessage('Error al verificar la convocatoria');
      setAlertOpen(true);
    }
  };

  // 👉 submit lista de espera
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lista-espera`, {
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
        setAlertMessage(data.message || 'Error');
        setAlertOpen(true);
        return;
      }

      setSent(true);

    } catch {
      setAlertMessage('Error de conexión');
      setAlertOpen(true);
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          {/* 🌙 BOTÓN DARK MODE */}
          <button className="dark-toggle" onClick={toggle} aria-label="Cambiar tema">
            {mounted ? (
              darkMode ? <Moon size={18} /> : <Sun size={18} />
            ) : (
              <span style={{ width: 18, height: 18 }} />
            )}
          </button>

          <Link href="/login" className="btn btn--dark">
            Iniciar sesión
          </Link>
        </div>
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
            onClick={handleQuieroEntrenar}
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

            <button className="carousel-btn left" onClick={prevImg}>
              <ChevronLeft size={22} />
            </button>

            <div className="carousel-wrapper">
              <img src={images[currentImg]} className="carousel-img" />
            </div>

            <button className="carousel-btn right" onClick={nextImg}>
              <ChevronRight size={22} />
            </button>

            <div className="carousel-dots">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImg ? 'active' : ''}`}
                  onClick={() => setCurrentImg(index)}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="services-section">
        <strong>Servicios</strong>
        <h2>Selecciona un servicio</h2>

        <div className="services-grid">
          <button className="service-card" onClick={handleQuieroEntrenar}>
            <Dumbbell size={28} />
            <h3>Gimnasio</h3>
            <p>Reserva tu horario</p>
          </button>

          <Link href="/nutricion" className="service-card disabled">
            <Apple size={28} />
            <h3>Enfermería</h3>
            <p>Próximamente</p>
          </Link>

          <div className="service-card disabled">
            <Sparkles size={28} />
            <h3>Próximamente</h3>
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
                <p>Déjanos tu correo y te avisamos.</p>

                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button className="btn btn--blue btn--full">Notificarme</button>
                </form>
              </>
            ) : (
              <div>
                <h3>Registro confirmado</h3>
                <p>Te avisaremos.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <AlertModal
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

    </div>
  );
}