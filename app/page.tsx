import Link from 'next/link';
import { Dumbbell, CalendarDays, CalendarCheck, ClipboardList, Megaphone, BookOpen, UserPlus, ChevronRight, ArrowRight } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import Reveal from './components/Reveal';
import BrandLogo from './components/BrandLogo';
import { gxFontClass } from './styles/fonts';

const FEATURES = [
  { icon: CalendarDays, title: 'Convocatorias del gimnasio', desc: 'Consulta los periodos de inscripción y los días y horarios publicados para cada convocatoria.' },
  { icon: ClipboardList, title: 'Seguimiento de solicitudes', desc: 'Revisa el estado de tu solicitud y responde si recibes una propuesta de horario de la administración.' },
  { icon: Dumbbell, title: 'Rutinas y ejercicios', desc: 'Consulta las rutinas disponibles y explora ejercicios para preparar tu entrenamiento.' },
  { icon: CalendarCheck, title: 'Tus asistencias', desc: 'Consulta tus registros de asistencia cuando tengas un horario vigente en el gimnasio.' },
  { icon: Megaphone, title: 'Anuncios del gimnasio', desc: 'Encuentra los avisos y novedades que publica la administración en el tablón de anuncios.' },
];

const STEPS = [
  { title: 'Crea tu cuenta', desc: 'Regístrate como estudiante o docente para entrar a la plataforma.' },
  { title: 'Solicita tu horario', desc: 'Cuando haya una convocatoria abierta, elige entre los días y horarios publicados.' },
  { title: 'Consulta la respuesta', desc: 'Revisa el estado de tu solicitud y responde si recibes una propuesta de horario.' },
];

const QUESTIONS = [
  { title: '¿Crear mi cuenta me da acceso al gimnasio?', answer: 'No. El acceso al gimnasio requiere una solicitud aprobada y un horario vigente. Crear tu cuenta es el primer paso para usar la plataforma.' },
  { title: '¿Puedo usar la plataforma sin tener un horario?', answer: 'Sí. Desde tu cuenta puedes consultar anuncios, explorar ejercicios y revisar rutinas aunque todavía no tengas un horario asignado.' },
  { title: '¿Dónde consulto el estado de mi solicitud?', answer: 'Inicia sesión y abre Convocatorias. Ahí puedes revisar el estado de tu solicitud y responder a las propuestas de horario que recibas.' },
];

