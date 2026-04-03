'use client';

import { useState, useEffect } from 'react';
import {
  Users, RefreshCw, Check, X, Clock, Mail, GraduationCap, Briefcase
} from 'lucide-react';

import AdminSidebar from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';
import PropuestaModal from '../../components/PropuestaModal';
import AlertModal from '../../components/AlertModal';
import CapacidadModal from '../../components/CapacidadModal';

const ROL_CONFIG: Record<number, { icon: any; nombre: string; color: string }> = {
  1: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  2: { icon: Briefcase,     nombre: 'Docente',     color: 'var(--purple-light)' },
};

interface Inscripcion {
  id_inscripcion?: number;
  id?: number;
  prioridad?: string;
  estado?: string;

  usuario?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    id_rol: number;
  };

  horario?: {
    id_horario: number;       // ← necesario para verificar capacidad
    hora_inicio: string;
    hora_fin: string;
  };

  diasSeleccionados?: {
    dia: {
      id_dia: number;         // ← necesario para verificar capacidad
      nombre: string;
    }
  }[];
}

export default function AdminInscripcionesPage() {

  const [inscripciones, setInscripciones]   = useState<Inscripcion[]>([]);
  const [loading, setLoading]               = useState(false);

  // — Confirm modal
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [accionPendiente, setAccionPendiente] =
    useState<{ id: number; estado: string } | null>(null);

  // — Propuesta modal
  const [modalPropuestaOpen, setModalPropuestaOpen] = useState(false);
  const [correoPropuesta, setCorreoPropuesta]       = useState('');
  const [inscripcionActual, setInscripcionActual]   = useState<number | null>(null);
  const [propuestasEnviadas, setPropuestasEnviadas] = useState<number[]>([]);

  // — Alert modal (éxito / error genérico)
  const [alertOpen, setAlertOpen]     = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle]   = useState('Mensaje');

  // — Capacidad modal (sin lugares / cupo casi lleno)
  const [capacidadOpen, setCapacidadOpen]           = useState(false);
  const [lugaresDisponibles, setLugaresDisponibles] = useState(0);

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  const fetchInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/pendientes`
      );
      if (res.ok) {
        setInscripciones(await res.json());
      } else {
        mostrarError('No se pudieron cargar las inscripciones');
      }
    } catch {
      mostrarError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInscripciones(); }, []);

  // ─────────────────────────────────────────────
  // HELPERS UI
  // ─────────────────────────────────────────────
  const mostrarError = (msg: string) => {
    setAlertTitle('Error');
    setAlertMessage(msg);
    setAlertOpen(true);
  };

  const mostrarExito = (msg: string) => {
    setAlertTitle('Éxito');
    setAlertMessage(msg);
    setAlertOpen(true);
  };

  const mostrarCapacidad = (disponibles: number) => {
    setLugaresDisponibles(disponibles);
    setCapacidadOpen(true);
  };

  // ─────────────────────────────────────────────
  // ACEPTAR / RECHAZAR
  // ─────────────────────────────────────────────
  const handleStatusChange = (id: number, nuevoEstado: string) => {
    setAccionPendiente({ id, estado: nuevoEstado });
    setConfirmOpen(true);
  };

  const confirmarCambio = async () => {
    if (!accionPendiente) return;

    const { id, estado } = accionPendiente;

    const endpoint =
      estado === 'aprobado'
        ? '/api/inscripciones/aceptar'
        : '/api/inscripciones/rechazar';

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_inscripcion: id }),
        }
      );

      const data = await res.json();

      if (res.status === 409) {
        // Horario lleno — mostrar modal bloqueante
        mostrarCapacidad(0);
        return;
      }

      if (!res.ok) {
        mostrarError('No se pudo procesar la solicitud');
        return;
      }

      // Quitar de la lista
      setInscripciones(prev =>
        prev.filter(i => (i.id_inscripcion || i.id) !== id)
      );

      if (estado === 'aprobado' && typeof data.disponibles === 'number' && data.disponibles <= 5) {
        // Aprobado con poco cupo restante — aviso post-acción
        mostrarCapacidad(data.disponibles);
      } else {
        mostrarExito(
          estado === 'aprobado'
            ? 'Inscripción aprobada correctamente'
            : 'Inscripción rechazada correctamente'
        );
      }

    } catch {
      mostrarError('Error de conexión con el servidor');
    } finally {
      setConfirmOpen(false);
      setAccionPendiente(null);
    }
  };

  // ─────────────────────────────────────────────
  // PROPUESTA — callback cuando se envió
  // ─────────────────────────────────────────────
  const handlePropuestaEnviada = (disponibles?: number) => {
    if (inscripcionActual) {
      setPropuestasEnviadas(prev => [...prev, inscripcionActual]);
    }

    if (typeof disponibles === 'number' && disponibles <= 5) {
      // Poco cupo restante luego de proponer
      mostrarCapacidad(disponibles);
    } else {
      mostrarExito('Propuesta enviada correctamente');
    }
  };

  // ─────────────────────────────────────────────
  // FORMAT
  // ─────────────────────────────────────────────
  const formatDias = (dias: any[] | undefined) =>
    dias?.length
      ? dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ')
      : 'No seleccionados';

  const formatHora = (hora: string | undefined) =>
    hora ? hora.substring(0, 5) : '--:--';

  const inscripcionesFiltradas =
    inscripciones.filter(i => [1, 2].includes(i.usuario?.id_rol || 0));

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="app">

      <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Validación de Inscripciones</h2>
              <p>Revisa y aprueba las solicitudes de acceso al gimnasio.</p>
            </div>

            <div className="row-actions">
              <div className="chip chip--pendiente">
                <Clock size={14}/> {inscripcionesFiltradas.length} Solicitudes
              </div>
              <button
                className={`btn btn--blue ${loading ? 'loading' : ''}`}
                onClick={fetchInscripciones}
              >
                <RefreshCw size={16}/> {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </header>

          <section className="table-area">
            <div className="table-scroll">
              <table className="modern-table">

                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Horario</th>
                    <th>Días</th>
                    <th>Prioridad</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {inscripcionesFiltradas.length > 0 ? (
                    inscripcionesFiltradas.map((insc) => {
                      const id = insc.id_inscripcion || insc.id || 0;

                      return (
                        <tr key={id}>

                          <td>
                            {insc.usuario?.nombre} {insc.usuario?.apellido_paterno}
                          </td>

                          <td><Mail size={12}/> {insc.usuario?.correo}</td>

                          <td>{ROL_CONFIG[insc.usuario?.id_rol || 0]?.nombre}</td>

                          <td>
                            {formatHora(insc.horario?.hora_inicio)} - {formatHora(insc.horario?.hora_fin)}
                          </td>

                          <td>{formatDias(insc.diasSeleccionados)}</td>

                          <td>{(insc.prioridad || 'baja').toUpperCase()}</td>

                          <td>
                            {propuestasEnviadas.includes(id) ? (
                              <button className="btn-mini btn-mini--gray" disabled>
                                En espera de respuesta
                              </button>
                            ) : (
                              <div className="action-buttons">

                                <button
                                  className="btn-mini btn-mini--green"
                                  onClick={() => handleStatusChange(id, 'aprobado')}
                                >
                                  <Check size={12}/> Aceptar
                                </button>

                                <button
                                  className="btn-mini btn-mini--red"
                                  onClick={() => handleStatusChange(id, 'rechazado')}
                                >
                                  <X size={12}/> Rechazar
                                </button>

                                <button
                                  className="btn-mini btn-mini--blue"
                                  onClick={() => {
                                    setCorreoPropuesta(insc.usuario?.correo || '');
                                    setInscripcionActual(id);
                                    setModalPropuestaOpen(true);
                                  }}
                                >
                                  Propuesta
                                </button>

                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        <Users size={48}/>
                        No hay inscripciones pendientes
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </section>

        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar acción"
        message="¿Deseas continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmarCambio}
        onCancel={() => setConfirmOpen(false)}
      />

      <PropuestaModal
        isOpen={modalPropuestaOpen}
        correo={correoPropuesta}
        onClose={() => setModalPropuestaOpen(false)}
        onPropuestaEnviada={handlePropuestaEnviada}
      />

      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      {/* Solo se abre cuando hay 409 (lleno) o disponibles <= 5 (aviso) */}
      <CapacidadModal
        open={capacidadOpen}
        disponibles={lugaresDisponibles}
        onConfirm={() => setCapacidadOpen(false)}
        onCancel={() => setCapacidadOpen(false)}
      />

    </div>
  );
}