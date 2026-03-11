'use client';

import { useState } from 'react';
import {
  Users, Download, RefreshCw, TrendingUp, TrendingDown, Minus,
  Mail, CheckCircle, Clock, Eye, AlertTriangle, Flame, Sparkles,
  Activity, Award, Check, X, FileText, Database, CalendarCheck,
  UserPlus,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

// ── Datos de demo ────────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DIAS  = ['Lun','Mar','Mié','Jue','Vie','Sáb'];

const mockKPIs = {
  interesados: { valor: 1284, cambio: +12.4 },
  notificados: { valor: 1210, cambio: +8.1  },
  inscritos:   { valor: 847,  cambio: +5.3  },
  asistencia:  { valor: 78.4, cambio: -2.1, suffix: '%' },
  anuncios:    { valor: 34,   cambio: +18.7 },
};
const inscripcionesMes = [42,58,71,95,88,110,134,122,148,155,143,160];
const interesadosMes   = [68,90,105,140,130,160,185,170,195,210,192,215];
const funnelData = [
  { label: 'Interesados registrados',   count: 1284, color: '#00a4e0' },
  { label: 'Notificados por correo',    count: 1210, color: '#3b82f6' },
  { label: 'Abrieron convocatoria',     count: 980,  color: '#8b5cf6' },
  { label: 'Iniciaron inscripción',     count: 910,  color: '#ebbA3d' },
  { label: 'Inscripciones completadas', count: 847,  color: '#22c55e' },
];
const porRol = [
  { label: 'Estudiante', count: 612, color: '#00a4e0' },
  { label: 'Docente',    count: 128, color: '#3b82f6' },
  { label: 'Entrenador', count: 54,  color: '#8b5cf6' },
  { label: 'Nutrióloga', count: 32,  color: '#ebbA3d' },
  { label: 'Admin',      count: 21,  color: '#22c55e' },
];
const porDivision = [
  { label: 'DTAI', count: 310 },
  { label: 'DMEC', count: 245 },
  { label: 'DIND', count: 178 },
  { label: 'DEA',  count: 77  },
  { label: 'DAE',  count: 37  },
];
const heatmapData = [
  [85,90,88,92,78],[70,75,80,68,72],[92,95,91,89,94],
  [60,65,70,58,63],[88,85,90,87,82],[45,55,48,52,50],
];
const topAsistencia = [
  { nombre: 'Fernanda López',  division: 'DTAI', pct: 98 },
  { nombre: 'Carlos Mendoza',  division: 'DMEC', pct: 96 },
  { nombre: 'Ana Gutiérrez',   division: 'DIND', pct: 95 },
  { nombre: 'Ricardo Torres',  division: 'DTAI', pct: 93 },
  { nombre: 'Sofía Ramírez',   division: 'DEA',  pct: 91 },
  { nombre: 'Luis Herrera',    division: 'DMEC', pct: 89 },
];
const actividadReciente = [
  { texto: '<strong>47 nuevas inscripciones</strong> en la última hora', tiempo: 'Hace 12 min', color: '#22c55e' },
  { texto: 'Convocatoria enviada a <strong>1,210 interesados</strong>',  tiempo: 'Hace 1h',     color: '#00a4e0' },
  { texto: 'Admin publicó anuncio <strong>"Cambio de horario semana 8"</strong>', tiempo: 'Hace 3h', color: '#8b5cf6' },
  { texto: 'Asistencia marcada para <strong>234 usuarios</strong> · Lunes', tiempo: 'Hace 5h',  color: '#ebbA3d' },
  { texto: '<strong>12 inscripciones rechazadas</strong> por cupo',       tiempo: 'Hace 8h',    color: '#ef4444' },
];
const detalleTabla = [
  { convocatoria: 'Conv. Otoño 2024',     periodo: 'Sep–Dic 2024', interesados: 412, notificados: 395, inscritos: 278, asistencia: 81.2, estado: 'cerrado' },
  { convocatoria: 'Conv. Primavera 2025', periodo: 'Ene–Abr 2025', interesados: 388, notificados: 372, inscritos: 261, asistencia: 76.5, estado: 'cerrado' },
  { convocatoria: 'Conv. Verano 2025',    periodo: 'May–Ago 2025', interesados: 484, notificados: 443, inscritos: 308, asistencia: 79.1, estado: 'activo'  },
];

// ── Helpers ──────────────────────────────────────────────────────
const getHeatColor = (v: number) =>
  v >= 90 ? '#00a4e0' : v >= 75 ? '#38bdf8' : v >= 60 ? '#bae6fd' : v >= 40 ? '#fde68a' : '#fca5a5';
const getInitials  = (n: string) => n.split(' ').slice(0,2).map(x => x[0]).join('').toUpperCase();
const avatarColors = ['#00a4e0','#3b82f6','#8b5cf6','#ebbA3d','#22c55e','#ef4444'];

// ── Sub-componentes ──────────────────────────────────────────────
const Sparkline = ({ data, secondary, color = '#00a4e0' }: { data: number[]; secondary?: number[]; color?: string }) => {
  const h = 120, w = 800;
  const max  = Math.max(...data, ...(secondary ?? []));
  const step = w / (data.length - 1);
  const toPath = (arr: number[]) => arr.map((v,i) => `${i===0?'M':'L'} ${i*step} ${h-(v/max)*h}`).join(' ');
  const toArea = (arr: number[]) => toPath(arr) + ` L ${(arr.length-1)*step} ${h} L 0 ${h} Z`;
  return (
    <div className="sparkline-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="sparkline-svg" preserveAspectRatio="none">
        {[0.25,0.5,0.75].map(r => <line key={r} x1={0} x2={w} y1={h*(1-r)} y2={h*(1-r)} stroke="rgba(15,23,42,0.06)" strokeWidth={1} />)}
        {secondary && <path d={toArea(secondary)} fill="rgba(59,130,246,0.07)" />}
        <path d={toArea(data)} fill={`${color}18`} />
        {secondary && <path d={toPath(secondary)} fill="none" stroke="rgba(59,130,246,0.45)" strokeWidth={2} strokeDasharray="4 3" />}
        <path d={toPath(data)} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v,i) => <circle key={i} cx={i*step} cy={h-(v/max)*h} r={3.5} fill={color} />)}
      </svg>
      <div className="sparkline-axis">{MESES.map(m => <span key={m}>{m}</span>)}</div>
    </div>
  );
};

