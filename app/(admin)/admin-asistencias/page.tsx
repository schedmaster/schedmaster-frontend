'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useRouter } from 'next/navigation';

const AVATAR_COLORS = ['ac1','ac2','ac3','ac4','ac5','ac6','ac7','ac8'] as const;
const getAvatarClass = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

interface Asistencia {
  id: number;
  id_inscripcion: number;
  id_horario: number;
  nombre: string;
  apellido: string;
  iniciales: string;
  horarioInicio: string;
  horarioFin: string;
  tipoEntrenamiento: string;
  carrera: string;
  matricula: string;
  estado: 'presente' | 'ausente' | 'pendiente';
  // días en que aplica el horario, ej: ['Lunes', 'Miércoles']
  diasHorario?: string[];
}

export default function AdminAsistenciasPage() {
  const router = useRouter();

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]); 
  const [fecha, setFecha] = useState<string>(() => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHorario, setFilterHorario] = useState('');
  const [filterTipo, setFilterTipo]       = useState('');
  const [filterEstado, setFilterEstado]   = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState(''); 
  
  const [filteredAsistencias, setFilteredAsistencias] = useState<Asistencia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchPeriodos = async () => {
    try {
      const res = await fetch(`${API_URL}/periodos`); 
      if (res.ok) {
        const data = await res.json();
        setPeriodos(data);
        
        // 👈 NUEVO: Auto-seleccionar la convocatoria activa por defecto
        if (data.length > 0) {
          const periodoActivo = data.find((p: any) => p.estado === 'activo') || data[0];
          setFilterPeriodo(periodoActivo.id_periodo.toString());
        }
      }
    } catch (error) {
      console.error('Error al obtener periodos:', error);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const fetchAsistencias = async (query = '') => {
    try {
      const params = new URLSearchParams();
      params.set('fecha', fecha);
      
      if (filterPeriodo) {
        params.set('id_periodo', filterPeriodo);
      }

      const term = query.trim();
      if (term) params.set('q', term);

      const datosFormateados: Asistencia[] = data.map((item: any) => {
        const [inicio, fin] = item.horario ? item.horario.split(' - ') : ['00:00', '00:00'];
        const nombres  = (item.usuario as string).split(' ');
        const iniciales = nombres.length > 1
          ? (nombres[0][0] + nombres[1][0]).toUpperCase()
          : nombres[0][0].toUpperCase();

        return {
          id:               item.id_usuario,
          id_inscripcion:   item.id_inscripcion,
          id_horario:       item.id_horario,
          nombre:           item.usuario,
          apellido:         '',
          iniciales,
          horarioInicio:    inicio.trim(),
          horarioFin:       fin.trim(),
          tipoEntrenamiento:'Gimnasio',
          carrera:          item.carrera,
          matricula:        item.correo,
          estado:           item.estado.toLowerCase() as Asistencia['estado'],
          diasHorario:      item.diasHorario ?? [],
        };
      });

      setAsistencias(datosFormateados);
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  }, [fecha]);

  // Auto‑marcar ausentes cuando pasa la hora (solo si es hoy)
  const autoMarcarAusentes = useCallback(async () => {
    if (!esFechaHoy()) return;

    const now  = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const pendientes = asistencias.filter(a =>
      a.estado === 'pendiente' &&
      a.horarioFin !== '00:00' &&
      hhmm > a.horarioFin
    );

    for (const asist of pendientes) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencias/registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario:       asist.id,
            id_inscripcion:   asist.id_inscripcion,
            id_horario:       asist.id_horario,
            asistio:          false,
            id_registrado_por: 1,
            fecha_registro:   fecha,
          }),
        });
      } catch { /* silencioso */ }
    }

    if (pendientes.length > 0) {
      // Recargamos para reflejar los cambios
      fetchAsistencias();
    }
  }, [asistencias, esFechaHoy, fecha, fetchAsistencias]);

  // Se ejecuta cuando cambia la fecha o el periodo seleccionado
  useEffect(() => { 
    if (filterPeriodo) {
      fetchAsistencias(); 
    }
  }, [fecha, filterPeriodo]);

  // Revisamos ausentes cada minuto
  useEffect(() => {
    autoMarcarAusentes();
    const interval = setInterval(autoMarcarAusentes, 60_000);
    return () => clearInterval(interval);
  }, [autoMarcarAusentes]);

  // ── filtros combinados — useMemo evita closures viejos ──────────
  const filteredAsistencias = useMemo(() => {
    let f = [...asistencias];
    const term = searchTerm.trim().toLowerCase();
    if (term)          f = f.filter(a => a.nombre.toLowerCase().includes(term));
    if (filterHorario) f = f.filter(a => `${a.horarioInicio}-${a.horarioFin}` === filterHorario);
    if (filterTipo)    f = f.filter(a => a.tipoEntrenamiento.toLowerCase() === filterTipo.toLowerCase());
    if (filterEstado)  f = f.filter(a => a.estado === filterEstado);
    if (filterCarrera) f = f.filter(a => a.carrera.toLowerCase() === filterCarrera.toLowerCase());
    return f;
  }, [asistencias, searchTerm, filterHorario, filterTipo, filterEstado, filterCarrera]);

  // ── estadísticas — sobre la vista filtrada ────────────────────
  const totalReservas   = filteredAsistencias.length;
  const presentes       = filteredAsistencias.filter(a => a.estado === 'presente').length;
  const ausentes        = filteredAsistencias.filter(a => a.estado === 'ausente').length;
  const tasaAsistencia  = totalReservas > 0
    ? Math.round((presentes / totalReservas) * 100) : 0;

  // ── registrar con validaciones ────────────────────────────────

  const now = new Date();
  const hoyString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isNotToday = fecha !== hoyString;

  const registrarAsistenciaBD = async (asist: Asistencia, asistio: boolean) => {
    if (isNotToday) {
      setModalMessage("Operación no permitida: Solo se puede registrar asistencia en el día actual.");
      setModalOpen(true);
      return;
    }

    if (!isWithinSchedule(asist.horarioInicio, asist.horarioFin)) {
      setModalMessage(`Acción denegada: no puedes pasar asistencia fuera de horario. El horario de ${asist.nombre} es de ${asist.horarioInicio} a ${asist.horarioFin}.`);
      setModalOpen(true);
      return; 
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencias/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario:        asist.id,
          id_inscripcion:    asist.id_inscripcion,
          id_horario:        asist.id_horario,
          asistio,
          id_registrado_por: 1,
          fecha_registro:    fecha,
        }),
      });
      if (res.ok) {
        setAsistencias(prev =>
          prev.map(a => a.id === asist.id
            ? { ...a, estado: asistio ? 'presente' : 'ausente' }
            : a
          )
        );
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
    }
  };

  const handleRegistrar = (asist: Asistencia, asistio: boolean) => {
    // VALIDACIÓN 1: el día de la semana de la fecha seleccionada debe coincidir
    // con los días del horario del usuario.
    if (!esDiaValido(asist.diasHorario)) {
      setModalMessage(
        `No puedes registrar asistencia: el horario de ${asist.nombre} ` +
        `no corresponde al día seleccionado ` +
        `(aplica los días: ${asist.diasHorario?.join(', ') || 'no definidos'}).`
      );
      setModalOpen(true);
      return;
    }

    // VALIDACIÓN 2: si es hoy, debe estar dentro del rango de hora.
    if (esFechaHoy() && !dentroDeHorario(asist.horarioInicio, asist.horarioFin)) {
      setModalMessage(
        `Acción denegada: no puedes pasar asistencia fuera de horario. ` +
        `El horario de ${asist.nombre} es de ${asist.horarioInicio} a ${asist.horarioFin}.`
      );
      setModalOpen(true);
      return;
    }

    // CONFIRMACIÓN antes de registrar
    const accion = asistio ? 'PRESENTE' : 'AUSENTE';
    setConfirmMessage(`¿Confirmas marcar a ${asist.nombre} como ${accion}?`);
    setPendingAction(() => () => ejecutarRegistro(asist, asistio));
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    pendingAction?.();
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  // ── render ─────────────────────────────────────────────────────

  return (
    <div className="app app--admin-attendance">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Control de Asistencias</h2>
              <p>Registra y monitorea la asistencia de los usuarios</p>
            </div>
            <div className="date-container">
              <label className="date-label" htmlFor="fechaAsistencia">
                Seleccionar fecha
              </label>
              <input
                id="fechaAsistencia"
                type="date"
                className="date-input"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
          </header>

          {/* ── BARRA DE FILTROS ──────────────────────────────────── */}
          <div className="filter-bar">

            <div className="field">
              <Search size={18} color="#888" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 👈 SELECT ACTUALIZADO SIN LA OPCIÓN MANUAL */}
            <select className="select" value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)} aria-label="Filtrar por Convocatoria">
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre_periodo} ({p.estado})
                </option>
              ))}
            </select>

            <select className="select" value={filterHorario} onChange={e => setFilterHorario(e.target.value)} aria-label="Filtrar por horario">
              <option value="">Todos los horarios</option>
              {Array.from(new Set(asistencias.map(a => `${a.horarioInicio}-${a.horarioFin}`))).map(h => (
                <option key={h} value={h}>{h.replace('-', ' – ')}</option>
              ))}
            </select>

            <select className="select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="presente">Presentes</option>
              <option value="ausente">Ausentes</option>
            </select>

            <select className="select" value={filterCarrera} onChange={e => setFilterCarrera(e.target.value)} aria-label="Filtrar por carrera">
              <option value="">Todas las carreras</option>
              {Array.from(new Set(asistencias.map(a => a.carrera))).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button className="btn btn--blue btn--asistencias-action" type="button" onClick={fetchAsistencias}>
              <RefreshCw size={18} /> Actualizar
            </button>

            <button
              type="button"
              className="btn btn--outline btn--asistencias-action"
              onClick={() => router.push('/admin-asistencias/historico')}
            >
              Histórico
            </button>
          </div>

          {/* ── STAT CARDS ───────────────────────────────────────── */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value">{totalReservas}</span>
                <span className="stat-card-label">TOTAL RESERVAS</span>
              </div>
              <div className="stat-card-circle stat-card-circle--blue" />
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value">{presentes}</span>
                <span className="stat-card-label">PRESENTES</span>
              </div>
              <div className="stat-card-circle stat-card-circle--green" />
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value">{ausentes}</span>
                <span className="stat-card-label">AUSENTES</span>
              </div>
              <div className="stat-card-circle stat-card-circle--red" />
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value">{tasaAsistencia}%</span>
                <span className="stat-card-label">TASA ASISTENCIA</span>
              </div>
              <div className="stat-card-circle stat-card-circle--yellow" />
            </div>
          </div>

          {/* ── LISTA ────────────────────────────────────────────── */}
          <section className="row-list">
            {filteredAsistencias.length === 0 ? (
              <div className="empty-state">
                <p>No hay registros para mostrar</p>
                <small>Aún no hay inscripciones aprobadas para el día seleccionado o la búsqueda no coincide.</small>
              </div>
            ) : (
              filteredAsistencias.map(asist => (
                <div key={asist.id} className="row-card">
                  <div className={`row-avatar ${getAvatarClass(asist.id)}`}>{asist.iniciales}</div>

                  <div className="row-info">
                    <span className="row-name">{asist.nombre} {asist.apellido}</span>
                    <span className="row-sub muted">
                      {asist.horarioInicio} – {asist.horarioFin}
                      &nbsp;·&nbsp;{asist.carrera}
                    </span>
                    <span className="row-sub muted">{asist.matricula}</span>
                  </div>

                  <div className="row-actions">
                    {asist.estado === 'pendiente' ? (
                      <>
                        <button
                          className={`btn-mini ${isNotToday ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-400' : 'btn-mini--green'}`}
                          type="button"
                          disabled={isNotToday}
                          onClick={() => registrarAsistenciaBD(asist, true)}
                        >
                          Presente
                        </button>
                        <button
                          className={`btn-mini ${isNotToday ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-400' : 'btn-mini--red'}`}
                          type="button"
                          disabled={isNotToday}
                          onClick={() => registrarAsistenciaBD(asist, false)}
                        >
                          Ausente
                        </button>
                      </>
                    ) : (
                      <span className={`chip chip--${asist.estado}`}>
                        {asist.estado.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </main>

      {/* Alert — horario inválido */}
      <AlertModal
        open={modalOpen}
        title="Aviso"
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      {/* Confirm — antes de registrar presente/ausente */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar registro"
        message={confirmMessage}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}