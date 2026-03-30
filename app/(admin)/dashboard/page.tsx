'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';

// Definimos cómo se ve un alumno pendiente
interface Pendiente {
  id: number;
  nombre: string;
  carrera: string;
  servicio: string;
  fecha: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  // Ampliamos el estado para recibir la lista de pendientes
  const [stats, setStats] = useState({
    inscripcionesPendientes: 0,
    usuariosRegistrados: 0,
    asistenciasHoy: 0,
    serviciosActivos: 0,
    ultimasPendientes: [] as Pendiente[] // 👈 Aquí se guardará la lista
  });

  useEffect(() => {
    const verificarAcceso = () => {
      const usuarioLogueado = localStorage.getItem('user');
      if (!usuarioLogueado) {
        router.push('/login');
      } else {
        setAutorizado(true);
      }
    };

    const cargarStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/asistencias/dashboard-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error al cargar stats:", error);
      }
    };

    const timer = setTimeout(() => {
      verificarAcceso();
      cargarStats();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (!autorizado) {
    return (
      <div className="loader">
        <p>Cargando SchedMaster...</p>
      </div>
    );
  }

  return (
    <div className="app">
     <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          {/* Header */}
          <header className="section-header">
            <div>
              <h2>Dashboard</h2>
              <p>Bienvenido al panel de administración de SchedMaster.</p>
            </div>
          </header>

          {/* 1. Cards estadísticas Superiores */}
          <section className="stat-grid" aria-label="Resumen del sistema" style={{ marginBottom: '30px' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #00a4e0' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>INSCRIPCIONES PENDIENTES</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>
                {stats.inscripcionesPendientes}
              </span>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>USUARIOS REGISTRADOS</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>
                {stats.usuariosRegistrados}
              </span>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #22c55e' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>ASISTENCIAS HOY</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>
                {stats.asistenciasHoy}
              </span>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>SERVICIOS ACTIVOS</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>
                {stats.serviciosActivos}
              </span>
            </div>
          </section>

          {/* 2. NUEVA SECCIÓN: Tabla rápida de pendientes */}
          <section className="table-area" style={{ marginTop: '10px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Solicitudes recientes por aprobar</h3>
              <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Alumnos que están en espera de revisión de horario.</p>
            </div>
            
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '15px' }}>Alumno</th>
                    <th style={{ padding: '15px' }}>Carrera</th>
                    <th style={{ padding: '15px' }}>Servicio</th>
                    <th style={{ padding: '15px' }}>Fecha de solicitud</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ultimasPendientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        ¡Todo al día! No hay inscripciones pendientes de revisar. 🎉
                      </td>
                    </tr>
                  ) : (
                    stats.ultimasPendientes.map((fila) => (
                      <tr key={fila.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{fila.nombre}</td>
                        <td style={{ padding: '15px', color: '#64748b' }}>{fila.carrera}</td>
                        <td style={{ padding: '15px', color: '#64748b' }}>{fila.servicio}</td>
                        <td style={{ padding: '15px', color: '#64748b' }}>
                          {new Date(fila.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button 
                            onClick={() => router.push('/admin-inscripciones')}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#0369a1', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s' }}>
                            Ir a revisar
                          </button>
                        </td>
                      </tr>
                    ))
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