'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  Check, 
  X, 
  Clock, 
  Users, 
  Mail, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react'; 
import AdminSidebar from '../../components/AdminSidebar';
import AlertModal from '../../components/AlertModal';
import CapacidadModal from '../../components/CapacidadModal';
import ConfirmModal from '../../components/ConfirmModal';
import PropuestaModal from '../../components/PropuestaModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ROL_CONFIG: Record<number, { icon: any; nombre: string; color: string }> = {
  1: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  2: { icon: Briefcase,     nombre: 'Docente',    color: 'var(--purple-light)' },
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
    id_horario: number;
    hora_inicio: string;
    hora_fin: string;
  };

  diasSeleccionados?: {
    dia: {
      id_dia: number;
      nombre: string;
    }
  }[];
}

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones]   = useState<Inscripcion[]>([]);
  const [loading, setLoading]               = useState(false);
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{ id: number; estado: string } | null>(null);
  const [modalPropuestaOpen, setModalPropuestaOpen] = useState(false);
  const [correoPropuesta, setCorreoPropuesta]       = useState('');
  const [inscripcionActual, setInscripcionActual]   = useState<number | null>(null);
  const [propuestasEnviadas, setPropuestasEnviadas] = useState<number[]>([]);
  const [alertOpen, setAlertOpen]     = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle]   = useState('Mensaje');
  const [capacidadOpen, setCapacidadOpen]           = useState(false);
  const [lugaresDisponibles, setLugaresDisponibles] = useState(0);

  const fetchInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/inscripciones/pendientes`);
      if (res.ok) {
        const data = await res.json();
        // Blindaje 1: Asegurarnos de que siempre guardemos un arreglo
        setInscripciones(Array.isArray(data) ? data : (data?.data || []));
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

  const handleStatusChange = (id: number, nuevoEstado: string) => {
    setAccionPendiente({ id, estado: nuevoEstado });
    setConfirmOpen(true);
  };

  const confirmarCambio = async () => {
    if (!accionPendiente) return;

    const { id, estado } = accionPendiente;
    const endpoint = estado === 'aprobado' ? '/inscripciones/aceptar' : '/inscripciones/rechazar';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_inscripcion: id }),
      });

      const data = await res.json();

      if (res.status === 409) {
        mostrarCapacidad(0);
        return;
      }

      if (!res.ok) {
        mostrarError('No se pudo procesar la solicitud');
        return;
      }

      setInscripciones(prev =>
        prev.filter(i => (i.id_inscripcion || i.id) !== id)
      );

      if (estado === 'aprobado' && typeof data.disponibles === 'number' && data.disponibles <= 5) {
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

  const handlePropuestaEnviada = (disponibles?: number) => {
    if (inscripcionActual) {
      setPropuestasEnviadas(prev => [...prev, inscripcionActual]);
    }

    if (typeof disponibles === 'number' && disponibles <= 5) {
      mostrarCapacidad(disponibles);
    } else {
      mostrarExito('Propuesta enviada correctamente');
    }
  };

  const formatDias = (dias: any[] | undefined) =>
    dias?.length
      ? dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ')
      : 'No seleccionados';

  const formatHora = (hora: string | undefined) =>
    hora ? hora.substring(0, 5) : '--:--';

  // Blindaje 2: Escudo en el filter por si la variable llega mal
  const inscripcionesFiltradas = (Array.isArray(inscripciones) ? inscripciones : [])
    .filter(i => [1, 2].includes(i.usuario?.id_rol || 0));

  return (
    <div className="app">
      <AdminSidebar/>

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Control de Inscripciones</h2>
              <p>Gestiona las solicitudes de acceso al servicio</p>
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
                        <p>No hay inscripciones pendientes</p>
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
        message={`¿Estás seguro de que deseas ${accionPendiente?.estado === 'aprobado' ? 'aceptar' : 'rechazar'} esta inscripción?`}
        onConfirm={confirmarCambio}
        onCancel={() => setConfirmOpen(false)}
      />

      {modalPropuestaOpen && (
        <PropuestaModal
          open={modalPropuestaOpen}
          onClose={() => setModalPropuestaOpen(false)}
          idInscripcion={inscripcionActual || 0}
          correoDestino={correoPropuesta}
          onSuccess={handlePropuestaEnviada}
        />
      )}

      <CapacidadModal
        open={capacidadOpen}
        disponibles={lugaresDisponibles}
        onClose={() => setCapacidadOpen(false)}
      />

      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}