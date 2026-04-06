'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LogOut,
  Info,
  Clock,
  LifeBuoy,
  ChevronDown,
  Mail,
  Phone,
  Check,
  X
} from 'lucide-react';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';

const formatHora = (valor: string | undefined): string => {
  if (!valor) return '--:--';
  if (/^\d{2}:\d{2}/.test(valor)) return valor.substring(0, 5);
  try {
    return new Date(valor).toISOString().substring(11, 16);
  } catch {
    return valor;
  }
};

export default function PendingAccountPage() {

  const router = useRouter();

  const [user, setUser]                             = useState<any>(null);
  const [propuesta, setPropuesta]                   = useState<any>(null);
  const [loading, setLoading]                       = useState(true);
  const [alertOpen, setAlertOpen]                   = useState(false);
  const [alertTitle, setAlertTitle]                 = useState('Aviso');
  const [alertMessage, setAlertMessage]             = useState('');
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false);
  const [confirmRechazarOpen, setConfirmRechazarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const mostrarAlerta = (titulo: string, mensaje: string, redirigir = false) => {
    setAlertTitle(titulo);
    setAlertMessage(mensaje);
    setRedirectAfterAlert(redirigir);
    setAlertOpen(true);
  };

  // ─── Aceptar propuesta ────────────────────────────────────
  const aceptarPropuesta = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/aceptar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_propuesta: propuesta.id_propuesta })
        }
      );

      if (res.ok) {
        localStorage.removeItem('user');
        mostrarAlerta(
          'Propuesta aceptada',
          'Propuesta aceptada correctamente. Inicia sesión nuevamente para continuar.',
          true
        );
      } else {
        mostrarAlerta('Error', 'No se pudo aceptar la propuesta.');
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No fue posible conectar con el servidor.');
    }
  };

  // ─── Rechazar propuesta ───────────────────────────────────
  const rechazarPropuesta = async () => {
    setConfirmRechazarOpen(false);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/rechazar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_propuesta: propuesta.id_propuesta })
        }
      );

      if (res.ok) {
        setPropuesta(null);
        mostrarAlerta(
          'Propuesta rechazada',
          'Has rechazado la propuesta. Tu solicitud ha sido cancelada. Puedes registrarte nuevamente cuando lo desees.'
        );
      } else {
        mostrarAlerta('Error', 'No se pudo rechazar la propuesta.');
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No fue posible conectar con el servidor.');
    }
  };

  // ─── Cargar usuario ───────────────────────────────────────
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser?.id_usuario) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
  }, []);

  // ─── Cargar propuesta ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id_usuario) return;

    const fetchPropuesta = async () => {
      try {
        const res  = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/usuario/${user.id_usuario}`
        );
        const data = await res.json();
        if (data) setPropuesta(data);
      } catch (error) {
        console.error('Error obteniendo propuesta', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropuesta();
  }, [user]);

  const nombresDias = (dias: any[]): string => {
    if (!dias?.length) return 'Sin días asignados';
    return dias
      .map(d => d?.dia?.nombre ?? d?.nombre ?? '')
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="page">
      <div className="wrap">

        <div className="top">
          <div className="brand">SCHEDMASTER</div>
        </div>

        <section className="card">

          {/* ── SI HAY PROPUESTA ── */}
          {!loading && propuesta && (
            <>
              <div className="hero">
                <div className="state"><Info /></div>
                <div>
                  <h1 className="title">Nueva propuesta de horario</h1>
                  <p className="message">
                    El administrador ha propuesto un horario alternativo para tu inscripción.
                    Revísalo y decide si lo aceptas o lo rechazas.
                  </p>
                </div>
              </div>

              <div className="proposal-box">
                <div className="proposal-data">
                  <div>
                    <strong>Horario:</strong>{' '}
                    {formatHora(propuesta.horario?.hora_inicio)} –{' '}
                    {formatHora(propuesta.horario?.hora_fin)}
                  </div>
                  <div>
                    <strong>Días:</strong>{' '}
                    {nombresDias(propuesta.dias)}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SI NO HAY PROPUESTA ── */}
          {!loading && !propuesta && (
            <div className="hero">
              <div className="state"><Info /></div>
              <div>
                <h1 className="title">Cuenta pendiente de aprobación</h1>
                <p className="message">
                  Tu cuenta fue registrada correctamente. En cuanto el administrador
                  la apruebe, podrás acceder al sistema.
                </p>
                <div className="status">
                  <Clock /> Estado: Pendiente
                </div>
              </div>
            </div>
          )}

          {/* ── BOTONES ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>

  {propuesta && (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        className="btn btn--green btn--full btn--lg"
        style={{ flex: 1 }}
        onClick={aceptarPropuesta}
      >
        <Check /> Aceptar
      </button>

      <button
        className="btn btn--red btn--full btn--lg"
        style={{ flex: 1 }}
        onClick={() => setConfirmRechazarOpen(true)}
      >
        <X /> Rechazar
      </button>
    </div>
  )}

  <button
    className="btn btn--blue btn--full btn--lg"
    onClick={handleLogout}
  >
    <LogOut /> Cerrar sesión
  </button>

</div>

          <div className="foot">
            Si tu cuenta ya fue aprobada y sigues viendo esta pantalla,
            cierra sesión e inicia nuevamente.
          </div>

          {/* ── SOPORTE ── */}
          <div className="support">
            <details>
              <summary>
                <span className="sum-left"><LifeBuoy /> Soporte</span>
                <ChevronDown className="chev" />
              </summary>
              <div className="support-body">

                <div className="support-item">
                  <Mail />
                  <div>
                    Correo:
                    <a href="mailto:soporte@schedmaster.uteq.mx">
                      soporte@schedmaster.uteq.mx
                    </a>
                    <small>Incluye tu matrícula y una breve descripción.</small>
                  </div>
                </div>

                <div className="support-item">
                  <Phone />
                  <div>
                    Teléfono:
                    <a href="tel:+524421234567">+52 442 123 4567</a>
                    <small>Horario: Lunes a Viernes.</small>
                  </div>
                </div>

              </div>
            </details>
          </div>

        </section>
      </div>

      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertOpen(false);
          if (redirectAfterAlert) router.push('/login');
        }}
      />

      <ConfirmModal
        open={confirmRechazarOpen}
        title="Rechazar propuesta"
        message="¿Estás seguro? Tu solicitud de inscripción quedará cancelada y tendrás que registrarte nuevamente."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        onConfirm={rechazarPropuesta}
        onCancel={() => setConfirmRechazarOpen(false)}
      />

    </div>
  );
}