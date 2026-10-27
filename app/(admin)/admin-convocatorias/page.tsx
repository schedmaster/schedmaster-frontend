'use client';
import { apiFetch } from '../../lib/api';

import { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarDays, Pencil, Power, PowerOff, X, Save, Search, Mail } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AlertModal from '../../components/AlertModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Convocatoria {
  id: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaIngreso: string;
  fechaFinPeriodo: string;
  estado: 'activada' | 'desactivada';
}

type FormState = Convocatoria;
type EstadoFiltro = '' | 'activada' | 'desactivada';
type EditableField = Exclude<keyof FormState, 'id'>;

interface PeriodoApi {
  id_periodo: number;
  nombre_periodo: string;
  fecha_inicio_inscripcion: string;
  fecha_fin_inscripcion: string;
  fecha_inicio_actividades: string;
  fecha_fin_periodo: string;
  estado: string;
}

interface FieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface ModalProps {
  onClose: () => void;
  title: string;
  subtitle: string;
  field: (key: EditableField) => FieldProps;
  guardarConvocatoria: () => void;
}

const ModalContent = ({
  onClose,
  title,
  subtitle,
  field,
  guardarConvocatoria
}: ModalProps) => (
  <div className="modal-box modal-box--wide">

    <div className="modal-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <button type="button" className="btn-close" onClick={onClose} title="Cerrar">
        <X />
      </button>
    </div>

    <div className="modal-body">

      <div className="form-group">
        <label htmlFor="periodo"><CalendarDays /> Periodo</label>
        <input
          className="form-select"
          type="text"
          placeholder="Ej. Mayo – Agosto 2026"
          {...field('periodo')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaInicio">Fecha inicio inscripciones</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaInicio')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaFin">Fecha fin inscripciones</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaFin')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaIngreso">Fecha ingreso oficial</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaIngreso')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaFinPeriodo">Fecha fin del periodo</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaFinPeriodo')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="estado">Estado</label>
        <select id="estado" className="form-select" {...field('estado')}>
          <option value="activada">Activada</option>
          <option value="desactivada">Desactivada</option>
        </select>
      </div>

    </div>

    <div className="modal-footer">
      <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
      <button type="button" className="btn btn--blue" onClick={guardarConvocatoria}>
        <Save /> Guardar
      </button>
    </div>

  </div>
);

const mapConvocatorias = (payload: unknown): Convocatoria[] => {
  const maybePayload = payload as { data?: unknown };
  const source = Array.isArray(payload) ? payload : maybePayload?.data;

  if (!Array.isArray(source)) return [];

  return (source as PeriodoApi[]).map((p) => ({
    id: p.id_periodo,
    periodo: p.nombre_periodo,
    fechaInicio: p.fecha_inicio_inscripcion.split('T')[0],
    fechaFin: p.fecha_fin_inscripcion.split('T')[0],
    fechaIngreso: p.fecha_inicio_actividades.split('T')[0],
    fechaFinPeriodo: p.fecha_fin_periodo.split('T')[0],
    estado: p.estado === 'activo' ? 'activada' : 'desactivada'
  }));
};

