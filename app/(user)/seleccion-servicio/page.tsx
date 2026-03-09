'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Apple, Sparkles, X } from 'lucide-react';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [email,     setEmail]     = useState('');
  const [sent,      setSent]      = useState(false);
  const router = useRouter();

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
      if (!res.ok) { alert(data.message || 'Error'); return; }
      setSent(true);
    } catch { alert('Error de conexión'); }
  };

  const closeModal = () => { setOpenModal(false); setSent(false); setEmail(''); };

  return (
    <div className="home-page">

      <header className="home-header">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" />
          <span>SchedMaster</span>
        </div>
        {/* btn--dark reemplaza btn-login */}
        <Link href="/login" className="btn btn--dark">Iniciar sesión</Link>
      </header>

      <section className="home-hero">
        <h1>Reserva tu <span className="highlight">bienestar</span></h1>
        <p>Elige el servicio que deseas y comienza tu experiencia saludable.</p>
      </section>

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

      {/* Modal unificado — usa .modal-overlay + .modal-box */}
      {openModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Cerrar modal"><X size={20} /></button>
            {!sent ? (
              <>
                <h2>Convocatoria cerrada</h2>
                <p>Actualmente no hay convocatoria abierta. Déjanos tu correo y te avisaremos.</p>
                <form onSubmit={handleSubmit} className="modal-form">
                  <input type="email" placeholder="tucorreo@uteq.edu.mx"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                  {/* btn--full + btn--lg reemplaza btn-primary */}
                  <button type="submit" className="btn btn--blue btn--full btn--lg">
                    Notificarme
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <h3>Registro confirmado</h3>
                <p>Te notificaremos cuando se habilite la próxima convocatoria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="tips-section">
        <strong>Consejos para ti</strong>
        <div className="tips-grid">
          <div className="tip-card">Mantente hidratado durante tu entrenamiento</div>
          <div className="tip-card">Incluye verduras en cada comida</div>
          <div className="tip-card">Dormir bien mejora tu rendimiento físico</div>
        </div>
      </section>

    </div>
  );
}