'use client';

import { useState, useEffect } from 'react';
import {
  Users, RefreshCw, Check, X, Clock, AlertTriangle, 
  GraduationCap, Briefcase, Dumbbell, Stethoscope, 
  Shield, CalendarDays, Mail
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const ROL_CONFIG: Record<number, { icon: any, nombre: string, color: string }> = {
  2: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  3: { icon: Briefcase,     nombre: 'Docente',     color: 'var(--purple-light)' },
  1: { icon: Shield,        nombre: 'Admin',       color: 'var(--red-light)' },
};

interface Inscripcion {
  id_inscripcion?: number;
  id?: number; 
  prioridad?: string;
  fecha_inscripcion?: string;
  estado?: string;
  nombre?: string; 
  apellido_paterno?: string; 
  apellido_materno?: string; 
  correo?: string; 
  rol?: string; 
  usuario?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    id_rol: number;
  };
  horario?: {
    hora_inicio: string;
    hora_fin: string;
  };
  diasSeleccionados?: { // 👈 CORREGIDO EN EL FRONTEND TAMBIÉN
    dia: {
      nombre: string;
    }
  }[];
}

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInscripciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/pendientes`);
      if (res.ok) {
        const data = await res.json();
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

  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    const confirmacion = nuevoEstado === 'aprobado' ? '¿Aprobar esta inscripción?' : '¿Rechazar esta inscripción?';
    if (!window.confirm(confirmacion)) return;

    const rutaEndpoint = nuevoEstado === 'aprobado' ? '/api/inscripciones/aceptar' : '/api/inscripciones/rechazar';

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
    }
  };

  const formatDias = (dias: any[] | undefined) => {
    if (!dias || dias.length === 0) return 'No seleccionados';
    return dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ');
  };

  const formatHora = (hora: string | undefined) => {
    return hora ? hora.substring(0, 5) : '--:--';
  };

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
                <Clock size={14}/> {inscripciones.length} Solicitudes
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
                  {inscripciones.length > 0 ? (
                    inscripciones.map((insc, index) => (
                      <tr key={insc.id_inscripcion || insc.id || index}>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">
                              {insc.usuario?.nombre || insc.nombre || 'Desconocido'} {insc.usuario?.apellido_paterno || insc.apellido_paterno || ''}
                            </span>
                            <span className="user-subtext">{insc.usuario?.apellido_materno || insc.apellido_materno || ''}</span>
                          </div>
                        </td>
                        <td>
                          <div className="info-badge">
                            <Mail size={12} /> {insc.usuario?.correo || insc.correo || 'Sin correo'}
                          </div>
                        </td>
                        <td>
                          <span className="role-tag">
                            {ROL_CONFIG[insc.usuario?.id_rol as number]?.nombre || insc.rol || 'Usuario'}
                          </span>
                        </td>
                        <td>
                          <div className="time-badge">
                            <Clock size={12} /> 
                            {formatHora(insc.horario?.hora_inicio)} - {formatHora(insc.horario?.hora_fin)}
                          </div>
                        </td>
                        <td>
                          <div className="days-list">
                            {/* 👈 CORREGIDO EN EL FRONTEND TAMBIÉN */}
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
                            <button 
                              className="btn-mini btn-mini--green" 
                              title="Aprobar"
                              onClick={() => handleStatusChange((insc.id_inscripcion || insc.id) as number, 'aprobado')}
                            >
                              <Check size={12}/> Aceptar
                            </button>
                            <button 
                              className="btn-mini btn-mini--red" 
                              title="Rechazar"
                              onClick={() => handleStatusChange((insc.id_inscripcion || insc.id) as number, 'rechazado')}
                            >
                              <X size={12}/> Rechazar
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
                          <p>No hay inscripciones pendientes por ahora.</p>
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
    </div>
  );
}