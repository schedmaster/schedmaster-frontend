'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const AVATAR_COLORS = ['ac1','ac2','ac3','ac4','ac5','ac6','ac7','ac8'] as const;
const getAvatarClass = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

interface Asistencia {
  id: number;
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
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);

  const [fecha, setFecha] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );

  const [filterHorario,  setFilterHorario]  = useState('');
  const [filterTipo,     setFilterTipo]     = useState('');
  const [filterEstado,   setFilterEstado]   = useState('pendiente');
  const [filterCarrera,  setFilterCarrera]  = useState('');
  const [filteredAsistencias, setFilteredAsistencias] = useState<Asistencia[]>([]);

  useEffect(() => {
    let f = [...asistencias];
    if (filterHorario) f = f.filter(a => `${a.horarioInicio}-${a.horarioFin}` === filterHorario);
    if (filterTipo)    f = f.filter(a => a.tipoEntrenamiento.toLowerCase() === filterTipo.toLowerCase());
    if (filterEstado)  f = f.filter(a => a.estado === filterEstado);
    if (filterCarrera) f = f.filter(a => a.carrera.toLowerCase() === filterCarrera.toLowerCase());
    setFilteredAsistencias(f);
  }, [asistencias, filterHorario, filterTipo, filterEstado, filterCarrera]);

  const totalReservas  = asistencias.length;
  const presentes      = asistencias.filter(a => a.estado === 'presente').length;
  const ausentes       = asistencias.filter(a => a.estado === 'ausente').length;
  const tasaAsistencia = presentes + ausentes > 0
    ? Math.round((presentes / (presentes + ausentes)) * 100) : 0;

  const handleMarcarPresente = (id: number) =>
    setAsistencias(prev => prev.map(a => a.id === id ? { ...a, estado: 'presente' } : a));

  const handleMarcarAusente = (id: number) =>
    setAsistencias(prev => prev.map(a => a.id === id ? { ...a, estado: 'ausente' } : a));

  return (
    <div className="app">
      <AdminSidebar onLogout={() => console.log('logout')} />

      <main className="main">
        <div className="main-inner">

          {/* Header */}
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

          {/* Filtros */}
          <div className="filter-bar">
            <select className="select" value={filterHorario} onChange={e => setFilterHorario(e.target.value)} aria-label="Filtrar por horario">
              <option value="">Todos los horarios</option>
            </select>
            <select className="select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} aria-label="Filtrar por tipo de entrenamiento">
              <option value="">Todos los tipos</option>
            </select>
            <select className="select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="presente">Presentes</option>
              <option value="ausente">Ausentes</option>
            </select>
            <select className="select" value={filterCarrera} onChange={e => setFilterCarrera(e.target.value)} aria-label="Filtrar por carrera">
              <option value="">Todas las carreras</option>
            </select>
            <button className="btn btn--blue" type="button" onClick={() => console.log('Refrescar:', fecha)}>
              <RefreshCw /> Actualizar
            </button>
            <button 
  className="btn btn--outline"
  type="button"
  onClick={() => window.location.href='/admin-asistencias/historico'}
>
  Histórico
</button>
          </div>

          {/* Stats */}
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

          {/* Lista */}
          <section className="row-list">
            {filteredAsistencias.length === 0 ? (
              <div className="empty-state">
                <p>No hay registros para mostrar</p>
                <small>Los registros aparecerán aquí una vez conectada la API</small>
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
                        <button className="btn-mini btn-mini--green" type="button" onClick={() => handleMarcarPresente(asist.id)}>
                          Presente
                        </button>
                        <button className="btn-mini btn-mini--red" type="button" onClick={() => handleMarcarAusente(asist.id)}>
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
    </div>
  );
}