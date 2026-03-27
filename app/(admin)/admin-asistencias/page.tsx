'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

  const [filteredAsistencias, setFilteredAsistencias] = useState<Asistencia[]>([]);

  /* ==========================
     CARGAR ASISTENCIAS
  ========================== */
  const cargarAsistencias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-asistencia/asistencias?fecha=${fecha}`);
      const data = await res.json();
      setAsistencias(data);
    } catch (error) {
      console.error("Error cargando asistencias:", error);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [fecha]);

  useEffect(() => {
    setFilteredAsistencias(asistencias);
  }, [asistencias]);

  /* ==========================
     STATS
  ========================== */
  const totalReservas  = asistencias.length;
  const presentes      = asistencias.filter(a => a.estado === 'presente').length;
  const ausentes       = asistencias.filter(a => a.estado === 'ausente').length;

  const tasaAsistencia = presentes + ausentes > 0
    ? Math.round((presentes / (presentes + ausentes)) * 100)
    : 0;

  /* ==========================
     MARCAR ASISTENCIA
  ========================== */
  const handleMarcarPresente = async (id: number) => {
    await fetch(`${API_URL}/api/admin-asistencia/marcar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_inscripcion: id,
        asistio: true
      })
    });

    cargarAsistencias();
  };

  const handleMarcarAusente = async (id: number) => {
    await fetch(`${API_URL}/api/admin-asistencia/marcar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_inscripcion: id,
        asistio: false
      })
    });

    cargarAsistencias();
  };

  return (
    <div className="app">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          {/* HEADER */}
          <header className="section-header">
            <div>
              <h2>Control de Asistencias</h2>
              <p>Registra y monitorea la asistencia</p>
            </div>

            <div className="date-container">
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
          </header>

          {/* BOTONES */}
          <div className="filter-bar">
            <button className="btn btn--blue" onClick={cargarAsistencias}>
              <RefreshCw size={16}/> Actualizar
            </button>

            <button
              className="btn btn--outline"
              onClick={() => window.location.href='/admin-asistencias/historico'}
            >
              Histórico
            </button>
          </div>

          {/* STATS */}
          <div className="stat-grid">
            <div className="stat-card">
              <span>{totalReservas}</span>
              <small>TOTAL</small>
            </div>

            <div className="stat-card">
              <span>{presentes}</span>
              <small>PRESENTES</small>
            </div>

            <div className="stat-card">
              <span>{ausentes}</span>
              <small>AUSENTES</small>
            </div>

            <div className="stat-card">
              <span>{tasaAsistencia}%</span>
              <small>ASISTENCIA</small>
            </div>
          </div>

          {/* LISTA */}
          <section className="row-list">
            {filteredAsistencias.map(asist => (
              <div key={asist.id} className="row-card">

                <div className={`row-avatar ${getAvatarClass(asist.id)}`}>
                  {asist.iniciales}
                </div>

                <div className="row-info">
                  <span className="row-name">
                    {asist.nombre} {asist.apellido}
                  </span>

                  <span className="row-sub muted">
                    {asist.horarioInicio} - {asist.horarioFin}
                  </span>
                </div>

                <div className="row-actions">
                  {asist.estado === 'pendiente' ? (

                    <div className="action-buttons">

                      <button
                        className="btn-mini btn-mini--green"
                        onClick={() => handleMarcarPresente(asist.id)}
                      >
                        <Check size={12}/> Presente
                      </button>

                      <button
                        className="btn-mini btn-mini--red"
                        onClick={() => handleMarcarAusente(asist.id)}
                      >
                        <X size={12}/> Ausente
                      </button>

                    </div>

                  ) : (

                    <span className={`chip chip--${asist.estado}`}>
                      {asist.estado.toUpperCase()}
                    </span>

                  )}
                </div>

              </div>
            ))}
          </section>

        </div>
      </main>
    </div>
  );
}