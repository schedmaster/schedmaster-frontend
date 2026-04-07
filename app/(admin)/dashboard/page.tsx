'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Eye, Mail, UserPlus, CalendarCheck, Activity, Award, AlertTriangle, Flame, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

// Generar etiquetas de los últimos 12 meses
const obtenerNombresMeses = () => {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesActual = new Date().getMonth();
  return [...meses.slice(mesActual + 1), ...meses.slice(0, mesActual + 1)];
};

const formatNumber = (num: number) => num.toLocaleString('en-US');

// ── Sub-componentes Visuales Mejorados ──

// 1. Gráfica arreglada (Ya no se aplastará)
const Sparkline = ({ data, secondary, color = '#00a4e0' }: { data: number[]; secondary?: number[]; color?: string }) => {
  const h = 120, w = 800;
  const max  = Math.max(...data, ...(secondary ?? []), 1); 
  const step = w / (Math.max(data.length - 1, 1));
  const toPath = (arr: number[]) => arr.map((v,i) => `${i===0?'M':'L'} ${i*step} ${h-(v/max)*h}`).join(' ');
  const toArea = (arr: number[]) => toPath(arr) + ` L ${(arr.length-1)*step} ${h} L 0 ${h} Z`;
  const mesesLabels = obtenerNombresMeses();
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '280px', marginTop: '20px' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '85%', overflow: 'visible' }} preserveAspectRatio="none">
        {[0.25,0.5,0.75].map(r => <line key={r} x1={0} x2={w} y1={h*(1-r)} y2={h*(1-r)} stroke="rgba(15,23,42,0.06)" strokeWidth={1} />)}
        {secondary && <path d={toArea(secondary)} fill="rgba(59,130,246,0.07)" />}
        <path d={toArea(data)} fill={`${color}18`} />
        {secondary && <path d={toPath(secondary)} fill="none" stroke="rgba(59,130,246,0.45)" strokeWidth={2} strokeDasharray="4 3" />}
        <path d={toPath(data)} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v,i) => <circle key={i} cx={i*step} cy={h-(v/max)*h} r={4} fill={color} stroke="white" strokeWidth={1.5} />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
        {mesesLabels.map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>
  );
};

// 2. Nuevo diseño para KPIs (Lista elegante en lugar de tarjetas repetitivas)
const CompactKpi = ({ icon, color, label, value, suffix = '' }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ backgroundColor: `${color}15`, color: color, padding: '10px', borderRadius: '10px', display: 'flex' }}>
        {icon}
      </div>
      <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>{label}</span>
    </div>
    <span style={{ fontWeight: '800', fontSize: '20px', color: '#0f172a' }}>{value !== undefined ? formatNumber(value) : '0'}{suffix}</span>
  </div>
);


// ── PÁGINA PRINCIPAL ──
export default function DashboardPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [stats, setStats] = useState({
    basicos: { inscripcionesPendientes: 0, usuariosRegistrados: 0, asistenciasHoy: 0, serviciosActivos: 0 },
    kpis: { interesados: 0, notificados: 0, inscritos: 0, asistencia: 0, anuncios: 0 },
    insights: { conversion: "0.0" },
    tendencias: { inscripcionesMes: Array(12).fill(0), interesadosMes: Array(12).fill(0) }
  });

  useEffect(() => {
    const verificarAcceso = () => {
      if (!localStorage.getItem('user')) router.push('/login');
      else setAutorizado(true);
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
      } finally {
        setCargando(false);
      }
    };

    verificarAcceso();
    cargarStats();
  }, [router]);

  if (!autorizado || cargando) {
    return <div className="loader"><p>Cargando analíticas...</p></div>;
  }

  return (
    <div className="app">
     <AdminSidebar />

      <main className="main">
        <div className="main-inner">
          <header className="section-header">
            <div>
              <h2>Dashboard</h2>
              <p>Resumen analítico y operativo de SchedMaster.</p>
            </div>
          </header>

          {/* 1. CARDS PRINCIPALES (Hasta arriba) */}
          <section className="stat-grid" style={{ marginBottom: '25px' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #00a4e0' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>INSCRIPCIONES PENDIENTES</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>{stats.basicos.inscripcionesPendientes}</span>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>USUARIOS REGISTRADOS</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>{stats.basicos.usuariosRegistrados}</span>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #22c55e' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>ASISTENCIAS HOY</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>{stats.basicos.asistenciasHoy}</span>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <span className="stat-card-label" style={{ fontWeight: 'bold', color: '#64748b' }}>SERVICIOS ACTIVOS</span>
              <span className="stat-card-value" style={{ fontSize: '28px', color: '#0f172a' }}>{stats.basicos.serviciosActivos}</span>
            </div>
          </section>

          {/* 2. GRÁFICA MOVIDA HACIA ARRIBA (Y arreglada para no aplastarse) */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Tendencia mensual</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Interesados (Lista de espera) vs Inscripciones aprobadas — últimos 12 meses</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00a4e0' }} /> Inscritos
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.3)' }} /> Interesados
                </div>
              </div>
            </div>
            <Sparkline data={stats.tendencias.inscripcionesMes} secondary={stats.tendencias.interesadosMes} />
          </section>

          {/* 3. DOS COLUMNAS: Lista de KPIs a la izquierda, Insights a la derecha */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            
            {/* Columna Izquierda: Métricas convertidas en lista */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '16px' }}>Métricas de rendimiento</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <CompactKpi icon={<Eye size={20}/>} color="#3b82f6" label="Interesados registrados" value={stats.kpis.interesados} />
                <CompactKpi icon={<Mail size={20}/>} color="#a855f7" label="Notificados por correo" value={stats.kpis.notificados} />
                <CompactKpi icon={<UserPlus size={20}/>} color="#22c55e" label="Inscripciones completadas" value={stats.kpis.inscritos} />
                <CompactKpi icon={<CalendarCheck size={20}/>} color="#eab308" label="Asistencia promedio" value={stats.kpis.asistencia} suffix="%" />
                <CompactKpi icon={<Activity size={20}/>} color="#06b6d4" label="Anuncios publicados" value={stats.kpis.anuncios} />
              </div>
            </div>

            {/* Columna Derecha: Tarjetas de Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#dcfce7', color: '#22c55e', padding: '10px', borderRadius: '10px' }}><Award size={24} /></div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>Tasa de conversión actual</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>El <strong>{stats.insights.conversion}%</strong> de los interesados en la lista de espera han logrado completar su inscripción.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#fef3c7', color: '#eab308', padding: '10px', borderRadius: '10px' }}><AlertTriangle size={24} /></div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>Rendimiento de asistencia</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>La asistencia global a los entrenamientos se mantiene en un <strong>{stats.kpis.asistencia}%</strong>. Monitorea los días de menor concurrencia.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', padding: '10px', borderRadius: '10px' }}><Flame size={24} /></div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>DTAI lidera inscripciones</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Ingeniería en Desarrollo y Gestión de Software sigue siendo la carrera con mayor interés en el servicio.</p>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}