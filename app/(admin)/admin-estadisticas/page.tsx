'use client';
import { apiFetch } from '../../lib/api';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, FileText, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AlertModal from '../../components/AlertModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DatoReporte {
  id: number;
  matricula: string;
  nombre: string;
  carrera: string;
  servicio: string;
  asistencia: string;
  estado: string;
  periodo: string; //Agregamos el periodo que ahora manda el backend
}

function getAttendanceStyle(asistencia: string) {
  const attendance = Number.parseInt(asistencia);

  if (attendance >= 80) {
    return { color: '#15803d', background: '#dcfce7' };
  }

  if (attendance > 0) {
    return { color: '#b91c1c', background: '#fee2e2' };
  }

  return { color: '#64748b', background: '#f1f5f9' };
}

function getExportButtonContent(exportDone: boolean, exporting: boolean) {
  if (exportDone) {
    return <><Check size={16} /> ¡Descargado!</>;
  }

  if (exporting) {
    return <><RefreshCw size={16} className="spin-animation" /> Generando...</>;
  }

  return <><Download size={16} /> Descargar</>;
}

export default function AdminEstadisticasPage() {
  const [periodoFiltro, setPeriodoFiltro] = useState('todos');
  const [modalExport,   setModalExport]   = useState(false);
  const [exportFormat,  setExportFormat]  = useState('csv');
  const [exportScope,   setExportScope]   = useState('general');
  const [exporting,     setExporting]     = useState(false);
  const [exportDone,    setExportDone]    = useState(false);
  const [alertOpen,     setAlertOpen]     = useState(false);
  const [alertMessage] = useState('');

  const [datosTabla, setDatosTabla] = useState<DatoReporte[]>([]);

  const cargarReporte = async () => {
    try {
      const res = await apiFetch(`${API_URL}/asistencias/reporte`);
      if (res.ok) {
        const data = await res.json();
        setDatosTabla(data);
      }
    } catch (error) {
      console.error("Error cargando reporte:", error);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const TABS = [
    { value: 'todos',     label: 'Todo el tiempo' },
    { value: '2025',      label: '2025'           },
    { value: 'verano',    label: 'Verano 2025'    },
    { value: 'primavera', label: 'Primavera 2025' },
  ];

  //Lógica de Filtrado Dinámico
  const datosFiltrados = periodoFiltro === 'todos' 
    ? datosTabla 
    : datosTabla.filter(d => d.periodo.toLowerCase().includes(periodoFiltro.toLowerCase()));

  const totalInscritos = datosFiltrados.length;
  const convActivas    = 1; 

  const handleExport = () => {
    setExporting(true);
    
    // Elegimos qué datos exportar según lo que pidió el usuario
    const datosExportar = exportScope === 'completo' ? datosTabla : datosFiltrados;

    setTimeout(() => {
      setExporting(false); setExportDone(true);
      
      if (exportFormat === 'csv') {
        const rows = [
          ['Matrícula','Nombre','Carrera','Servicio','Periodo','Asistencia %','Estado'],
          ...datosExportar.map(r => [r.matricula, r.nombre, r.carrera, r.servicio, r.periodo, r.asistencia, r.estado]),
        ];
        
        //Le agregamos '\uFEFF' al inicio para que reconozca acentos y la Ñ
        const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `reporte_asistencia_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        
      } else if (exportFormat === 'pdf') {
        // MAGIA DEL PDF
        const doc = new jsPDF();
        doc.text("Reporte de Asistencias - SchedMaster", 14, 15);
        
        autoTable(doc, {
          startY: 20,
          head: [['Matrícula', 'Nombre', 'Carrera', 'Servicio', 'Asistencia', 'Estado']],
          body: datosExportar.map(r => [r.matricula, r.nombre, r.carrera, r.servicio, r.asistencia, r.estado]),
          headStyles: { fillColor: [0, 164, 224] },
        });
        
        doc.save(`reporte_asistencia_${new Date().toISOString().slice(0,10)}.pdf`);
      }

      setTimeout(() => { setModalExport(false); setExportDone(false); }, 1200);
    }, 1000);
  };

  return (
    <>
      <div className="app app--admin-stats">
        <AdminSidebar />

        <main className="main">
          <div className="main-inner">

            <header className="section-header reports-header">
              <div>
                <h2>Reportes</h2>
                <p>Visión completa del ciclo: interesados, notificados, inscritos, asistencia.</p>
              </div>

              <div className="stats-header-actions">
                
                <div className="stats-summary">
                  <div className="chip chip--blue" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    Inscritos totales: <strong>{totalInscritos}</strong>
                  </div>
                  <div className="chip chip--outline" style={{ border: '1px solid #ddd' }}>
                    Convocatorias activas: <strong>{convActivas}</strong>
                  </div>
                </div>

                <div className="stats-buttons">
                  <button className="btn btn--outline" type="button" onClick={cargarReporte}>
                    <RefreshCw size={18} /> Actualizar
                  </button>
                  <button className="btn btn--blue" type="button" onClick={() => setModalExport(true)}>
                    <Download size={18} /> Exportar reporte
                  </button>
                </div>
              </div>

              <div className="tabs-bar">
                <span className="period-label">Periodo:</span>
                <div className="tab-group">
                  {TABS.map(t => (
                    <button 
                      key={t.value} 
                      className={`tab ${periodoFiltro === t.value ? 'active' : ''}`}
                      type="button" 
                      onClick={() => setPeriodoFiltro(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <section className="table-area">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Nombre del alumno</th>
                      <th>Carrera</th>
                      <th>Servicio</th>
                      <th>Asistencia Prom.</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center' }}>
                           <div className="empty-state" style={{ padding: '40px', border: 'none', boxShadow: 'none' }}>
                             <p>Cargando reportes o no hay datos para el periodo seleccionado...</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      datosFiltrados.map((fila) => (
                        <tr key={fila.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                          <td style={{ color: '#475569', fontWeight: '500' }}>{fila.matricula}</td>
                          <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{fila.nombre}</td>
                          <td style={{ color: '#64748b' }}>{fila.carrera}</td>
                          <td style={{ color: '#64748b' }}>{fila.servicio}</td>
                          <td>
                            <span style={{ 
                              ...getAttendanceStyle(fila.asistencia),
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {fila.asistencia}
                            </span>
                          </td>
                          <td>
                            <span className={`chip ${fila.estado.toLowerCase() === 'activo' ? 'chip--activo' : 'chip--inactivo'}`}>
                              {fila.estado.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-hint" style={{ textAlign: 'right' }}>
                Mostrando {datosFiltrados.length} registros
              </div>
            </section>

          </div>
        </main>
      </div>

      {modalExport && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-header">
              <div><h3>Exportar reporte</h3><p>Elige el formato y el alcance del reporte</p></div>
              <button type="button" className="btn-close" onClick={() => setModalExport(false)} title="Cerrar"><X /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <span className="input-label">Formato de exportación</span>
                <div className="export-options">
                  {/*LE DIMOS CUELLO AL JSON COMO PIDIÓ ARLET */}
                  {[
                    { value:'csv',  cls:'csv',  icon:<FileText size={20} />, label:'Excel (CSV)', desc:'Compatible con Excel y hojas de cálculo' },
                    { value:'pdf',  cls:'pdf',  icon:<FileText size={20} />, label:'PDF',         desc:'Reporte visual listo para presentar' },
                  ].map(opt => (
                    <button key={opt.value} type="button" className={`export-option ${exportFormat === opt.value ? 'selected' : ''}`} onClick={() => setExportFormat(opt.value)}>
                      <div className={`export-option-icon ${opt.cls}`}>{opt.icon}</div>
                      <div className="export-option-info">
                        <div className="export-option-name">{opt.label}</div>
                        <div className="export-option-desc">{opt.desc}</div>
                      </div>
                      <div className="export-check"><Check size={12} /></div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="export-scope" className="input-label">Alcance del reporte</label>
                <select id="export-scope" className="form-select" value={exportScope} onChange={e => setExportScope(e.target.value)}>
                  <option value="general">Tabla actual (usando el filtro de periodo)</option>
                  <option value="completo">Base de datos completa (Todo el tiempo)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn--outline" onClick={() => setModalExport(false)}>Cancelar</button>
              <button type="button" className="btn btn--blue btn--export" onClick={handleExport} disabled={exporting}>
                {getExportButtonContent(exportDone, exporting)}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
}
