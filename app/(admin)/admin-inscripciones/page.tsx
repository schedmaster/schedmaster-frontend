'use client';

import { useState, useEffect } from 'react';
import {
  Users, RefreshCw, Check, X, Clock, CalendarDays, Mail, GraduationCap, Briefcase
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';

// Configuración de roles visuales
const ROL_CONFIG: Record<number, { icon: any; nombre: string; color: string }> = {
  1: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  2: { icon: Briefcase, nombre: 'Docente', color: 'var(--purple-light)' },
  // Admin se excluye aquí
};

interface Inscripcion {
  id_inscripcion?: number;
  id?: number;
  prioridad?: string;
  fecha_inscripcion?: string;
  estado?: string;
  usuario?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    id_rol: number;
  };
  horario?: { hora_inicio: string; hora_fin: string };
  diasSeleccionados?: { dia: { nombre: string } }[];
}

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{ id: number; estado: string } | null>(null);

  // Obtener inscripciones pendientes
  const fetchInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/pendientes`);
      if (res.ok) {
        const data: Inscripcion[] = await res.json();
        setInscripciones(data);
      }
    } catch (err) {
      console.error('Error conexión:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const handleStatusChange = (id: number, nuevoEstado: string) => {
    setAccionPendiente({ id, estado: nuevoEstado });
    setConfirmOpen(true);
  };

  const confirmarCambio = async () => {
    if (!accionPendiente) return;
    const { id, estado } = accionPendiente;
    const rutaEndpoint = estado === 'aprobado' ? '/api/inscripciones/aceptar' : '/api/inscripciones/rechazar';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${rutaEndpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_inscripcion: id }),
      });
      if (res.ok) {
        setInscripciones(prev => prev.filter(i => (i.id_inscripcion || i.id) !== id));
      } else {
        alert('Error al actualizar estado en el servidor');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setConfirmOpen(false);
      setAccionPendiente(null);
    }
  };

  const formatDias = (dias: any[] | undefined) => dias && dias.length > 0 ? dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ') : 'No seleccionados';
  const formatHora = (hora: string | undefined) => hora ? hora.substring(0, 5) : '--:--';

  // Filtrar solo Estudiante y Docente
  const inscripcionesFiltradas = inscripciones.filter(i => [1, 2].includes(i.usuario?.id_rol || 0));

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
                <Clock size={14} /> {inscripcionesFiltradas.length} Solicitudes
              </div>
              <button className={`btn btn--blue ${loading ? 'loading' : ''}`} onClick={fetchInscripciones}>
                <RefreshCw size={16} /> {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </header>

          <section className="table-area">
            <div className="table-scroll">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Contacto</th>
                    <th>Rol</th>
                    <th>Horario Solicitado</th>
                    <th>Días</th>
                    <th>Prioridad</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripcionesFiltradas.length > 0 ? (
                    inscripcionesFiltradas.map((insc, index) => (
                      <tr key={insc.id_inscripcion || insc.id || index}>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">
                              {insc.usuario?.nombre || 'Desconocido'} {insc.usuario?.apellido_paterno || ''}
                            </span>
                            <span className="user-subtext">{insc.usuario?.apellido_materno || ''}</span>
                          </div>
                        </td>
                        <td>
                          <div className="info-badge">
                            <Mail size={12} /> {insc.usuario?.correo || 'Sin correo'}
                          </div>
                        </td>
                        <td>
                          <span className="role-tag">{ROL_CONFIG[insc.usuario?.id_rol || 0]?.nombre || 'Usuario'}</span>
                        </td>
                        <td>
                          <div className="time-badge">
                            <Clock size={12} /> {formatHora(insc.horario?.hora_inicio)} - {formatHora(insc.horario?.hora_fin)}
                          </div>
                        </td>
                        <td>
                          <div className="days-list">
                            <CalendarDays size={12} /> {formatDias(insc.diasSeleccionados)}
                          </div>
                        </td>
                        <td>
                          <span className={`priority-tag ${insc.prioridad || 'baja'}`}>
                            {(insc.prioridad || 'baja').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-mini btn-mini--green" onClick={() => handleStatusChange(insc.id_inscripcion || insc.id || 0, 'aprobado')}>
                              <Check size={12} /> Aceptar
                            </button>
                            <button className="btn-mini btn-mini--red" onClick={() => handleStatusChange(insc.id_inscripcion || insc.id || 0, 'rechazado')}>
                              <X size={12} /> Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="empty-state">
                      <td colSpan={7} className="empty-state">
                        <div className="empty-content">
                          <Users size={48} />
                          <p>No hay inscripciones pendientes de Estudiante o Docente.</p>
                        </div>
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
        title={accionPendiente?.estado === 'aprobado' ? 'Aprobar inscripción' : 'Rechazar inscripción'}
        message={accionPendiente?.estado === 'aprobado' ? '¿Estás seguro de aprobar esta inscripción?' : '¿Estás seguro de rechazar esta inscripción?'}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmarCambio}
        onCancel={() => {
          setConfirmOpen(false);
          setAccionPendiente(null);
        }}
      />
    </div>
  );
}