'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Plus,
  Dumbbell,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  Download,
  ClipboardList,
  Repeat2,
} from 'lucide-react';
import StudentShell from '../../components/StudentShell';
import Reveal from '../../components/Reveal';
import Toast, { type ToastState } from '../../components/Toast';
import RoutineDetailModal, { type RoutineDetail } from '../../components/RoutineDetailModal';
import RoutineFormModal, { emptyRoutineDraft, type RoutineDraft } from '../../components/RoutineFormModal';
import { gxFontClass } from '../../styles/fonts';
import { apiFetch } from '../../lib/api';

function routineToDraft(routine: RoutineDetail): RoutineDraft {
  return {
    nombre: routine.nombre,
    descripcion: routine.descripcion ?? '',
    ejercicios: routine.ejercicios.map((ej) => ({
      key: Math.random().toString(36).slice(2),
      nombre_ejercicio: ej.nombre_ejercicio,
      series: ej.series != null ? String(ej.series) : '',
      repeticiones: ej.repeticiones ?? '',
      descanso_segundos: ej.descanso_segundos != null ? String(ej.descanso_segundos) : '',
      notas: ej.notas ?? '',
    })),
  };
}

function draftToPayload(draft: RoutineDraft) {
  return {
    nombre: draft.nombre.trim(),
    descripcion: draft.descripcion.trim() || null,
    ejercicios: draft.ejercicios
      .filter((ej) => ej.nombre_ejercicio.trim())
      .map((ej) => ({
        nombre_ejercicio: ej.nombre_ejercicio.trim(),
        series: ej.series ? Number(ej.series) : null,
        repeticiones: ej.repeticiones.trim() || null,
        descanso_segundos: ej.descanso_segundos ? Number(ej.descanso_segundos) : null,
        notas: ej.notas.trim() || null,
      })),
  };
}

