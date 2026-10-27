"use client";
import { apiFetch } from '../../lib/api';
import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Filter, Calendar, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miercoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
  { id: 6, nombre: "Sabado" },
  { id: 7, nombre: "Domingo" }
];

interface Periodo {
  id_periodo: number;
  nombre_periodo: string;
  fecha_inicio_actividades?: string;
}

interface Horario {
  id_horario: number;
  id_periodo: number;
  hora_inicio: string;
  hora_fin: string;
  capacidad_maxima: number;
  periodo_nombre?: string;
  anio?: number | string;
  dias_semana?: string;
  dias_ids?: Array<number | string>;
}

export default function AdminHorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [horarioAEditar, setHorarioAEditar] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id_periodo: "",
    hora_inicio: "",
    hora_fin: "",
    capacidad_maxima: ""
  });
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    fetchHorarios();
    apiFetch(`${API_URL}/admin-convocatoria`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPeriodos(data);
        } else if (Array.isArray(data?.data)) {
          setPeriodos(data.data);
        }
      })
      .catch(err => console.error("Error cargando convocatorias:", err));
  }, []);

  const aniosDisponibles = useMemo(() => {
    const anios = new Set<number>();

    horarios.forEach(horario => {
      const anio = Number(horario.anio);
      if (Number.isInteger(anio)) anios.add(anio);
    });

    periodos.forEach(periodo => {
      if (!periodo.fecha_inicio_actividades) return;
      const anio = new Date(periodo.fecha_inicio_actividades).getFullYear();
      if (Number.isInteger(anio)) anios.add(anio);
    });

    return [...anios].sort((a, b) => b - a);
  }, [horarios, periodos]);

  const periodosDisponibles = useMemo(() => {
    if (!filtroAnio) return periodos;

    return periodos.filter(periodo => {
      const anio = periodo.fecha_inicio_actividades
        ? new Date(periodo.fecha_inicio_actividades).getFullYear()
        : null;
      return String(anio) === filtroAnio;
    });
  }, [filtroAnio, periodos]);

  const horariosFiltrados = useMemo(() => {
    return horarios.filter(horario => {
      const cumpleAnio = !filtroAnio || String(horario.anio) === filtroAnio;
      const cumplePeriodo = !filtroPeriodo || String(horario.id_periodo) === filtroPeriodo;
      return cumpleAnio && cumplePeriodo;
    });
  }, [filtroAnio, filtroPeriodo, horarios]);

  const hayFiltrosActivos = Boolean(filtroAnio || filtroPeriodo);

  const fetchHorarios = () => {
    fetch(`${API_URL}/horarios`)
      .then(res => res.json())
      .then(setHorarios)
      .catch(err => console.error("Error cargando horarios:", err));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDia = (idDia: number) => {
    if (diasSeleccionados.includes(idDia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== idDia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, idDia]);
    }
  };

  const resetFormulario = () => {
    setFormData({ id_periodo: "", hora_inicio: "", hora_fin: "", capacidad_maxima: "" });
    setDiasSeleccionados([]);
    setHorarioAEditar(null);
  };

  const abrirModalCrear = () => {
    resetFormulario();
    setIsModalOpen(true);
  };

  const confirmarEliminarHorario = (id_horario: number) => {
    setPendingDeleteId(id_horario);
    setConfirmOpen(true);
  };

  const ejecutarEliminarHorario = async () => {
    if (!pendingDeleteId) return;

    try {
      const res = await apiFetch(`${API_URL}/horarios/eliminar/${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchHorarios();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Error del backend al eliminar:", errorData);
        setAlertMessage('Hubo un error al eliminar el horario. Intenta nuevamente.');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error de red al eliminar:", error);
      setAlertMessage('No se pudo conectar con el servidor para eliminar.');
      setAlertOpen(true);
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const limpiarHora = (horaStr: string) => {
    if (!horaStr) return "";
    if (horaStr.includes("T")) {
      return new Date(horaStr).toISOString().substring(11, 16);
    }
    if (horaStr.length >= 5) {
      return horaStr.substring(0, 5);
    }
    return horaStr;
  };

  const handleEditar = (horario: Horario) => {
    setHorarioAEditar(horario.id_horario);
    
    setFormData({
      id_periodo: String(horario.id_periodo ?? ""),
      hora_inicio: limpiarHora(horario.hora_inicio), 
      hora_fin: limpiarHora(horario.hora_fin),
      capacidad_maxima: String(horario.capacidad_maxima ?? "")
    });

    if (Array.isArray(horario.dias_ids)) {
      setDiasSeleccionados(horario.dias_ids.map((id: number | string) => Number(id)).filter(Boolean));
    } else {
      setDiasSeleccionados([]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      id_periodo: formData.id_periodo,
      hora_inicio: formData.hora_inicio ? formData.hora_inicio + ":00" : "", 
      hora_fin: formData.hora_fin ? formData.hora_fin + ":00" : "",
      capacidad_maxima: Number.parseInt(formData.capacidad_maxima) || 0, 
      dias: diasSeleccionados 
    };

    try {
      const url = horarioAEditar 
        ? `${API_URL}/horarios/editar/${horarioAEditar}` 
        : `${API_URL}/horarios/crear`; 

      const method = horarioAEditar ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchHorarios(); 
        setIsModalOpen(false); 
        resetFormulario();
      } else {
        const errorDetail = await res.json().catch(() => null);
        console.error("El backend rechazó los datos:", errorDetail);
        setAlertMessage(errorDetail?.message || 'Error al guardar el horario. Revisa los datos e intenta de nuevo.');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error en la petición POST/PUT:", error);
      setAlertMessage('No se pudo conectar con el servidor para guardar el horario.');
      setAlertOpen(true);
    }
  };

  return (
    <div className="app app--admin-schedules">
      <AdminSidebar /> 

      <main className="main min-w-0">
        <div className="main-inner">
          
          <header className="section-header">
            <div>
              <h2>Gestión de Horarios</h2>
              <p>Configura los horarios disponibles para el gimnasio y otras actividades.</p>
            </div>
            <button className="btn btn--blue" onClick={abrirModalCrear}>
              <Plus /> Agregar Horario
            </button>
          </header>

          <div className="filter-bar">
            <div className="field">
              <Calendar />
              <select
                className="field-select"
                value={filtroAnio}
                onChange={(e) => {
                  setFiltroAnio(e.target.value);
                  setFiltroPeriodo("");
                }}
                aria-label="Filtrar por año"
              >
                <option value="">Todos los años</option>
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <Filter />
              <select
                className="field-select"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                aria-label="Filtrar por periodo"
              >
                <option value="">Todos los periodos</option>
                {periodosDisponibles.map((p) => (
                  <option key={p.id_periodo} value={p.id_periodo}>
                    {p.nombre_periodo}
                  </option>
                ))}
              </select>
            </div>
            {hayFiltrosActivos && (
              <button
                type="button"
                className="btn-mini btn-mini--gray schedule-filter-clear"
                onClick={() => {
                  setFiltroAnio("");
                  setFiltroPeriodo("");
                }}
              >
                <X size={14} /> Limpiar
              </button>
            )}
          </div>

          <div className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Horario</th>
                    <th>Días</th>
                    <th>Capacidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosFiltrados.length > 0 ? horariosFiltrados.map((h) => (
                    <tr key={h.id_horario}>
                      <td>{h.periodo_nombre === 'Sin periodo' ? 'N/A' : h.periodo_nombre} {h.anio === 'N/A' ? '' : `(${h.anio})`}</td>
                      {/* Aquí usamos la misma función de limpiar para que se vea bonito en la tabla */}
                      <td><strong>{limpiarHora(h.hora_inicio)} - {limpiarHora(h.hora_fin)}</strong></td>
                      <td><span className="row-tag">{h.dias_semana || 'Sin días'}</span></td>
                      <td>{h.capacidad_maxima || 0} personas</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-icon btn-icon--cyan"
                            onClick={() => handleEditar(h)}
                            aria-label="Editar horario"
                            title="Editar horario"
                          >
                            <Edit />
                          </button>
                          
                          <button
                            type="button"
                            className="btn-icon btn-icon--red"
                            onClick={() => confirmarEliminarHorario(h.id_horario)}
                            aria-label="Eliminar horario"
                            title="Eliminar horario"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        No hay horarios con los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-box modal-box--wide">
                <div className="modal-header">
                  <h3>{horarioAEditar ? 'Editar Horario' : 'Nuevo Horario'}</h3>
                  <button onClick={() => { setIsModalOpen(false); resetFormulario(); }} className="btn-close">×</button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="id_periodo">Periodo</label>
                <select id="id_periodo" className="auth-select" name="id_periodo" value={formData.id_periodo} onChange={handleChange}>
                      <option value="">Selecciona un periodo...</option>
                      {periodos.map((p) => (
                        <option key={p.id_periodo} value={p.id_periodo}>
                          {p.nombre_periodo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="hora_inicio">Hora Inicio</label>
                <input id="hora_inicio" type="time" className="auth-input" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="hora_fin">Hora Fin</label>
                <input id="hora_fin" type="time" className="auth-input" name="hora_fin" value={formData.hora_fin} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="capacidad_maxima">Capacidad Máxima</label>
                <input id="capacidad_maxima" type="number" className="auth-input" name="capacidad_maxima" placeholder="Ej. 30" value={formData.capacidad_maxima} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <span className="input-label">Días de la semana</span>
                    <div className="dias-container">
                      {DIAS_SEMANA.map(dia => (
                        <button 
                          key={dia.id} 
                          type="button"
                          className={`dia-btn ${diasSeleccionados.includes(dia.id) ? 'active' : ''}`}
                          onClick={() => toggleDia(dia.id)}
                        >
                          {dia.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn--outline" onClick={() => { setIsModalOpen(false); resetFormulario(); }}>Cancelar</button>
                  <button className="btn btn--blue" onClick={handleSubmit}>
                    {horarioAEditar ? 'Guardar Cambios' : 'Guardar Horario'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <AlertModal
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar horario"
        message="¿Estás seguro de que quieres eliminar este horario? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={ejecutarEliminarHorario}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