const Donut = ({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) => {
  const r = 60, circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = data.map(d => { const len = (d.count/total)*circ; const s = {...d,len,offset}; offset+=len; return s; });
  return (
    <div className="donut-wrap">
      <div className="donut-svg-wrap">
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth={22} />
          {segs.map((s,i) => (
            <circle key={i} cx={80} cy={80} r={r} fill="none" stroke={s.color} strokeWidth={22}
              strokeDasharray={`${s.len} ${circ-s.len}`}
              strokeDashoffset={-s.offset + circ*0.25} strokeLinecap="round" />
          ))}
        </svg>
        <div className="donut-center">
          <div className="donut-center-value">{total.toLocaleString('en-US')}</div>
          <div className="donut-center-label">Total</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d,i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-legend-left">
              <div className="donut-dot" data-color={d.color} />
              <span className="donut-legend-label">{d.label}</span>
            </div>
            <span className="donut-legend-count">{d.count.toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: { label: string; count: number }[] }) => {
  const max = Math.max(...data.map(d => d.count));
  const colors = ['#00a4e0','#3b82f6','#8b5cf6','#ebbA3d','#22c55e'];
  return (
    <div className="bar-chart">
      <div className="bar-chart-grid">{[0,1,2,3].map(i => <div key={i} className="grid-line" />)}</div>
      {data.map((d,i) => (
        <div key={i} className="bar-group">
          <div className="bar-stack">
            <div className="bar" data-index={i} data-height={`${(d.count/max)*100}%`} data-color={colors[i%colors.length]}>
              <div className="bar-tooltip">{d.count.toLocaleString('en-US')}</div>
            </div>
          </div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
};

const Funnel = () => {
  const max = funnelData[0].count;
  return (
    <div className="funnel-chart">
      {funnelData.map((row,i) => (
        <div key={i}>
          {i > 0 && <div className="funnel-arrow">↓ {((row.count/funnelData[i-1].count)*100).toFixed(1)}% continúan</div>}
          <div className="funnel-row">
            <div className="funnel-header">
              <span>{row.label}</span>
              <span className="funnel-count">{row.count.toLocaleString('en-US')}</span>
            </div>
            <div className="funnel-track">
              <div className="funnel-fill" data-width={`${(row.count/max)*100}%`} data-color={row.color}>
                <span className="funnel-pct">{((row.count/max)*100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Heatmap = () => (
  <div className="heatmap">
    <div className="heatmap-header">{['S1','S2','S3','S4','S5'].map(s => <span key={s}>{s}</span>)}</div>
    {heatmapData.map((row,di) => (
      <div key={di} className="heatmap-row">
        <div className="heatmap-day-label">{DIAS[di]}</div>
        <div className="heatmap-cells">
          {row.map((val,wi) => (
            <div key={wi} className="heatmap-cell" data-heat-color={getHeatColor(val)} title={`${DIAS[di]} S${wi+1}: ${val}%`} />
          ))}
        </div>
      </div>
    ))}
    <div className="heatmap-legend">
      <span className="heatmap-legend-label">Asistencia:</span>
      {[['#fca5a5','<40%'],['#fde68a','40-60%'],['#bae6fd','60-75%'],['#38bdf8','75-90%'],['#00a4e0','90%+']].map(([c,l]) => (
        <div key={l} className="heatmap-legend-item">
          <div className="heatmap-legend-dot" data-color={c} />
          <span className="heatmap-legend-text">{l}</span>
        </div>
      ))}
    </div>
  </div>
);

// ✅ Arreglado para prevenir el hydration error
const formatNumber = (num: number) => num.toLocaleString('en-US');

const KpiCard = ({ icon, iconClass, label, value, cambio, suffix = '' }: {
  icon: React.ReactNode; iconClass: string; label: string;
  value: number; cambio: number; suffix?: string;
}) => {
  const isUp      = cambio > 0;
  const isNeutral = cambio === 0;
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className={`kpi-icon ${iconClass}`}>{icon}</div>
        <div className={`kpi-badge ${isNeutral ? 'neutral' : isUp ? 'up' : 'down'}`}>
          {isNeutral ? <Minus /> : isUp ? <TrendingUp /> : <TrendingDown />}
          {Math.abs(cambio).toFixed(1)}%
        </div>
      </div>
      <div className="kpi-value">{suffix ? `${value}${suffix}` : formatNumber(value)}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">vs mes anterior</div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────
export default function AdminEstadisticasPage() {
  const [periodoFiltro, setPeriodoFiltro] = useState('todos');
  const [modalExport,   setModalExport]   = useState(false);
  const [exportFormat,  setExportFormat]  = useState('csv');
  const [exportScope,   setExportScope]   = useState('general');
  const [exporting,     setExporting]     = useState(false);
  const [exportDone,    setExportDone]    = useState(false);

  const TABS = [
    { value: 'todos',     label: 'Todo el tiempo' },
    { value: '2025',      label: '2025'           },
    { value: 'verano',    label: 'Verano 2025'    },
    { value: 'primavera', label: 'Primavera 2025' },
  ];

  const totalInscritos = detalleTabla.reduce((a,r) => a+r.inscritos, 0);
  const convActivas    = detalleTabla.filter(r => r.estado === 'activo').length;

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false); setExportDone(true);
      if (exportFormat === 'csv') {
        const rows = [
          ['Convocatoria','Periodo','Interesados','Notificados','Inscritos','Asistencia %','Estado'],
          ...detalleTabla.map(r => [r.convocatoria,r.periodo,r.interesados,r.notificados,r.inscritos,r.asistencia,r.estado]),
        ];
        downloadFile(rows.map(r => r.join(',')).join('\n'), `estadisticas_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
      } else if (exportFormat === 'json') {
        downloadFile(JSON.stringify({ kpis: mockKPIs, funnel: funnelData, porRol, porDivision, detalle: detalleTabla }, null, 2),
          `estadisticas_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
      } else {
        alert('Exportación PDF: integra jsPDF en producción.'); setModalExport(false); setExportDone(false); return;
      }
      setTimeout(() => { setModalExport(false); setExportDone(false); }, 1200);
    }, 1500);
  };

  return (
    <>
      <div className="app">
        <AdminSidebar onLogout={() => console.log('logout')} />

        <main className="main">
          <div className="main-inner">

            <header className="section-header">
              <div>
                <h2>Estadísticas y reportes</h2>
                <p>Visión completa del ciclo: interesados → notificados → inscritos → asistencia.</p>
              </div>
              <div className="row-actions">
                <div className="pill"><Users size={16} /> Inscritos totales: <strong>{totalInscritos.toLocaleString('en-US')}</strong></div>
                <div className="pill"><Activity size={16} /> Convocatorias activas: <strong>{convActivas}</strong></div>
                <button className="btn btn--outline" type="button"><RefreshCw size={16} /> Actualizar</button>
                <button className="btn btn--blue" type="button" onClick={() => setModalExport(true)}>
                  <Download size={16} /> Exportar reporte
                </button>
              </div>
            </header>

            <div className="tabs-bar">
              <span className="period-label">Periodo:</span>
              <div className="tab-group">
                {TABS.map(t => (
                  <button key={t.value} className={`tab ${periodoFiltro === t.value ? 'active' : ''}`}
                    type="button" onClick={() => setPeriodoFiltro(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="kpi-grid">
              <KpiCard icon={<Eye />}         iconClass="blue"   label="Interesados registrados"   value={mockKPIs.interesados.valor} cambio={mockKPIs.interesados.cambio} />
              <KpiCard icon={<Mail />}        iconClass="purple" label="Notificados por correo"    value={mockKPIs.notificados.valor} cambio={mockKPIs.notificados.cambio} />
              <KpiCard icon={<UserPlus />}      iconClass="green"  label="Inscripciones completadas" value={mockKPIs.inscritos.valor}   cambio={mockKPIs.inscritos.cambio} />
              <KpiCard icon={<CalendarCheck />} iconClass="yellow" label="Asistencia promedio"       value={mockKPIs.asistencia.valor} cambio={mockKPIs.asistencia.cambio} suffix="%" />
              <KpiCard icon={<Activity />}      iconClass="blue"   label="Anuncios publicados"       value={mockKPIs.anuncios.valor}   cambio={mockKPIs.anuncios.cambio} />
            </div>

            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon green"><Award size={20} /></div>
                <div>
                  <div className="insight-title">Alta conversión este ciclo</div>
                  <div className="insight-desc">El 69.9% de los interesados completaron su inscripción, el mejor registro histórico.</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon yellow"><AlertTriangle size={20} /></div>
                <div>
                  <div className="insight-title">Asistencia con tendencia a la baja</div>
                  <div className="insight-desc">Bajó 2.1% respecto al mes anterior. Los sábados registran la menor concurrencia.</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon blue"><Flame size={20} /></div>
                <div>
                  <div className="insight-title">DTAI lidera inscripciones</div>
                  <div className="insight-desc">La división DTAI concentra el 36.6% del total de inscripciones activas del ciclo.</div>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card wide">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Tendencia mensual</div>
                    <div className="chart-subtitle">Interesados vs inscripciones — últimos 12 meses</div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot bar-default" /> Inscritos</div>
                    <div className="legend-item"><div className="legend-dot bar-secondary" /> Interesados</div>
                  </div>
                </div>
                <Sparkline data={inscripcionesMes} secondary={interesadosMes} />
              </div>
              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Inscripciones por rol</div><div className="chart-subtitle">Distribución de {mockKPIs.inscritos.valor} inscritos</div></div></div>
                <Donut data={porRol} total={mockKPIs.inscritos.valor} />
              </div>
              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Inscripciones por división</div><div className="chart-subtitle">Distribución por unidad académica</div></div></div>
                <BarChart data={porDivision} />
              </div>
              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Embudo de conversión</div><div className="chart-subtitle">Del interés hasta la inscripción completa</div></div></div>
                <Funnel />
              </div>
              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Mapa de asistencia</div><div className="chart-subtitle">Porcentaje por día y semana del ciclo</div></div></div>
                <Heatmap />
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Top asistencia</div><div className="chart-subtitle">Usuarios con mayor porcentaje</div></div></div>
                <div className="ranking-table">
                  {topAsistencia.map((u,i) => (
                    <div key={i} className="ranking-row">
                      <div className={`ranking-pos ${i < 3 ? 'top' : ''}`}>{i < 3 ? '★' : i+1}</div>
                      <div className="ranking-avatar" data-color={avatarColors[i%avatarColors.length]}>
                        {getInitials(u.nombre)}
                      </div>
                      <div className="ranking-info">
                        <div className="ranking-name">{u.nombre}</div>
                        <div className="ranking-sub">{u.division}</div>
                      </div>
                      <div className="ranking-bar-wrap">
                        <div className="ranking-bar-track"><div className="ranking-bar-fill" data-pct={u.pct} /></div>
                      </div>
                      <div className="ranking-pct">{u.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header"><div><div className="chart-title">Actividad reciente</div><div className="chart-subtitle">Últimas acciones registradas</div></div></div>
                <div className="activity-list">
                  {actividadReciente.map((a,i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-dot-wrap">
                        <div className="activity-dot" data-color={a.color} />
                        <div className="activity-line" />
                      </div>
                      <div className="activity-content">
                        <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.texto }} />
                        <div className="activity-time">{a.tiempo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="table-area">
              <div className="table-card-header">
                <div>
                  <div className="chart-title">Detalle por convocatoria</div>
                  <div className="chart-subtitle">Comparativo de métricas por periodo académico</div>
                </div>
                <button className="btn btn--outline" type="button" onClick={() => setModalExport(true)}>
                  <Download size={16} /> Exportar tabla
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Convocatoria</th><th>Periodo</th><th>Interesados</th>
                      <th>Notificados</th><th>Inscritos</th><th>Conversión</th>
                      <th>Asistencia</th><th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleTabla.map((row,i) => {
                      const conv = ((row.inscritos/row.interesados)*100).toFixed(1);
                      return (
                        <tr key={i}>
                          <td className="table-convocatoria">{row.convocatoria}</td>
                          <td className="muted">{row.periodo}</td>
                          <td>{row.interesados.toLocaleString('en-US')}</td>
                          <td>{row.notificados.toLocaleString('en-US')}</td>
                          <td className="table-inscritos">{row.inscritos.toLocaleString('en-US')}</td>
                          <td><span className="chip chip--pendiente"><TrendingUp size={12} /> {conv}%</span></td>
                          <td>
                            <span className={`chip ${row.asistencia >= 80 ? 'chip--activo' : row.asistencia >= 70 ? 'chip--pendiente' : 'chip--baja'}`}>
                              {row.asistencia >= 80 ? <Check size={12} /> : row.asistencia >= 70 ? <Clock size={12} /> : <AlertTriangle size={12} />}
                              {row.asistencia}%
                            </span>
                          </td>
                          <td>
                            <span className={`chip ${row.estado === 'activo' ? 'chip--activo' : 'chip--inactivo'}`}>
                              {row.estado === 'activo' ? <Sparkles size={12} /> : <CheckCircle size={12} />}
                              {row.estado === 'activo' ? 'Activo' : 'Cerrado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-hint">Tip: En pantallas pequeñas, desliza horizontalmente para ver todas las columnas.</div>
            </section>

          </div>
        </main>
      </div>

      {/* Modal exportar — usa .modal-overlay + .modal-box--wide */}
      {modalExport && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalExport(false); }}>
          <div className="modal-box modal-box--wide">

            <div className="modal-header">
              <div><h3>Exportar reporte</h3><p>Elige el formato y el alcance del reporte</p></div>
              <button className="btn-close" onClick={() => setModalExport(false)} title="Cerrar"><X /></button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="input-label">Formato de exportación</label>
                <div className="export-options">
                  {[
                    { value:'csv',  cls:'csv',  icon:<FileText size={20} />, label:'CSV / Excel', desc:'Compatible con Excel y Google Sheets' },
                    { value:'json', cls:'json', icon:<Database size={20} />, label:'JSON',        desc:'Datos estructurados para integraciones' },
                    { value:'pdf',  cls:'pdf',  icon:<FileText size={20} />, label:'PDF',         desc:'Reporte visual listo para presentar' },
                  ].map(opt => (
                    <div key={opt.value} className={`export-option ${exportFormat === opt.value ? 'selected' : ''}`}
                      onClick={() => setExportFormat(opt.value)}>
                      <div className={`export-option-icon ${opt.cls}`}>{opt.icon}</div>
                      <div className="export-option-info">
                        <div className="export-option-name">{opt.label}</div>
                        <div className="export-option-desc">{opt.desc}</div>
                      </div>
                      <div className="export-check"><Check size={12} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="export-scope" className="input-label">Alcance del reporte</label>
                <select id="export-scope" className="form-select" value={exportScope} onChange={e => setExportScope(e.target.value)}>
                  <option value="general">Resumen general (KPIs + embudo)</option>
                  <option value="convocatorias">Detalle por convocatoria</option>
                  <option value="asistencia">Asistencia por usuario</option>
                  <option value="completo">Reporte completo</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn--outline" onClick={() => setModalExport(false)}>Cancelar</button>
              <button className="btn btn--blue btn--export" onClick={handleExport} disabled={exporting}>
                {exportDone ? <><Check size={16} /> ¡Descargado!</> :
                 exporting  ? <><RefreshCw size={16} className="spin-animation" /> Generando...</> :
                              <><Download size={16} /> Descargar</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}