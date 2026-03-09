'use client';

import { useState, useEffect } from 'react';
import {
  Users, Download, RefreshCw, Search, XCircle,
  Check, X, Clock, AlertTriangle, GraduationCap, Briefcase,
  Dumbbell, Stethoscope, Shield, Flame, Sparkles,
  CalendarDays
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const generarHorarios = (inicio: number, fin: number, intervalo = 30) => {
  const h: string[] = [];
  for (let hora = inicio; hora <= fin; hora++) {
    for (let min = 0; min < 60; min += intervalo) {
      if (hora === fin && min > 0) break;
      h.push(`${hora.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`);
    }
  }
  return h;
};

const HORARIOS_INICIO = generarHorarios(6, 21);
const HORARIOS_FIN    = generarHorarios(6, 22).slice(1);
const DIAS_SEMANA     = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

const CAPACIDADES: Record<string, number> = {
  '06:00':25,'06:30':25,'07:00':28,'07:30':28,'08:00':30,'08:30':30,
  '09:00':30,'09:30':30,'10:00':30,'10:30':28,'11:00':28,'11:30':28,
  '12:00':25,'12:30':25,'13:00':25,'13:30':25,'14:00':28,'14:30':28,
  '15:00':30,'15:30':30,'16:00':32,'16:30':32,'17:00':32,'17:30':32,
  '18:00':35,'18:30':35,'19:00':35,'19:30':30,'20:00':30,'20:30':25,'21:00':25,
};

const ROL_CONFIG = {
  estudiante:             { icon: GraduationCap, nombre: 'Estudiante'     },
  docente:                { icon: Briefcase,     nombre: 'Docente'        },
  entrenador:             { icon: Dumbbell,      nombre: 'Entrenador'     },
  nutriologa:             { icon: Stethoscope,   nombre: 'Nutrióloga'     },
  administrador_general:  { icon: Shield,        nombre: 'Admin general'  },
} as const;

const DIVISIONES = [
  { value: 'dtai', label: 'DTAI' }, { value: 'dmec', label: 'DMEC' },
  { value: 'dind', label: 'DIND' }, { value: 'dea',  label: 'DEA'  }, { value: 'dae', label: 'DAE' },
];
const ROLES = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'entrenador', label: 'Entrenador' },
  { value: 'nutriologa', label: 'Nutrióloga' },
  { value: 'administrador_general', label: 'Administrador general' },
];

interface Inscripcion {
  id: number; nombre: string; apellido_paterno: string; apellido_materno: string;
  correo: string; rol: string; division: string; carrera: string;
  cuatrimestre: string; prioridad: 'alta' | 'baja'; registro: string;
}

interface ModalData { userId: number; userName: string; userEmail: string; }

export default function AdminInscripcionesPage() {

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState<Inscripcion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  const [modalActive, setModalActive] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // 🔹 Cargar inscripciones reales
  const fetchInscripciones = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/pendientes`);
      if (res.ok) {
        const data = await res.json();
        setInscripciones(data);
      } else {
        console.error('Error cargando:', res.status);
      }
    } catch (err) {
      console.error('Error conexión:', err);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  // 🔹 Filtros
  useEffect(() => {
    let f = [...inscripciones];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(i => `${i.id} ${i.nombre} ${i.apellido_paterno} ${i.apellido_materno} ${i.correo}`.toLowerCase().includes(q));
    }
    if (filterRol)       f = f.filter(i => i.rol === filterRol);
    if (filterPrioridad) f = f.filter(i => i.prioridad === filterPrioridad);
    if (filterDivision)  f = f.filter(i => i.division.toLowerCase() === filterDivision.toLowerCase());
    setFilteredInscripciones(f);
  }, [searchQuery, filterRol, filterPrioridad, filterDivision, inscripciones]);

  // 🔹 Aceptar
  const handleAccept = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/aceptar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setInscripciones(prev => prev.filter(i => i.id !== id));
      } else {
        alert('Error al aceptar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  // 🔹 Rechazar
  const handleReject = async (id: number) => {
    if (!window.confirm('¿Rechazar inscripción?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setInscripciones(prev => prev.filter(i => i.id !== id));
      } else {
        alert('Error al rechazar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const getRolInfo = (rol: string) => {
    const cfg = ROL_CONFIG[rol as keyof typeof ROL_CONFIG];
    if (cfg) { const I = cfg.icon; return { icon: <I size={14} />, nombre: cfg.nombre }; }
    return { icon: <Users size={14} />, nombre: rol };
  };

  const countPendientes = filteredInscripciones.length;
  const countAlta = filteredInscripciones.filter(i => i.prioridad === 'alta').length;

  const openModal = (userId: number, userName: string, userEmail: string) => {
    setModalData({ userId, userName, userEmail });
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
    setModalData(null);
  };

  return (
    <div className="app">
      <AdminSidebar onLogout={() => console.log('logout')} />

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Inscripciones de usuarios</h2>
              <p>Valida registros pendientes.</p>
            </div>
            <div className="row-actions">
              <div className="chip chip--pendiente"><Users size={14}/> {countPendientes}</div>
              <div className="chip chip--alta"><AlertTriangle size={14}/> {countAlta}</div>

              <button className="btn btn--blue" onClick={fetchInscripciones}>
                <RefreshCw/> Actualizar
              </button>
            </div>
          </header>

          {/* tabla */}
          <section className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Prioridad</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInscripciones.map(insc => (
                    <tr key={insc.id}>
                      <td>{insc.id}</td>
                      <td>{insc.nombre}</td>
                      <td>{insc.correo}</td>
                      <td>{getRolInfo(insc.rol).nombre}</td>
                      <td>{insc.prioridad}</td>
                      <td>
                        <button className="btn-mini btn-mini--green" onClick={() => handleAccept(insc.id)}>
                          <Check size={12}/> Aceptar
                        </button>
                        <button className="btn-mini btn-mini--red" onClick={() => handleReject(insc.id)}>
                          <X size={12}/> Rechazar
                        </button>
                        <button className="btn-mini btn-mini--yellow"
                          onClick={() => openModal(insc.id, insc.nombre, insc.correo)}>
                          <Clock size={12}/> Contrapropuesta
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}