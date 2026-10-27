'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, XCircle, Bell, ArrowRight } from 'lucide-react';
import StudentShell from '../../components/StudentShell';
import { apiFetch } from '../../lib/api';
import { gxFontClass } from '../../styles/fonts';

type Dia = { id_dia: number; nombre: string };
type Horario = { id_horario: number; hora_inicio: string; hora_fin: string; dias: Dia[] };
type Periodo = {
  id_periodo: number; nombre_periodo: string; fecha_inicio_inscripcion: string;
  fecha_fin_inscripcion: string; fecha_inicio_actividades: string; fecha_fin_periodo: string;
  horarios: Horario[];
};
type Postulacion = {
  id_inscripcion: number; id_periodo: number; estado: string; estado_efectivo: string; acceso_gym: boolean;
  periodo: Periodo; horario: Horario; diasSeleccionados: { dia: Dia }[];
  propuestas: { id_propuesta: number; estado: string; horario: Horario; dias: { dia: Dia }[] }[];
};
type Notificacion = {
  id_notificacion: number; titulo: string; mensaje: string; fecha_creacion: string; fecha_lectura: string | null;
};

const dateText = (value: string) => new Intl.DateTimeFormat('es-MX', {
  timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric'
}).format(new Date(value));

function statusText(estado: string) {
  return ({ pendiente: 'En revisión', propuesta_enviada: 'Contrapropuesta', aprobado: 'Aceptada', rechazado: 'Rechazada', vencida: 'Convocatoria cerrada' } as Record<string, string>)[estado] || estado;
}

