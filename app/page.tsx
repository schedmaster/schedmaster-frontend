import Link from 'next/link';
import {
  Dumbbell,
  ShieldCheck,
  Flame,
  Clock,
  Users,
  Bell,
  ChevronRight,
  ArrowRight,
  Award,
  HeartPulse,
  Lock,
} from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import Reveal from './components/Reveal';
import { gxFontClass } from './styles/fonts';

const FEATURES = [
  {
    icon: Users,
    title: 'Comunidad universitaria',
    desc: 'Entrena junto a otros estudiantes motivados y crea conexiones que trascienden el gimnasio.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad e higiene',
    desc: 'Instalaciones impecables con protocolos de limpieza rigurosos y equipo desinfectado continuamente.',
  },
  {
    icon: Flame,
    title: 'Resultados comprobados',
    desc: 'Programas diseñados por profesionales, adaptados a todos los niveles.',
  },
  {
    icon: Clock,
    title: 'Horarios flexibles',
    desc: 'Accede en los horarios que mejor se adapten a tu carga académica.',
  },
  {
    icon: Bell,
    title: 'Fila virtual inteligente',
    desc: 'Reserva tu horario en segundos y recibe notificaciones en tiempo real sobre tu inscripción, sin filas ni papeleo.',
  },
];

const SHOWCASE = [
  { icon: Dumbbell, title: 'Área de pesas', desc: 'Equipo completo de fuerza para todos los niveles.', variant: 1 },
  { icon: HeartPulse, title: 'Cardio', desc: 'Zona cardiovascular con equipos de última generación.', variant: 2 },
  { icon: Users, title: 'Clases grupales', desc: 'Sesiones dirigidas por entrenadores certificados.', variant: 3 },
  { icon: Lock, title: 'Vestidores', desc: 'Casilleros seguros y áreas de cambio cómodas.', variant: 4 },
];

const STATS = [
  { value: '1,247+', label: 'Estudiantes activos' },
  { value: '89+', label: 'Horarios disponibles' },
  { value: '12K+', label: 'Horas entrenadas' },
  { value: '4.8★', label: 'Valoración promedio' },
];

