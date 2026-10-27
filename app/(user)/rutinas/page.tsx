'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, User as UserIcon, Calendar, Dumbbell, Repeat2, Eye } from 'lucide-react';
import StudentShell from '../../components/StudentShell';
import Reveal from '../../components/Reveal';
import Toast, { type ToastState } from '../../components/Toast';
import RoutineDetailModal, { type RoutineDetail } from '../../components/RoutineDetailModal';
import { gxFontClass } from '../../styles/fonts';
import { apiFetch } from '../../lib/api';

interface RoutineListItem {
  id_rutina: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
  usuario: { id_usuario: number; nombre: string; apellido_paterno: string; apellido_materno: string };
  _count: { ejercicios: number; copias: number };
}

export default function RutinasPage() {
  const router = useRouter();

  const [rutinas, setRutinas] = useState<RoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<RoutineDetail | null>(null);
  const [taking, setTaking] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, variant: 'success', message: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUserId(parsed?.id_usuario ?? null);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const cargarRutinas = useCallback(() => {
    setLoading(true);
    apiFetch('/rutinas')
      .then((res) => res.json())
      .then((data) => setRutinas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error cargando rutinas:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargarRutinas(); }, [cargarRutinas]);

  useEffect(() => {
    if (selectedId == null) {
      setSelected(null);
      return;
    }
    apiFetch(`/rutinas/${selectedId}`)
      .then((res) => res.json())
      .then((data) => setSelected(data))
      .catch((err) => console.error('Error cargando la rutina:', err));
  }, [selectedId]);

  const handleTomar = async (routine: RoutineDetail) => {
    if (!userId || taking) return;
    setTaking(true);
    try {
      const res = await apiFetch(`/rutinas/${routine.id_rutina}/tomar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ open: true, variant: 'error', message: data.message || 'No se pudo guardar la rutina.' });
        return;
      }

      setSelectedId(null);
      setToast({
        open: true,
        variant: 'success',
        message: 'La rutina se guardó correctamente.',
        actionLabel: 'Ver en Mis rutinas',
        onAction: () => router.push('/mis-rutinas'),
      });
    } catch {
      setToast({ open: true, variant: 'error', message: 'Error de conexión con el servidor.' });
    } finally {
      setTaking(false);
    }
  };

  return (
    <div className={`gx-scope gx-app ${gxFontClass}`}>
      <StudentShell />

      <section className="gx-app-hero">
        <h1>Rutinas de la <span className="gx-grad-text">comunidad</span></h1>
        <p>Explora las rutinas que han creado otros alumnos y tómalas como base para tu entrenamiento.</p>
      </section>

      <section className="gx-app-section">
        <div className="gx-routine-grid">
          {loading && (
            <div className="gx-empty-state">
              <span className="gx-empty-state-icon"><Dumbbell size={24} /></span>
              <h3>Cargando rutinas...</h3>
            </div>
          )}

          {!loading && rutinas.length === 0 && (
            <div className="gx-empty-state">
              <span className="gx-empty-state-icon"><Sparkles size={24} /></span>
              <h3>Aún no hay rutinas compartidas</h3>
              <p>Sé el primero en crear una rutina desde &ldquo;Mis rutinas&rdquo; para que otros alumnos puedan tomarla.</p>
            </div>
          )}

          {!loading && rutinas.map((r, i) => (
            <Reveal as="div" key={r.id_rutina} delay={(i % 6) * 50} className="gx-card gx-card--hover gx-routine-card">
              <div className="gx-routine-card-head">
                <span className="gx-service-icon"><Dumbbell size={18} /></span>
                <h3>{r.nombre}</h3>
              </div>

              {r.descripcion && <p className="gx-routine-card-desc">{r.descripcion}</p>}

              <div className="gx-routine-card-meta">
                <span><UserIcon size={12} /> {r.usuario.nombre} {r.usuario.apellido_paterno}</span>
                <span><Calendar size={12} /> {new Date(r.fecha_creacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
              </div>

              <div className="gx-routine-card-footer">
                <span className="gx-chip"><Dumbbell size={11} /> {r._count.ejercicios} ejercicios</span>
                {r._count.copias > 0 && (
                  <span className="gx-chip"><Repeat2 size={11} /> tomada {r._count.copias}x</span>
                )}
                <button type="button" className="gx-btn gx-btn--outline gx-btn--sm" onClick={() => setSelectedId(r.id_rutina)}>
                  <Eye size={14} /> Ver
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <RoutineDetailModal
        routine={selected}
        onClose={() => setSelectedId(null)}
        onTake={handleTomar}
        taking={taking}
        showTakeAction
      />

      <Toast toast={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
