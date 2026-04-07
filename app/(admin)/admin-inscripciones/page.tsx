'use client';

import { useState, useEffect } from 'react';
import {
  Users, RefreshCw, Check, X, Clock, Mail, GraduationCap, Briefcase
} from 'lucide-react';

import AdminSidebar from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';
import PropuestaModal from '../../components/PropuestaModal';
import AlertModal from '../../components/AlertModal';

const ROL_CONFIG: Record<number, { icon: any; nombre: string; color: string }> = {
  1: { icon: GraduationCap, nombre: 'Estudiante', color: 'var(--blue-light)' },
  2: { icon: Briefcase, nombre: 'Docente', color: 'var(--purple-light)' },
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
  useEffect(() => {
    console.log("GRAFICA STATE:", grafica);
  }, [grafica]);

  // ALERT STATE
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Mensaje');

  const fetchInscripciones = async () => {

    setLoading(true);

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/pendientes`
      );

      if (res.ok) {

        const data = await res.json();
        console.log("GRAFICA:", data.grafica);
        setInscripciones(data.inscripciones || []);
        setGrafica(data.grafica || []);

      } else {

        setAlertTitle('Error');
        setAlertMessage('No se pudieron cargar las inscripciones');
        setAlertOpen(true);

      }

    } catch (err) {

      setAlertTitle('Error');
      setAlertMessage('Error de conexión con el servidor');
      setAlertOpen(true);

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

    } catch {

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

  const formatDias = (dias: any[] | undefined) =>
    dias?.length
      ? dias.map(d => d?.dia?.nombre?.substring(0, 3)).join(', ')
      : 'No seleccionados';

  const formatHora = (hora: string | undefined) =>
    hora ? hora.substring(0, 5) : '--:--';

  const inscripcionesFiltradas =
  (inscripciones || []).filter(i => [1, 2].includes(i.usuario?.id_rol || 0));
  


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
          {/* 📊 GRAFICA */}
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
    <option value="Miércoles">Miércoles</option>
    <option value="Jueves">Jueves</option>
    <option value="Viernes">Viernes</option>
  </select>

</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

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

        {/* 🔥 NUEVO */}
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

      <div className={`chip ${
        lleno ? "chip--rechazado" : "chip--aprobado"
      }`}>
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
                            {(insc.prioridad || 'baja').toUpperCase()}
                          </td>

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

      {/* CONFIRM */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar acción"
        message="¿Deseas continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmarCambio}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* PROPUESTA */}
      <PropuestaModal
        isOpen={modalPropuestaOpen}
        correo={correoPropuesta}
        onClose={() => setModalPropuestaOpen(false)}
        onPropuestaEnviada={() => {

          if (inscripcionActual) {
            setPropuestasEnviadas(prev => [...prev, inscripcionActual]);
          }

          setAlertTitle('Éxito');
          setAlertMessage('Propuesta enviada correctamente');
          setAlertOpen(true);

        }}
      />

      {/* ALERT */}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

    </div>

  );

}