export default function Home() {
  return (
    <div className={`gx-scope gx-home ${gxFontClass}`}>
      <SiteHeader />

      {/* ── Hero ─────────────────────────────── */}
      <section className="gx-hero">
        <div className="gx-hero-bg">
          <div className="gx-hero-bg-mesh" />
          <div className="gx-hero-bg-grid" />
          <div className="gx-hero-orb gx-hero-orb--1 gx-float-a" />
          <div className="gx-hero-orb gx-hero-orb--2 gx-float-b" />
        </div>

        <div className="gx-hero-inner">
          <Reveal as="div" className="gx-hero-text">
            <span className="gx-eyebrow gx-eyebrow--on-dark">
              <Award size={13} /> Gimnasio universitario UTEQ
            </span>

            <h1 className="gx-hero-title">
              Transforma tu <span>cuerpo y mente</span>
            </h1>

            <p className="gx-hero-subtitle">
              Accede al gimnasio universitario de primera clase y mejora tu bienestar cada día.
              Reserva tu horario, entrena con equipo profesional y forma parte de una comunidad activa.
            </p>

            <div className="gx-hero-actions">
              <Link href="/seleccion-servicio" className="gx-btn gx-btn--primary gx-btn--lg">
                Quiero entrenar <ChevronRight size={18} />
              </Link>
              <Link href="#beneficios" className="gx-btn gx-btn--on-dark gx-btn--lg">
                Conócenos
              </Link>
            </div>

            <div className="gx-hero-stats">
              {STATS.slice(0, 3).map((stat) => (
                <div className="gx-hero-stat" key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal as="div" delay={150} className="gx-hero-visual">
            <div className="gx-mock">
              <div className="gx-mock-topbar">
                <div className="gx-mock-dots"><span /><span /><span /></div>
                <span className="gx-mock-live">En vivo</span>
              </div>

              <p className="gx-mock-title">Aforo del gimnasio · hoy</p>

              <div className="gx-mock-schedule">
                <div className="gx-mock-slot is-active">
                  <span className="gx-mock-slot-time">07:00</span>
                  <span className="gx-mock-slot-bar"><span style={{ width: '82%' }} /></span>
                  <span className="gx-mock-slot-pct">82%</span>
                </div>
                <div className="gx-mock-slot">
                  <span className="gx-mock-slot-time">10:00</span>
                  <span className="gx-mock-slot-bar"><span style={{ width: '46%' }} /></span>
                  <span className="gx-mock-slot-pct">46%</span>
                </div>
                <div className="gx-mock-slot">
                  <span className="gx-mock-slot-time">17:00</span>
                  <span className="gx-mock-slot-bar"><span style={{ width: '95%' }} /></span>
                  <span className="gx-mock-slot-pct">95%</span>
                </div>
                <div className="gx-mock-slot">
                  <span className="gx-mock-slot-time">19:00</span>
                  <span className="gx-mock-slot-bar"><span style={{ width: '61%' }} /></span>
                  <span className="gx-mock-slot-pct">61%</span>
                </div>
              </div>

              <div className="gx-mock-footer">
                <div className="gx-mock-avatars"><span /><span /><span /></div>
                <small>+1,200 miembros activos</small>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Beneficios ───────────────────────── */}
      <section id="beneficios" className="gx-section">
        <div className="gx-container">
          <Reveal as="div" className="gx-section-head">
            <span className="gx-eyebrow"><Flame size={13} /> ¿Por qué elegirnos?</span>
            <h2>Todo lo que necesitas para <span className="gx-grad-text">alcanzar tus metas</span></h2>
            <p>Instalaciones de primer nivel con programas diseñados para la comunidad universitaria.</p>
          </Reveal>

          <div className="gx-bento">
            {FEATURES.map((f, i) => (
              <Reveal as="div" key={f.title} delay={i * 60} className="gx-card gx-card--hover gx-bento-card">
                <span className="gx-bento-icon"><f.icon size={22} /></span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instalaciones ────────────────────── */}
      <section id="instalaciones" className="gx-section gx-section--alt">
        <div className="gx-container">
          <Reveal as="div" className="gx-section-head">
            <span className="gx-eyebrow"><Dumbbell size={13} /> Nuestras instalaciones</span>
            <h2>Un espacio diseñado para <span className="gx-grad-text">ti</span></h2>
            <p>Cada área está pensada para que entrenes con comodidad, seguridad y motivación.</p>
          </Reveal>

          <div className="gx-showcase-grid">
            {SHOWCASE.map((item, i) => (
              <Reveal as="div" key={item.title} delay={i * 60} className={`gx-showcase-tile gx-showcase-tile--${item.variant}`}>
                <span className="gx-showcase-icon"><item.icon size={20} /></span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────── */}
      <section className="gx-stats-band">
        <div className="gx-stats-band-grid">
          {STATS.map((stat, i) => (
            <Reveal as="div" key={stat.label} delay={i * 60} className="gx-stats-band-item">
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="gx-cta-wrap">
        <Reveal as="div" className="gx-container">
          <div className="gx-cta-card">
            <div className="gx-cta-inner">
              <h2>¿Listo para comenzar tu transformación?</h2>
              <p>Crea tu cuenta hoy, descubre rutinas y anuncios, y postúlate cuando abra la próxima convocatoria.</p>
              <Link href="/seleccion-servicio" className="gx-btn gx-btn--energy gx-btn--lg">
                Quiero entrenar <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer id="contacto" className="gx-footer">
        <div className="gx-footer-grid">
          <div className="gx-footer-brand">
            <Link href="/" className="gx-brand">
              <span className="gx-brand-mark"><Dumbbell size={19} strokeWidth={2.4} /></span>
              <span className="gx-brand-name" style={{ color: '#fff' }}>SchedMaster</span>
            </Link>
            <p>Gestión inteligente de horarios para el gimnasio universitario UTEQ.</p>
          </div>

          <div className="gx-footer-cols">
            <div className="gx-footer-col">
              <h4>Plataforma</h4>
              <Link href="/login">Iniciar sesión</Link>
              <Link href="/register">Registrarse</Link>
              <Link href="/seleccion-servicio">Servicios</Link>
            </div>
            <div className="gx-footer-col">
              <h4>Gimnasio</h4>
              <Link href="#beneficios">Beneficios</Link>
              <Link href="#instalaciones">Instalaciones</Link>
              <Link href="/ejercicios">Ejercicios</Link>
            </div>
            <div className="gx-footer-col">
              <h4>Contacto</h4>
              <span>soporte@schedmaster.uteq.mx</span>
              <span>+52 442 123 4567</span>
              <span>Lunes a viernes</span>
            </div>
          </div>
        </div>

        <div className="gx-footer-bottom">
          <span>&copy; {new Date().getFullYear()} SchedMaster · UTEQ</span>
          <span>Hecho para la comunidad universitaria</span>
        </div>
      </footer>
    </div>
  );
}