export default function ConvocatoriasPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, { horario: number; dias: number[] }>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const responses = await Promise.all([
        apiFetch('/alumno/convocatorias'), apiFetch('/alumno/postulaciones'), apiFetch('/alumno/notificaciones')
      ]);
      if (responses.some(response => !response.ok)) throw new Error('No se pudo cargar la información del gimnasio.');
      const [open, requests, notices] = await Promise.all(responses.map(response => response.json()));
      setPeriodos(open); setPostulaciones(requests); setNotificaciones(notices); setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const changeHorario = (periodo: Periodo, horarioId: number) => {
    setSeleccion(previous => ({ ...previous, [periodo.id_periodo]: { horario: horarioId, dias: [] } }));
  };
  const toggleDia = (periodoId: number, idDia: number) => {
    setSeleccion(previous => {
      const current = previous[periodoId] || { horario: 0, dias: [] };
      const dias = current.dias.includes(idDia) ? current.dias.filter(id => id !== idDia) : [...current.dias, idDia];
      return { ...previous, [periodoId]: { ...current, dias } };
    });
  };

  const postular = async (periodoId: number) => {
    const choice = seleccion[periodoId];
    if (!choice?.horario || !choice.dias.length) return setError('Selecciona un horario y al menos un día.');
    setBusy(true); setError('');
    try {
      const response = await apiFetch('/alumno/postulaciones', {
        method: 'POST', body: JSON.stringify({ id_periodo: periodoId, id_horario: choice.horario, dias: choice.dias })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar la solicitud.');
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error de conexión'); }
    finally { setBusy(false); }
  };

  const responder = async (proposalId: number, accept: boolean) => {
    setBusy(true); setError('');
    try {
      const response = await apiFetch(`/propuestas/${accept ? 'aceptar' : 'rechazar'}`, {
        method: 'POST', body: JSON.stringify({ id_propuesta: proposalId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo responder la propuesta.');
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error de conexión'); }
    finally { setBusy(false); }
  };

  const markRead = async (id: number) => {
    const response = await apiFetch(`/alumno/notificaciones/${id}/leer`, { method: 'PUT' });
    if (response.ok) setNotificaciones(items => items.map(item => item.id_notificacion === id ? { ...item, fecha_lectura: new Date().toISOString() } : item));
  };

  const activeGym = postulaciones.find(item => item.acceso_gym);
  const closedApplications = postulaciones.filter((item, index, all) =>
    !periodos.some(periodo => periodo.id_periodo === item.id_periodo) &&
    all.findIndex(other => other.id_periodo === item.id_periodo) === index
  );
  return (
    <div className={`gx-scope gx-app ${gxFontClass}`}>
      <StudentShell />
      <main className="gx-app-section gx-conv-page">
        <div className="gx-conv-heading">
          <span className="gx-eyebrow"><CalendarDays size={14} /> Gimnasio</span>
          <h1>Mis convocatorias</h1>
          <p>Consulta los periodos abiertos y solicita los días y el horario que prefieres.</p>
        </div>
        {error && <div className="gx-conv-alert" role="alert">{error}</div>}
        {activeGym && <div className="gx-conv-access"><CheckCircle2 size={20} /><span>Tu acceso al gym está vigente en <strong>{activeGym.periodo.nombre_periodo}</strong>.</span><Link href="/mis-asistencias">Ver asistencias <ArrowRight size={15} /></Link></div>}
        {loading ? <p className="gx-conv-muted">Cargando convocatorias…</p> : (
          <>
            {periodos.length === 0 && <section className="gx-card gx-conv-empty"><CalendarDays size={28}/><h2>Sin convocatoria abierta</h2><p>Tu cuenta sigue disponible. Puedes consultar anuncios, usar el chatbot y crear rutinas mientras se publica la siguiente.</p></section>}
            <div className="gx-conv-list">
              {periodos.map(periodo => {
                const attempts = postulaciones.filter(item => item.id_periodo === periodo.id_periodo);
                const latest = attempts[0];
                const choice = seleccion[periodo.id_periodo];
                const horario = periodo.horarios.find(item => item.id_horario === choice?.horario);
                const canApply = !latest || (latest.estado === 'rechazado' && attempts.length < 2);
                const proposal = latest?.propuestas.find(item => item.estado === 'pendiente');
                return <section className="gx-card gx-conv-card" key={periodo.id_periodo}>
                  <div className="gx-conv-card-head"><div><span className="gx-eyebrow">Postulación abierta</span><h2>{periodo.nombre_periodo}</h2></div>{latest && <span className={`gx-conv-status gx-conv-status--${latest.estado}`}>{statusText(latest.estado)}</span>}</div>
                  <div className="gx-conv-dates"><span>Solicitudes: {dateText(periodo.fecha_inicio_inscripcion)} – {dateText(periodo.fecha_fin_inscripcion)}</span><span>Gym: {dateText(periodo.fecha_inicio_actividades)} – {dateText(periodo.fecha_fin_periodo)}</span></div>
                  {latest && <div className="gx-conv-request"><strong>Tu solicitud:</strong> {latest.horario.hora_inicio}–{latest.horario.hora_fin} · {latest.diasSeleccionados.map(item => item.dia.nombre).join(', ')}</div>}
                  {proposal && <div className="gx-conv-proposal"><h3>Horario alternativo</h3><p>{proposal.horario.hora_inicio}–{proposal.horario.hora_fin} · {proposal.dias.map(item => item.dia.nombre).join(', ')}</p><div className="gx-conv-actions"><button disabled={busy} className="gx-btn gx-btn--primary" onClick={() => responder(proposal.id_propuesta, true)}>Aceptar</button><button disabled={busy} className="gx-btn gx-btn--outline" onClick={() => responder(proposal.id_propuesta, false)}>Rechazar</button></div></div>}
                  {canApply && <div className="gx-conv-form"><h3>{attempts.length ? 'Segunda oportunidad' : 'Elige tu horario'}</h3>{periodo.horarios.length ? <><label htmlFor={`horario-${periodo.id_periodo}`}>Horario</label><select id={`horario-${periodo.id_periodo}`} className="gx-select" value={choice?.horario || ''} onChange={event => changeHorario(periodo, Number(event.target.value))}><option value="">Selecciona un horario</option>{periodo.horarios.map(item => <option key={item.id_horario} value={item.id_horario}>{item.hora_inicio}–{item.hora_fin}</option>)}</select>{horario && <><span className="gx-conv-label">Días de asistencia</span><div className="gx-conv-days">{horario.dias.map(dia => <button type="button" key={dia.id_dia} aria-pressed={choice?.dias.includes(dia.id_dia) || false} className={`gx-day-pill ${choice?.dias.includes(dia.id_dia) ? 'is-active' : ''}`} onClick={() => toggleDia(periodo.id_periodo, dia.id_dia)}>{dia.nombre}</button>)}</div></>}<button disabled={busy || !choice?.horario || !choice.dias.length} className="gx-btn gx-btn--primary gx-conv-submit" onClick={() => postular(periodo.id_periodo)}>{busy ? 'Enviando…' : 'Enviar solicitud'}</button></> : <p className="gx-conv-muted">Aún no hay horarios disponibles para este periodo.</p>}</div>}
                  {latest?.estado === 'rechazado' && attempts.length >= 2 && <p className="gx-conv-muted"><XCircle size={16}/> Ya utilizaste las dos solicitudes permitidas para esta convocatoria.</p>}
                  {latest?.estado === 'pendiente' && <p className="gx-conv-muted"><Clock3 size={16}/> El administrador está revisando tu solicitud.</p>}
                </section>;
              })}
            </div>
            {closedApplications.length > 0 && <div className="gx-conv-list">
              <h2>Mis solicitudes anteriores</h2>
              {closedApplications.map(item => {
                const proposal = item.estado_efectivo !== 'vencida' && item.propuestas.find(value => value.estado === 'pendiente');
                return <section className="gx-card gx-conv-card" key={item.id_periodo}>
                  <div className="gx-conv-card-head"><h3>{item.periodo.nombre_periodo}</h3><span className={`gx-conv-status gx-conv-status--${item.estado_efectivo}`}>{statusText(item.estado_efectivo)}</span></div>
                  <p className="gx-conv-request">{item.horario.hora_inicio}–{item.horario.hora_fin} · {item.diasSeleccionados.map(value => value.dia.nombre).join(', ')}</p>
                  {proposal && <div className="gx-conv-proposal"><h3>Horario alternativo</h3><p>{proposal.horario.hora_inicio}–{proposal.horario.hora_fin} · {proposal.dias.map(value => value.dia.nombre).join(', ')}</p><div className="gx-conv-actions"><button disabled={busy} className="gx-btn gx-btn--primary" onClick={() => responder(proposal.id_propuesta, true)}>Aceptar</button><button disabled={busy} className="gx-btn gx-btn--outline" onClick={() => responder(proposal.id_propuesta, false)}>Rechazar</button></div></div>}
                </section>;
              })}
            </div>}
          </>
        )}
        <section className="gx-conv-notices"><h2><Bell size={20}/> Notificaciones</h2>{notificaciones.length ? notificaciones.map(item => <div className={`gx-card gx-conv-notice ${item.fecha_lectura ? '' : 'is-unread'}`} key={item.id_notificacion}><div><strong>{item.titulo}</strong><p>{item.mensaje}</p><small>{dateText(item.fecha_creacion)}</small></div>{!item.fecha_lectura && <button className="gx-btn gx-btn--outline gx-btn--sm" onClick={() => markRead(item.id_notificacion)}>Marcar leída</button>}</div>) : <p className="gx-conv-muted">Aún no tienes notificaciones.</p>}</section>
      </main>
    </div>
  );
}
