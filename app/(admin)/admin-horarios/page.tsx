"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Filter, Search, Calendar } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function AdminHorariosPage() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
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
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    fetchHorarios();
    fetch(`http://localhost:3001/api/admin-convocatoria`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPeriodos(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setPeriodos(data.data);
        }
      })
      .catch(err => console.error("Error cargando convocatorias:", err));
  }, []);

  const fetchHorarios = () => {
    fetch(`http://localhost:3001/api/horarios`)
      .then(res => res.json())
      .then(setHorarios)
      .catch(err => console.error("Error cargando horarios:", err));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDia = (dia: string) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, dia]);
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

  // ==========================================
  // FUNCIÓN PARA ELIMINAR BLINDADA
  // ==========================================
  const confirmarEliminarHorario = (id_horario: number) => {
    setPendingDeleteId(id_horario);
    setConfirmOpen(true);
  };

  const ejecutarEliminarHorario = async () => {
    if (!pendingDeleteId) return;

    try {
      const res = await fetch(`http://localhost:3001/api/horarios/eliminar/${pendingDeleteId}`, {
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

  // ==========================================
  // FUNCIÓN EXTRA PARA LIMPIAR EL 1970 EN EL FRONTEND
  // ==========================================
  const limpiarHora = (horaStr: string) => {
    if (!horaStr) return "";
    // Si viene con formato de fecha completa (ej. 1970-01-01T16:42:00.000Z)
    if (horaStr.includes("T")) {
      return new Date(horaStr).toISOString().substring(11, 16);
    }
    // Si ya viene limpia pero con segundos (ej. 16:42:00)
    if (horaStr.length >= 5) {
      return horaStr.substring(0, 5);
    }
    return horaStr;
  };

  // ==========================================
  // FUNCIÓN PARA EDITAR BLINDADA CONTRA NULOS
  // ==========================================
  const handleEditar = (horario: any) => {
    setHorarioAEditar(horario.id_horario);
    
    // Usamos validaciones ( ? y || ) para evitar el error Cannot read properties of undefined
    setFormData({
      id_periodo: horario.id_periodo ? String(horario.id_periodo) : "",
      hora_inicio: limpiarHora(horario.hora_inicio), 
      hora_fin: limpiarHora(horario.hora_fin),
      capacidad_maxima: horario.capacidad_maxima ? String(horario.capacidad_maxima) : ""
    });

    if (horario.dias_semana) {
      const diasArray = horario.dias_semana.split(',').map((d: string) => d.trim());
      setDiasSeleccionados(diasArray);
    } else {
      setDiasSeleccionados([]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const mapaDias: Record<string, number> = {
      "Lunes": 1, "Martes": 2, "Miércoles": 3, 
      "Jueves": 4, "Viernes": 5, "Sábado": 6, "Domingo": 7
    };

    const diasIds = diasSeleccionados.map(dia => mapaDias[dia]);

    const payload = {
      id_periodo: formData.id_periodo,
      hora_inicio: formData.hora_inicio ? formData.hora_inicio + ":00" : "", 
      hora_fin: formData.hora_fin ? formData.hora_fin + ":00" : "",
      capacidad_maxima: parseInt(formData.capacidad_maxima) || 0, 
      dias: diasIds 
    };

    try {
      const url = horarioAEditar 
        ? `http://localhost:3001/api/horarios/editar/${horarioAEditar}` 
        : `http://localhost:3001/api/horarios/crear`; 

      const method = horarioAEditar ? 'PUT' : 'POST';

      const res = await fetch(url, {
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
        setAlertMessage('Error al guardar el horario. Revisa los datos e intenta de nuevo.');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error en la petición POST/PUT:", error);
      setAlertMessage('No se pudo conectar con el servidor para guardar el horario.');
      setAlertOpen(true);
    }
  };

  return (
    <div className="app">
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
              <select className="w-full bg-transparent border-none outline-none font-bold text-gray-700 text-[13px] cursor-pointer">
                <option>Todos los años</option>
                <option>2026</option>
              </select>
            </div>
            <div className="field">
              <Filter />
              <select className="w-full bg-transparent border-none outline-none font-bold text-gray-700 text-[13px] cursor-pointer">
                <option>Todos los periodos</option>
                {periodos.map((p: any) => (
                  <option key={p.id_periodo} value={p.id_periodo}>
                    {p.nombre_periodo}
                  </option>
                ))}
              </select>
            </div>
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
                  {horarios.map((h: any) => (
                    <tr key={h.id_horario}>
                      <td>{h.periodo_nombre !== 'Sin periodo' ? h.periodo_nombre : 'N/A'} {h.anio !== 'N/A' ? `(${h.anio})` : ''}</td>
                      {/* Aquí usamos la misma función de limpiar para que se vea bonito en la tabla */}
                      <td><strong>{limpiarHora(h.hora_inicio)} - {limpiarHora(h.hora_fin)}</strong></td>
                      <td><span className="row-tag">{h.dias_semana || 'Sin días'}</span></td>
                      <td>{h.capacidad_maxima || 0} personas</td>
                      <td>
                        <div className="row-actions">
                          <button 
                            className="btn-icon btn-icon--cyan"
                            onClick={() => handleEditar(h)}
                          >
                            <Edit />
                          </button>
                          
                          <button 
                            className="btn-icon btn-icon--red"
                            onClick={() => confirmarEliminarHorario(h.id_horario)}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    <label>Periodo</label>
                    <select className="auth-select" name="id_periodo" value={formData.id_periodo} onChange={handleChange}>
                      <option value="">Selecciona un periodo...</option>
                      {periodos.map((p: any) => (
                        <option key={p.id_periodo} value={p.id_periodo}>
                          {p.nombre_periodo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hora Inicio</label>
                      <input type="time" className="auth-input" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Hora Fin</label>
                      <input type="time" className="auth-input" name="hora_fin" value={formData.hora_fin} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Capacidad Máxima</label>
                      <input type="number" className="auth-input" name="capacidad_maxima" placeholder="Ej. 30" value={formData.capacidad_maxima} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Días de la semana</label>
                    <div className="dias-container">
                      {DIAS_SEMANA.map(dia => (
                        <button 
                          key={dia} 
                          type="button"
                          className={`dia-btn ${diasSeleccionados.includes(dia) ? 'active' : ''}`}
                          onClick={() => toggleDia(dia)}
                        >
                          {dia}
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