function exportRoutinesToPdf(routines: RoutineDetail[], subtitle: string) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  doc.setFontSize(16);
  doc.text('SchedMaster — Mis rutinas', 14, y);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle, 14, y + 6);
  doc.setTextColor(20);
  y += 16;

  routines.forEach((routine) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.text(routine.nombre, 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(120);
    const fecha = new Date(routine.fecha_creacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Creada el ${fecha}${routine.descripcion ? ' — ' + routine.descripcion : ''}`, 14, y);
    doc.setTextColor(20);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['#', 'Ejercicio', 'Series', 'Reps', 'Descanso', 'Notas']],
      body: routine.ejercicios.map((ej, i) => [
        String(i + 1),
        ej.nombre_ejercicio,
        ej.series != null ? String(ej.series) : '—',
        ej.repeticiones || '—',
        ej.descanso_segundos != null ? `${ej.descanso_segundos}s` : '—',
        ej.notas || '',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 164, 224] },
    });

    // @ts-expect-error -- jspdf-autotable attaches lastAutoTable to the doc instance at runtime
    y = (doc.lastAutoTable?.finalY ?? y) + 14;
  });

  doc.save('mis-rutinas-schedmaster.pdf');
}

export default function MisRutinasPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const [rutinas, setRutinas] = useState<RoutineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ open: false, variant: 'success', message: '' });

  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RoutineDraft>(emptyRoutineDraft());
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.id_usuario) throw new Error('sin id');
      setUserId(parsed.id_usuario);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const cargarRutinas = useCallback((uid: number) => {
    setLoading(true);
    apiFetch(`/rutinas/usuario/${uid}`)
      .then((res) => res.json())
      .then((data) => setRutinas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error cargando tus rutinas:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userId) cargarRutinas(userId);
  }, [userId, cargarRutinas]);

  const selected = rutinas.find((r) => r.id_rutina === detailId) ?? null;

  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setDraft(emptyRoutineDraft());
    setFormOpen(true);
  };

  const openEdit = (routine: RoutineDetail) => {
    setFormMode('edit');
    setEditingId(routine.id_rutina);
    setDraft(routineToDraft(routine));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!userId || submitting) return;
    setSubmitting(true);

    const payload = draftToPayload(draft);

    try {
      const res = formMode === 'create'
        ? await apiFetch('/rutinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: userId, ...payload }),
          })
        : await apiFetch(`/rutinas/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ open: true, variant: 'error', message: data.message || 'No se pudo guardar la rutina.' });
        return;
      }

      setFormOpen(false);
      cargarRutinas(userId);
      setToast({
        open: true,
        variant: 'success',
        message: formMode === 'create' ? 'Rutina creada correctamente.' : 'Cambios guardados correctamente.',
      });
    } catch {
      setToast({ open: true, variant: 'error', message: 'Error de conexión con el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !userId || deleting) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/rutinas/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        setToast({ open: true, variant: 'error', message: 'No se pudo eliminar la rutina.' });
        return;
      }
      setDeleteId(null);
      cargarRutinas(userId);
      setToast({ open: true, variant: 'success', message: 'Rutina eliminada.' });
    } catch {
      setToast({ open: true, variant: 'error', message: 'Error de conexión con el servidor.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadAll = () => {
    if (rutinas.length === 0) return;
    exportRoutinesToPdf(rutinas, `${rutinas.length} rutina${rutinas.length === 1 ? '' : 's'} · generado el ${new Date().toLocaleDateString('es-MX')}`);
  };

  return (
    <div className={`gx-scope gx-app ${gxFontClass}`}>
      <StudentShell />

      <section className="gx-app-hero">
        <h1>Mis <span className="gx-grad-text">rutinas</span></h1>
        <p>Crea, edita y organiza tus rutinas de entrenamiento.</p>
        <div className="gx-app-hero-actions">
          <button type="button" className="gx-btn gx-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nueva rutina
          </button>
          <button type="button" className="gx-btn gx-btn--outline" onClick={handleDownloadAll} disabled={rutinas.length === 0}>
            <Download size={16} /> Descargar PDF
          </button>
        </div>
      </section>

      <section className="gx-app-section">
        <div className="gx-routine-grid">
          {loading && (
            <div className="gx-empty-state">
              <span className="gx-empty-state-icon"><Dumbbell size={24} /></span>
              <h3>Cargando tus rutinas...</h3>
            </div>
          )}

          {!loading && rutinas.length === 0 && (
            <div className="gx-empty-state">
              <span className="gx-empty-state-icon"><ClipboardList size={24} /></span>
              <h3>Aún no tienes rutinas</h3>
              <p>Crea tu primera rutina o toma una de la comunidad para empezar a entrenar.</p>
            </div>
          )}

          {!loading && rutinas.map((r, i) => (
            <Reveal as="div" key={r.id_rutina} delay={(i % 6) * 50} className="gx-card gx-card--hover gx-routine-card">
              <div className="gx-routine-card-head">
                <span className="gx-service-icon"><Dumbbell size={18} /></span>
                <h3>{r.nombre}</h3>
              </div>

              {r.origen?.usuario && (
                <span className="gx-routine-badge"><Repeat2 size={12} /> Tomada de {r.origen.usuario.nombre}</span>
              )}

              {r.descripcion && <p className="gx-routine-card-desc">{r.descripcion}</p>}

              <div className="gx-routine-card-meta">
                <span><Calendar size={12} /> {new Date(r.fecha_creacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                <span><Dumbbell size={12} /> {r.ejercicios.length} ejercicios</span>
              </div>

              <div className="gx-routine-card-footer">
                <div className="gx-routine-card-actions">
                  <button type="button" className="gx-btn gx-btn--icon gx-btn--outline gx-btn--sm" onClick={() => setDetailId(r.id_rutina)} aria-label="Ver rutina" title="Ver">
                    <Eye size={15} />
                  </button>
                  <button type="button" className="gx-btn gx-btn--icon gx-btn--outline gx-btn--sm" onClick={() => openEdit(r)} aria-label="Editar rutina" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="gx-btn gx-btn--icon gx-btn--outline gx-btn--sm gx-btn--danger" onClick={() => setDeleteId(r.id_rutina)} aria-label="Eliminar rutina" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <RoutineDetailModal
        routine={selected}
        onClose={() => setDetailId(null)}
        onDownload={(routine) => exportRoutinesToPdf([routine], `generado el ${new Date().toLocaleDateString('es-MX')}`)}
      />

      <RoutineFormModal
        open={formOpen}
        mode={formMode}
        draft={draft}
        onChange={setDraft}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {deleteId != null && (
        <div className="gx-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="gx-card gx-routine-detail" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Eliminar rutina</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--gx-text-dim)' }}>
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta rutina?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="gx-btn gx-btn--outline gx-btn--full" onClick={() => setDeleteId(null)}>
                Cancelar
              </button>
              <button type="button" className="gx-btn gx-btn--primary gx-btn--full" onClick={handleDelete} disabled={deleting} style={{ background: '#ef4444' }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
