'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User as UserIcon, Calendar, Clock, LogOut } from 'lucide-react';
import StudentShell from '../../components/StudentShell';
import AvisoPrivacidadModal from '../../components/AvisoPrivacidadModal';
import { apiFetch, clearSession } from '../../lib/api';
import { gxFontClass } from '../../styles/fonts';

type User = {
  nombre: string; apellido_paterno: string; apellido_materno: string; correo: string; activo: boolean;
  carrera?: { nombre_carrera: string }; division?: { nombre_division: string };
};
type Request = {
  estado: string; estado_efectivo: string; acceso_gym: boolean;
  periodo: { nombre_periodo: string };
  horario: { hora_inicio: string; hora_fin: string };
  diasSeleccionados: { dia: { nombre: string } }[];
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [showAviso, setShowAviso] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([apiFetch('/auth/me'), apiFetch('/alumno/postulaciones')]).then(async ([profile, applications]) => {
      if (!profile.ok || !applications.ok) throw new Error('No se pudo cargar tu perfil.');
      const profileData = await profile.json();
      setUser(profileData.usuario);
      setRequests(await applications.json());
    }).catch(e => setError(e instanceof Error ? e.message : 'Error de conexión'));
  }, []);
  const active = requests.find(item => item.acceso_gym);
  const latest = requests[0];
  const logout = () => { clearSession(); router.push('/login'); };
  return <div className={`gx-scope gx-app ${gxFontClass}`}><StudentShell/><section className="gx-app-hero"><h1>Mi <span className="gx-grad-text">perfil</span></h1><p>Tu cuenta y tu acceso al gimnasio son estados independientes.</p></section><main className="gx-app-section">{error && <div className="gx-conv-alert" role="alert">{error}</div>}{user ? <><div className="gx-profile-grid"><div className="gx-card gx-profile-card"><div className="gx-profile-card-head"><UserIcon size={18}/> Mi cuenta</div><div className="gx-profile-field"><span>Nombre</span><p>{user.nombre} {user.apellido_paterno} {user.apellido_materno}</p></div><div className="gx-profile-field"><span>Correo</span><p>{user.correo}</p></div><div className="gx-profile-field"><span>Estado de cuenta</span><p>{user.activo ? 'Habilitada' : 'Deshabilitada'}</p></div><div className="gx-profile-field"><span>Carrera y división</span><p>{user.carrera?.nombre_carrera || 'No asignada'} · {user.division?.nombre_division || 'No asignada'}</p></div></div><div className="gx-card gx-profile-card"><div className="gx-profile-card-head"><Calendar size={18}/> Postulación</div><p>{latest ? `${latest.periodo.nombre_periodo} · ${latest.estado_efectivo === 'vencida' ? 'convocatoria cerrada' : latest.estado_efectivo.replace('_', ' ')}` : 'Aún no has enviado una solicitud.'}</p><Link className="gx-btn gx-btn--outline" href="/convocatorias">Ver convocatorias</Link></div><div className="gx-card gx-profile-card"><div className="gx-profile-card-head"><Clock size={18}/> Acceso al gym</div>{active ? <><div className="gx-profile-field"><span>Periodo vigente</span><p>{active.periodo.nombre_periodo}</p></div><div className="gx-profile-field"><span>Días</span><p>{active.diasSeleccionados.map(item => item.dia.nombre).join(', ')}</p></div><div className="gx-profile-field"><span>Horario</span><p>{active.horario.hora_inicio}–{active.horario.hora_fin}</p></div><Link className="gx-btn gx-btn--outline" href="/mis-asistencias">Ver asistencias</Link></> : <p>Sin horario vigente. Puedes seguir usando el resto de la plataforma.</p>}</div></div><div className="gx-profile-actions"><button className="gx-btn gx-btn--outline" onClick={() => setShowAviso(true)}>Aviso de privacidad</button><button className="gx-btn gx-btn--outline" onClick={logout}><LogOut size={16}/> Cerrar sesión</button></div></> : !error && <p className="gx-conv-muted">Cargando perfil…</p>}</main><AvisoPrivacidadModal open={showAviso} onClose={() => setShowAviso(false)}/></div>;
}