export default function AdminConvocatoriasPage() {

  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Mensaje');
  const [alertMessage, setAlertMessage] = useState('');
  const [notificandoId, setNotificandoId] = useState<number | null>(null);

  const emptyForm: FormState = {
    id: 0,
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
    fechaIngreso: '',
    fechaFinPeriodo: '',
    estado: 'activada'
  };

  const [form, setForm] = useState<FormState>(emptyForm);

  const cargarConvocatorias = useCallback(async (query = '', estado: EstadoFiltro = '') => {
    try {
      const term = query.trim();
      const baseUrl = `${API_URL}/admin-convocatoria`;
      const params = new URLSearchParams();

      if (term) params.set('q', term);
      if (estado) params.set('estado', estado === 'activada' ? 'activo' : 'inactivo');

      const queryString = params.toString();
      const endpoint = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const res = await apiFetch(endpoint);

      if (!res.ok) {
        setConvocatorias([]);
        return;
      }

      const data = await res.json();
      setConvocatorias(mapConvocatorias(data));

    } catch (error) {
      console.error("Error cargando convocatorias", error);
      setConvocatorias([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarConvocatorias(searchQuery, estadoFiltro);
    }, 250);

    return () => clearTimeout(timer);
  }, [cargarConvocatorias, searchQuery, estadoFiltro]);

  const openCrear = () => {
    setForm(emptyForm);
    setModalCrear(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCrear = () => {
    setModalCrear(false);
    document.body.style.overflow = '';
  };

  const openEditar = (c: Convocatoria) => {
    setForm(c);
    setModalEditar(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditar = () => {
    setModalEditar(false);
    document.body.style.overflow = '';
  };

  const field = (key: EditableField) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const getUsuarioActualId = () => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return undefined;

      const user = JSON.parse(rawUser);
      return Number.isInteger(user?.id_usuario) ? user.id_usuario : undefined;
    } catch {
      return undefined;
    }
  };

  const guardarConvocatoria = async () => {
    try {

      const esEdicion = form.id > 0;
      const url = esEdicion 
        ? `${API_URL}/admin-convocatoria/${form.id}`
        : `${API_URL}/admin-convocatoria`;

      const res = await apiFetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_periodo: form.periodo,
          fecha_inicio_inscripcion: form.fechaInicio,
          fecha_fin_inscripcion: form.fechaFin,
          fecha_inicio_actividades: form.fechaIngreso,
          fecha_fin_periodo: form.fechaFinPeriodo,
          estado: form.estado === 'activada' ? 'activo' : 'inactivo',
          id_entrenador: getUsuarioActualId()
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Error al guardar");
      }

      closeCrear();
      closeEditar();
      cargarConvocatorias(searchQuery, estadoFiltro);

    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage(error instanceof Error ? error.message : 'Error al guardar convocatoria');
      setAlertOpen(true);
    }
  };

  const notificarConvocatoria = async (convocatoria: Convocatoria) => {
    try {
      setNotificandoId(convocatoria.id);

      const res = await apiFetch(`${API_URL}/admin-convocatoria/${convocatoria.id}/notificar`, {
        method: 'POST'
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Error al notificar convocatoria');
      }

      setAlertTitle('Notificacion enviada');
      setAlertMessage(
        `Se enviaron ${data?.notificados ?? 0} correo(s). Pendientes encontrados: ${data?.pendientes ?? 0}. Fallidos: ${data?.fallidos ?? 0}.`
      );
      setAlertOpen(true);
    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage(error instanceof Error ? error.message : 'Error al notificar convocatoria');
      setAlertOpen(true);
    } finally {
      setNotificandoId(null);
    }
  };

  return (
    <div className="app">
      <AdminSidebar />
      <main className="main">
        <div className="main-inner">
          <header className="section-header">
            <div>
              <h2>Convocatorias</h2>
              <p>Administra los periodos de inscripción disponibles</p>
            </div>

            <button className="btn btn--yellow" onClick={openCrear}>
              <Plus /> Nueva convocatoria
            </button>
          </header>

          <section className="filter-bar">
            <div className="field">
              <Search />
              <input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="field">
              <Power />
              <select
                className="field-select"
                value={estadoFiltro}
                onChange={e => setEstadoFiltro(e.target.value as EstadoFiltro)}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="activada">Activas</option>
                <option value="desactivada">Desactivadas</option>
              </select>
            </div>
          </section>

          <section className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Inicio inscripciones</th>
                    <th>Fin inscripciones</th>
                    <th>Ingreso oficial</th>
                    <th>Fin del periodo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {convocatorias.length > 0 ? convocatorias.map(c => (
                    <tr key={c.id}>
                      <td>{c.periodo}</td>
                      <td className="muted">{c.fechaInicio}</td>
                      <td className="muted">{c.fechaFin}</td>
                      <td className="muted">{c.fechaIngreso}</td>
                      <td className="muted">{c.fechaFinPeriodo}</td>
                      <td>
                        <span className={`chip chip--${c.estado}`}>
                          {c.estado === 'activada' ? <Power size={14} /> : <PowerOff size={14} />}
                          {c.estado}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {c.estado === 'activada' && (
                            <button
                              type="button"
                              className="btn-mini btn-mini--blue"
                              onClick={() => notificarConvocatoria(c)}
                              disabled={notificandoId === c.id}
                              title="Notificar convocatoria activa"
                            >
                              <Mail size={14} />
                              {notificandoId === c.id ? 'Enviando' : 'Notificar'}
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-icon btn-icon--cyan"
                            onClick={() => openEditar(c)}
                            title="Editar convocatoria"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        No hay convocatorias con los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {modalCrear && (
        <div className="modal-overlay">
          <ModalContent
            onClose={closeCrear}
            title="Nueva convocatoria"
            subtitle="Configura un nuevo periodo de inscripciones"
            field={field}
            guardarConvocatoria={guardarConvocatoria}
          />
        </div>
      )}

      {modalEditar && (
        <div className="modal-overlay">
          <ModalContent
            onClose={closeEditar}
            title="Editar convocatoria"
            subtitle="Actualiza la información del periodo"
            field={field}
            guardarConvocatoria={guardarConvocatoria}
          />
        </div>
      )}

      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

    </div>
  );
}
