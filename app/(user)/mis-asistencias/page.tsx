'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck2, LockKeyhole } from 'lucide-react';
import StudentShell from '../../components/StudentShell';
import { apiFetch } from '../../lib/api';
import { gxFontClass } from '../../styles/fonts';

type Data = {
  periodo: { nombre_periodo: string; fecha_fin_periodo: string };
  horario: { hora_inicio: string; hora_fin: string };
  dias: { nombre: string }[];
  sesiones: { fecha: string; estado: string }[];
};

export default function MisAsistenciasPage() {
  const [data, setData] = useState<Data | null>(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch('/alumno/asistencias').then(async response => {
      if (response.status === 403) { setLocked(true); return; }
      if (!response.ok) { setError('No se pudieron cargar tus asistencias.'); return; }
      setData(await response.json());
    }).catch(() => setError('No hay conexión con el servidor.'));
  }, []);
  const present = data?.sesiones.filter(item => item.estado === 'presente').length || 0;
  return <div className={`gx-scope gx-app ${gxFontClass}`}><StudentShell/><main className="gx-app-section gx-conv-page"><div className="gx-conv-heading"><span className="gx-eyebrow"><CalendarCheck2 size={14}/> Seguimiento</span><h1>Mis asistencias</h1></div>{locked ? <section className="gx-card gx-conv-empty"><LockKeyhole size={28}/><h2>Sin acceso vigente al gym</h2><p>Este panel estará disponible cuando se confirme tu horario y comience el periodo de actividades.</p><Link className="gx-btn gx-btn--primary" href="/convocatorias">Ver convocatorias</Link></section> : error ? <div className="gx-conv-alert" role="alert">{error}</div> : data ? <><section className="gx-card gx-attendance-overview"><div><span>Periodo actual</span><h2>{data.periodo.nombre_periodo}</h2><p>{data.dias.map(item => item.nombre).join(', ')} · {data.horario.hora_inicio}–{data.horario.hora_fin}</p></div><div className="gx-attendance-count"><strong>{present}/{data.sesiones.length}</strong><span>asistencias presentes de las sesiones programadas</span></div></section><section className="gx-attendance-list"><h2>Sesiones programadas hasta hoy</h2>{data.sesiones.length ? data.sesiones.map(item => <div className="gx-card gx-attendance-row" key={item.fecha}><time dateTime={item.fecha}>{new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', dateStyle: 'long' }).format(new Date(`${item.fecha}T12:00:00Z`))}</time><span className={`gx-attendance-state gx-attendance-state--${item.estado}`}>{({ presente: 'Presente', ausente: 'Ausente', sin_registro: 'Sin registro' } as Record<string, string>)[item.estado]}</span></div>) : <p className="gx-conv-muted">Tus sesiones comenzarán pronto.</p>}</section></> : <p className="gx-conv-muted">Cargando asistencias…</p>}</main></div>;
}
