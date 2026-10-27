'use client';
import { apiFetch } from '../../lib/api';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, RefreshCw, Check, X, Clock, Mail, GraduationCap, Briefcase,
  Send
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import AdminSidebar from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';
import PropuestaModal from '../../components/PropuestaModal';
import AlertModal from '../../components/AlertModal';

const ROL_CONFIG: Record<number, { icon: LucideIcon; nombre: string; color: string }> = {
  1: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  2: { icon: Briefcase, nombre: 'Docente', color: 'var(--purple-light)' },
};

interface Inscripcion {
  id_inscripcion?: number;
  id?: number;
  prioridad?: string;
  constancia?: { percentage: number | null; present: number; expected: number };
  estado?: string;

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

  diasSeleccionados?: {
    dia: { nombre: string }
  }[];
}

type GraficaItem = {
  id_horario: number;
  hora: string;
  ocupados: number;
  capacidad: number;
  disponibles: number;
  dia: string;
};

export default function AdminInscripcionesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [grafica, setGrafica] = useState<GraficaItem[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accionPendiente, setAccionPendiente] =
    useState<{ id: number; estado: string } | null>(null);

  const [modalPropuestaOpen, setModalPropuestaOpen] = useState(false);
  const [correoPropuesta, setCorreoPropuesta] = useState('');
  const [inscripcionActual, setInscripcionActual] = useState<number | null>(null);
  const [propuestasEnviadas, setPropuestasEnviadas] = useState<number[]>([]);


  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Mensaje');

  const fetchInscripciones = useCallback(async () => {

    setLoading(true);

    try {

      const res = await apiFetch(`${API_URL}/inscripciones/pendientes`);

      if (res.ok) {

        const data = await res.json();
        setInscripciones(data.inscripciones || []);
        setGrafica(data.grafica || []);

      } else {

        setAlertTitle('Error');
        setAlertMessage('No se pudieron cargar las inscripciones');
        setAlertOpen(true);

      }

    } catch (error) {
      console.error('Error cargando inscripciones:', error);

      setAlertTitle('Error');
      setAlertMessage('Error de conexión con el servidor');
      setAlertOpen(true);

    } finally {

      setLoading(false);

    }

  }, [API_URL]);

  const handleActualizar = useCallback(() => {
    void fetchInscripciones();
  }, [fetchInscripciones]);

  useEffect(() => {
    handleActualizar();
  }, [handleActualizar]);

  const handleStatusChange = (id: number, nuevoEstado: string) => {

    setAccionPendiente({ id, estado: nuevoEstado });
    setConfirmOpen(true);

  };

  const confirmarCambio = async () => {

    if (!accionPendiente) return;

    const { id, estado } = accionPendiente;

    const endpoint = estado === 'aprobado'
      ? '/inscripciones/aceptar'
      : '/inscripciones/rechazar';

    try {

      const res = await apiFetch(
        `${API_URL}${endpoint}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_inscripcion: id }),
        }
      );

      if (res.ok) {

        setInscripciones(prev =>
          prev.filter(i => (i.id_inscripcion || i.id) !== id)
        );

        setAlertTitle('Éxito');
        setAlertMessage(
          estado === 'aprobado'
            ? 'Inscripción aprobada correctamente'
            : 'Inscripción rechazada correctamente'
        );
        setAlertOpen(true);

      } else {

        setAlertTitle('Error');
        setAlertMessage('No se pudo procesar la solicitud');
        setAlertOpen(true);

      }

    } catch (error) {
      console.error('Error cambiando estado de inscripcion:', error);

      setAlertTitle('Error');
      setAlertMessage('Error de conexión con el servidor');
      setAlertOpen(true);

    } finally {

      setConfirmOpen(false);
      setAccionPendiente(null);

    }

  };

  const graficaFiltrada = (grafica || []).filter((h) => {
    if (!diaSeleccionado) return true;
    return h.dia?.toLowerCase() === diaSeleccionado.toLowerCase();
  });

  const cuposResumen = graficaFiltrada.reduce(
    (acc, h) => ({
      ocupados: acc.ocupados + Number(h.ocupados || 0),
      capacidad: acc.capacidad + Number(h.capacidad || 0),
      disponibles: acc.disponibles + Number(h.disponibles || 0),
    }),
    { ocupados: 0, capacidad: 0, disponibles: 0 }
  );

  const porcentajeCupos = cuposResumen.capacidad > 0
    ? Math.min((cuposResumen.ocupados / cuposResumen.capacidad) * 100, 100)
    : 0;

  const cuposPorHora = Object.values(
    graficaFiltrada.reduce<Record<string, GraficaItem>>((acc, item) => {
      const hora = item.hora ? item.hora.substring(0, 5) : '--:--';
      const existente = acc[hora];

      acc[hora] = existente
        ? {
            ...existente,
            ocupados: existente.ocupados + Number(item.ocupados || 0),
            capacidad: existente.capacidad + Number(item.capacidad || 0),
            disponibles: existente.disponibles + Number(item.disponibles || 0),
          }
        : {
            ...item,
            hora,
            ocupados: Number(item.ocupados || 0),
            capacidad: Number(item.capacidad || 0),
            disponibles: Number(item.disponibles || 0),
          };

      return acc;
    }, {})
  ).sort((a, b) => a.hora.localeCompare(b.hora));

  const chartWidth = Math.max(760, cuposPorHora.length * 72);
  const chartHeight = 220;
  const chartPadding = 34;
  const maxCupo = Math.max(...cuposPorHora.map(item => item.ocupados), 1);
  const chartInnerWidth = chartWidth - chartPadding * 2;
  const chartInnerHeight = chartHeight - chartPadding * 2;
  const chartPoints = cuposPorHora.map((item, index) => {
    const x = chartPadding + (cuposPorHora.length > 1 ? (index / (cuposPorHora.length - 1)) * chartInnerWidth : chartInnerWidth / 2);
    const y = chartPadding + chartInnerHeight - (item.ocupados / maxCupo) * chartInnerHeight;
    return { ...item, x, y };
  });
  const chartPath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  const formatDias = (dias: Inscripcion['diasSeleccionados']) =>
    dias?.length
      ? dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ')
      : 'No seleccionados';

  const formatHora = (hora: string | undefined) =>
    hora ? hora.substring(0, 5) : '--:--';

  const inscripcionesFiltradas =
    (inscripciones || []).filter(i => [1, 2].includes(i.usuario?.id_rol || 0));

  return (

    <div className="app app--admin-inscriptions">

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
                onClick={handleActualizar}
              >
                <RefreshCw size={16}/> {loading ? 'Cargando...' : 'Actualizar'}
              </button>

            </div>

          </header>

          <h2 className="text-lg font-bold mb-2">
            Cupo por horario
          </h2>

          <div className="filter-bar">
            <select
              className="select"
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
            >
              <option value="">Todos los días</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miercoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sabado">Sabado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>

          <section className="capacity-panel capacity-panel--summary">
            <div className="capacity-line-chart">
              <div className="capacity-line-chart__header">
                <div>
                  <span className="capacity-summary__label">Cupos ocupados por hora</span>
                  <strong>{cuposResumen.ocupados}</strong>
                </div>
                <span className="capacity-summary__scope">
                  {diaSeleccionado || 'Todos los dias'} · {graficaFiltrada.length} horarios
                </span>
              </div>

              {chartPoints.length > 0 ? (
                <div className="capacity-line-chart__canvas" role="region" aria-label="Cupos por hora; desplaza horizontalmente para ver todos los horarios" tabIndex={0}>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ minWidth: chartWidth }} role="img" aria-label="Grafico lineal de cupos ocupados por hora">
                    {[0, 0.5, 1].map((ratio) => (
                      <line
                        key={ratio}
                        x1={chartPadding}
                        x2={chartWidth - chartPadding}
                        y1={chartPadding + chartInnerHeight * ratio}
                        y2={chartPadding + chartInnerHeight * ratio}
                        className="capacity-line-chart__grid"
                      />
                    ))}

                    <path d={chartPath} className="capacity-line-chart__path" />

                    {chartPoints.map(point => (
                      <g key={`${point.hora}-${point.ocupados}`}>
                        <circle cx={point.x} cy={point.y} r="5" className="capacity-line-chart__point" />
                        <text x={point.x} y={point.y - 12} textAnchor="middle" className="capacity-line-chart__value">
                          {point.ocupados}
                        </text>
                        <text x={point.x} y={chartHeight - 8} textAnchor="middle" className="capacity-line-chart__hour">
                          {point.hora}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="capacity-row capacity-row--empty">
                  No hay cupos para mostrar con el filtro actual.
                </div>
              )}

              <div className="capacity-summary__stats">
                <span><strong>{Math.round(porcentajeCupos)}%</strong> ocupado</span>
                <span><strong>{cuposResumen.ocupados}</strong> ocupados</span>
                <span><strong>{cuposResumen.disponibles}</strong> libres</span>
                <span><strong>{cuposResumen.capacidad}</strong> totales</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-4 gap-3">
            {graficaFiltrada?.map((h) => {

              const hora = h.hora ? h.hora.substring(0,5) : "--:--";
              const porcentaje = h.capacidad > 0
                ? Math.min((h.ocupados / h.capacidad) * 100, 100)
                : 0;
              const lleno = h.ocupados >= h.capacidad;

              return (
                <div key={`${h.id_horario}-${h.dia}-${h.hora}`} className="stat-card">

                  <div className="stat-card-info">
                    <span className="stat-card-label">Horario</span>
                    <span className="stat-card-value">{hora}</span>
                    <p className="text-xs text-gray-500">
                      {h.dia} - {h.hora?.substring(0,5)}
                    </p>
                  </div>

                  <div className="muted">
                    👥 {h.ocupados} / {h.capacidad} cupos
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>

                  <div className={`chip ${lleno ? "chip--rechazado" : "chip--aprobado"}`}>
                    {lleno ? "Lleno" : "Disponible"}
                  </div>

                </div>
              );
            })}
          </div>

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
                    <th>Constancia anterior</th>
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

                          <td>
                            <Mail size={12}/> {insc.usuario?.correo}
                          </td>

                          <td>
                            {ROL_CONFIG[insc.usuario?.id_rol || 0]?.nombre}
                          </td>

                          <td>
                            {formatHora(insc.horario?.hora_inicio)} - {formatHora(insc.horario?.hora_fin)}
                          </td>

                          <td>
                            {formatDias(insc.diasSeleccionados)}
                          </td>

                          <td>
                            {(insc.prioridad || 'sin_historial').replace('_', ' ').toUpperCase()}
                          </td>

                          <td>{insc.constancia?.percentage == null ? 'Sin historial' : `${insc.constancia.percentage}% (${insc.constancia.present}/${insc.constancia.expected})`}</td>

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
                                  <Send size={12}/> Propuesta
                                </button>

                              </div>

                            )}

                          </td>

                        </tr>

                      );

                    })

                  ) : (

                    <tr>
                      <td colSpan={8} className="empty-state">
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
        open={modalPropuestaOpen}
        correoDestino={correoPropuesta}
        idInscripcion={inscripcionActual || 0}
        onClose={() => setModalPropuestaOpen(false)}
        onSuccess={() => {
          if (inscripcionActual) {
            setPropuestasEnviadas(prev => [...prev, inscripcionActual]);
          }
          setAlertTitle('Éxito');
          setAlertMessage('Propuesta enviada correctamente');
          setAlertOpen(true);
        }}
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
