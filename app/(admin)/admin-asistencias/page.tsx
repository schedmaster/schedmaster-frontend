'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search } from 'lucide-react'; 
import AdminSidebar from '../../components/AdminSidebar';
import AlertModal from '../../components/AlertModal';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
}

export default function AdminAsistenciasPage() {
  const router = useRouter();

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);

  const [fecha, setFecha] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterHorario,  setFilterHorario]  = useState('');
  const [filterTipo,     setFilterTipo]     = useState('');
  const [filterEstado,   setFilterEstado]   = useState(''); 
  const [filterCarrera,  setFilterCarrera]  = useState('');
  const [filteredAsistencias, setFilteredAsistencias] = useState<Asistencia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchAsistencias = async (query = '') => {
    try {
      const params = new URLSearchParams();
      params.set('fecha', fecha);

      const term = query.trim();
      if (term) {
        params.set('q', term);
      }

      const res = await fetch(`${API_URL}/asistencias/admin?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        
        const datosFormateados = data.map((item: any) => {
          const [inicio, fin] = item.horario ? item.horario.split(' - ') : ['00:00', '00:00'];
          
          const nombres = item.usuario.split(' ');
          const iniciales = nombres.length > 1 
            ? (nombres[0][0] + nombres[1][0]).toUpperCase() 
            : nombres[0][0].toUpperCase();

          return {
            id: item.id_usuario,
            id_inscripcion: item.id_inscripcion,
            id_horario: item.id_horario,
            nombre: item.usuario,
            apellido: '', 
            iniciales: iniciales,
            horarioInicio: inicio,
            horarioFin: fin,
            tipoEntrenamiento: 'Gimnasio', 
            carrera: item.carrera,
            matricula: item.correo, 
            estado: item.estado.toLowerCase() as 'presente' | 'ausente' | 'pendiente',
          };
        });

        setAsistencias(datosFormateados);
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  };

  useEffect(() => {
    fetchAsistencias();
  }, [fecha]);

  useEffect(() => {
    let f = [...asistencias];
    if (filterHorario) f = f.filter(a => `${a.horarioInicio}-${a.horarioFin}` === filterHorario);
    if (filterTipo)    f = f.filter(a => a.tipoEntrenamiento.toLowerCase() === filterTipo.toLowerCase());
    if (filterEstado)  f = f.filter(a => a.estado === filterEstado);
    if (filterCarrera) f = f.filter(a => a.carrera.toLowerCase() === filterCarrera.toLowerCase());
    
    if (searchTerm) {
      f = f.filter(a => 
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAsistencias(f);
  }, [asistencias, filterHorario, filterTipo, filterEstado, filterCarrera, searchTerm]); 

  const totalReservas  = asistencias.length;
  const presentes      = asistencias.filter(a => a.estado === 'presente').length;
  const ausentes       = asistencias.filter(a => a.estado === 'ausente').length;
  const tasaAsistencia = presentes + ausentes > 0
    ? Math.round((presentes / totalReservas) * 100) : 0;

  const isWithinSchedule = (inicio: string, fin: string) => {
    if (!inicio || !fin || inicio === '00:00') return true; 

    const now = new Date();
    
    const isToday = fecha === now.toISOString().split('T')[0];
    if (!isToday) return true;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    if (inicio <= fin) {
        return currentTime >= inicio && currentTime <= fin;
    } else {
        return currentTime >= inicio || currentTime <= fin;
    }
  };

  const registrarAsistenciaBD = async (asist: Asistencia, asistio: boolean) => {
    
    if (!isWithinSchedule(asist.horarioInicio, asist.horarioFin)) {
      setModalMessage(`Acción denegada: no puedes pasar asistencia fuera de horario. El horario de ${asist.nombre} es de ${asist.horarioInicio} a ${asist.horarioFin}.`);
      setModalOpen(true);
      return; 
    }

    try {
      const res = await fetch(`${API_URL}/asistencias/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: asist.id,
          id_inscripcion: asist.id_inscripcion,
          id_horario: asist.id_horario,
          asistio: asistio,
          id_registrado_por: 1, 
          fecha_registro: fecha
        })
      });

      if (res.ok) {
        setAsistencias(prev => prev.map(a => a.id === asist.id ? { ...a, estado: asistio ? 'presente' : 'ausente' } : a));
      }
    } catch (error) {
      console.error("Error al registrar asistencia:", error);
    }
  };

  return (
    <div className="app app--admin-attendance">
      <AdminSidebar/>

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

          <div className="filter-bar">
            
            <div className="field">
              <Search size={18} color="#888" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="select" value={filterHorario} onChange={e => setFilterHorario(e.target.value)} aria-label="Filtrar por horario">
              <option value="">Todos los horarios</option>
              {Array.from(new Set(asistencias.map(a => `${a.horarioInicio}-${a.horarioFin}`))).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <select className="select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} aria-label="Filtrar por tipo de entrenamiento">
              <option value="">Todos los tipos</option>
              {Array.from(new Set(asistencias.map(a => a.tipoEntrenamiento))).map(t => (
                <option key={t} value={t}>{t}</option>
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
            
            <button className="btn btn--blue btn--asistencias-action" type="button" onClick={() => fetchAsistencias(searchTerm)}>
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

          <section className="row-list">
            {filteredAsistencias.length === 0 ? (
              <div className="empty-state">
                <p>No hay registros para mostrar</p>
                <small>Aún no hay inscripciones aprobadas para el día de hoy o la búsqueda no coincide.</small>
              </div>
            ) : (
              filteredAsistencias.map(asist => (
                <div key={asist.id} className="row-card">
                  <div className={`row-avatar ${getAvatarClass(asist.id)}`}>{asist.iniciales}</div>

                  <div className="row-info">
                    <span className="row-name">{asist.nombre} {asist.apellido}</span>
                    <span className="row-sub muted">
                      {asist.horarioInicio} - {asist.horarioFin}
                      &nbsp;·&nbsp;{asist.tipoEntrenamiento}
                      &nbsp;·&nbsp;{asist.carrera}
                      &nbsp;·&nbsp;{asist.matricula}
                    </span>
                  </div>

                  <div className="row-actions">
                    {asist.estado === 'pendiente' ? (
                      <>
                        <button className="btn-mini btn-mini--green" type="button" onClick={() => registrarAsistenciaBD(asist, true)}>
                          Presente
                        </button>
                        <button className="btn-mini btn-mini--red" type="button" onClick={() => registrarAsistenciaBD(asist, false)}>
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

      <AlertModal
        open={modalOpen}
        title="Aviso"
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}