export default function Home() {
  return (
    <div className={`gx-scope gx-home ${gxFontClass}`}>
      <SiteHeader />
      <section className="gx-hero">
        <div className="gx-hero-bg" aria-hidden="true">
          <div className="gx-hero-bg-mesh" />
          <div className="gx-hero-bg-grid" />
          <div className="gx-hero-orb gx-hero-orb--1 gx-float-a" />
          <div className="gx-hero-orb gx-hero-orb--2 gx-float-b" />
        </div>
        <div className="gx-hero-inner">
          <Reveal as="div" className="gx-hero-text">
            <h1 className="gx-hero-title">Transforma tu <span>cuerpo y mente</span></h1>
            <p className="gx-hero-subtitle">
              Organiza tu acceso al gimnasio universitario UTEQ. Crea tu cuenta,
              consulta las convocatorias y solicita un horario. También puedes
              explorar ejercicios y revisar tus rutinas desde la plataforma.
            </p>
            <div className="gx-hero-actions">
              <Link href="/register" className="gx-btn gx-btn--primary gx-btn--lg">
                Crear mi cuenta <ChevronRight size={18} aria-hidden="true" />
              </Link>
              <Link href="#beneficios" className="gx-btn gx-btn--on-dark gx-btn--lg">Conocer la plataforma</Link>
            </div>
            <p className="gx-hero-access-note">El acceso al gimnasio está sujeto a la aprobación de tu solicitud.</p>
          </Reveal>
          <Reveal as="aside" delay={150} className="gx-start-guide" aria-labelledby="como-empezar">
            <h2 id="como-empezar">Cómo solicitar tu horario</h2>
            <ol className="gx-start-steps">
              {STEPS.map((step) => (
                <li key={step.title}><h3>{step.title}</h3><p>{step.desc}</p></li>
              ))}
            </ol>
            <Link href="/login" className="gx-start-login">
              ¿Ya tienes cuenta? Inicia sesión <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="beneficios" className="gx-section">
        <div className="gx-container">
          <Reveal as="div" className="gx-section-head">
            <h2>Tu actividad en el gimnasio, organizada</h2>
            <p>Estas son las herramientas que encontrarás al entrar a tu cuenta.</p>
          </Reveal>
          <div className="gx-bento">
            {FEATURES.map((feature, index) => (
              <Reveal as="div" key={feature.title} delay={index * 60} className="gx-card gx-card--hover gx-bento-card">
                <span className="gx-bento-icon"><feature.icon size={22} aria-hidden="true" /></span>
                <h3>{feature.title}</h3><p>{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="gx-section gx-section--alt">
        <div className="gx-container">
          <Reveal as="div" className="gx-section-head">
            <h2>Prepara tu siguiente paso</h2>
            <p>Explora ejercicios o crea tu cuenta para consultar las convocatorias del gimnasio.</p>
          </Reveal>
          <div className="gx-home-resources">
            <Link href="/ejercicios" className="gx-home-resource">
              <BookOpen size={28} aria-hidden="true" />
              <div><h3>Explora los ejercicios</h3><p>Consulta movimientos con animaciones y sus grupos musculares antes de iniciar tu entrenamiento.</p></div>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link href="/register" className="gx-home-resource">
              <UserPlus size={28} aria-hidden="true" />
              <div><h3>Crea tu cuenta</h3><p>Registra tus datos para acceder a los anuncios, las rutinas y las convocatorias desde tu panel.</p></div>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="preguntas-frecuentes" className="gx-section">
        <div className="gx-container gx-home-faq">
          <div className="gx-section-head">
            <h2>Antes de comenzar</h2>
            <p>Lo que necesitas saber sobre tu cuenta y el acceso al gimnasio.</p>
          </div>
          {QUESTIONS.map((question) => (
            <details key={question.title} className="gx-home-question">
              <summary>{question.title}</summary><p>{question.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="gx-cta-wrap">
        <div className="gx-container">
          <div className="gx-cta-card">
            <div className="gx-cta-inner">
              <h2>Comienza con tu cuenta</h2>
              <p>Crea tu cuenta para consultar anuncios y rutinas, y enviar una solicitud cuando haya una convocatoria abierta.</p>
              <Link href="/register" className="gx-btn gx-btn--energy gx-btn--lg">Registrarme <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacto" className="gx-footer">
        <div className="gx-footer-grid">
          <div className="gx-footer-brand">
            <Link href="/" className="gx-brand"><BrandLogo /></Link>
            <p>Gestión de horarios para el gimnasio universitario UTEQ.</p>
          </div>
          <div className="gx-footer-cols">
            <div className="gx-footer-col">
              <h4>Plataforma</h4>
              <Link href="/login">Iniciar sesión</Link><Link href="/register">Registrarse</Link><Link href="/seleccion-servicio">Acceso al gimnasio</Link>
            </div>
            <div className="gx-footer-col">
              <h4>Recursos</h4>
              <Link href="#beneficios">Herramientas</Link><Link href="#recursos">Para comenzar</Link><Link href="/ejercicios">Ejercicios</Link>
            </div>
            <div className="gx-footer-col">
              <h4>Ayuda</h4>
              <Link href="#como-empezar">Cómo solicitar un horario</Link><Link href="#preguntas-frecuentes">Preguntas frecuentes</Link><Link href="/login">Consultar mi solicitud</Link>
            </div>
          </div>
        </div>
        <div className="gx-footer-bottom"><span>&copy; {new Date().getFullYear()} SchedMaster · UTEQ</span><span>Hecho para la comunidad universitaria</span></div>
      </footer>
    </div>
  );
}
