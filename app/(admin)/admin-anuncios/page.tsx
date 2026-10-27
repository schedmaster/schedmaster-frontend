'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Megaphone } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';
import { apiFetch } from '../../lib/api';

interface Anuncio {
  id: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fotografia?: string | null;
  fecha_publicacion: string;
  activo: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

const getAnnouncementImageUrl = (fotografia?: string | null) => {
  if (!fotografia) return null;
  if (/^https?:\/\//i.test(fotografia) || fotografia.startsWith('/')) return fotografia;
  return `${BASE_URL}/imagenes/${fotografia}`;
};

const isAnuncioArray = (value: unknown): value is Anuncio[] => Array.isArray(value);

const getApiErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return null;

  const response = payload as { message?: unknown; details?: unknown };

  if (typeof response.details === 'string') return response.details;
  if (typeof response.message === 'string') return response.message;
  return null;
};

export default function AdminAnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Anuncio | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── CONFIRM MODAL ──────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [pendingDeleteTitulo, setPendingDeleteTitulo] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Alta',
    fotografia: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const normalizeAnuncios = (payload: unknown): Anuncio[] => {
    if (isAnuncioArray(payload)) return payload;

    if (payload && typeof payload === 'object') {
      const shapedPayload = payload as { data?: unknown; anuncios?: unknown };

      if (isAnuncioArray(shapedPayload.data)) return shapedPayload.data;
      if (isAnuncioArray(shapedPayload.anuncios)) return shapedPayload.anuncios;
    }

    return [];
  };

  useEffect(() => {
    apiFetch('/anuncios')
      .then(res => res.json())
      .then(data => setAnuncios(normalizeAnuncios(data)))
      .catch(err => console.error(err));
  }, []);

  const anunciosFiltrados = anuncios.filter(a =>
    a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ titulo: '', descripcion: '', prioridad: 'Alta', fotografia: null });
    setPreview(null);
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (a: Anuncio) => {
    setEditing(a);
    setForm({ titulo: a.titulo || '', descripcion: a.descripcion || '', prioridad: a.prioridad || 'Alta', fotografia: null });
    setPreview(getAnnouncementImageUrl(a.fotografia));
    setSaveError('');
    setModalOpen(true);
  };

  // ── Abre el modal de confirmación antes de eliminar ────────
  const handleDeleteClick = (a: Anuncio) => {
    setPendingDeleteId(a.id);
    setPendingDeleteTitulo(a.titulo);
    setConfirmOpen(true);
  };

  // ── Ejecuta el delete solo si el usuario confirmó ──────────
  const confirmarDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await apiFetch(`/anuncios/${pendingDeleteId}`, { method: 'DELETE' });
      setAnuncios(prev => prev.filter(a => a.id !== pendingDeleteId));
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setPendingDeleteTitulo('');
    }
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setSaveError('');

      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('prioridad', form.prioridad);
      if (form.fotografia) formData.append('imagen', form.fotografia);

      const url = editing ? `${API_URL}/anuncios/${editing.id}` : `${API_URL}/anuncios`;
      const method = editing ? 'PUT' : 'POST';

      const res = await apiFetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data) || 'No se pudo guardar el anuncio');
      }

      if (editing) {
        setAnuncios(prev => prev.map(a => (a.id === editing.id ? data : a)));
      } else {
        setAnuncios(prev => [...prev, data]);
      }

      setModalOpen(false);
      setEditing(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el anuncio');
    } finally {
      setSaving(false);
    }
  };

  const prioridadChip = (p: string) => {
    if (p === 'Alta') return 'chip chip--alta';
    if (p === 'Baja') return 'chip chip--baja';
    return 'chip chip--pendiente';
  };

  return (
    <div className="app">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Anuncios</h2>
              <p>Crea avisos importantes para los usuarios inscritos</p>
            </div>
            <button className="btn btn--yellow" onClick={openCreate}>
              <Plus size={16} /> Nuevo anuncio
            </button>
          </header>

          <div className="filter-bar">
            <div className="field">
              <Search />
              <input
                placeholder="Buscar anuncio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <section className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Prioridad</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {anunciosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <Megaphone size={32} />
                          <p>No hay anuncios</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    anunciosFiltrados.map(a => {
                      const imageUrl = getAnnouncementImageUrl(a.fotografia);

                      return (
                        <tr key={a.id}>
                          <td>{a.titulo}</td>
                          <td><span className={prioridadChip(a.prioridad)}>{a.prioridad}</span></td>
                          <td className="muted">{new Date(a.fecha_publicacion).toLocaleDateString()}</td>
                          <td><span className={`chip ${a.activo ? 'chip--activo' : 'chip--inactivo'}`}>{a.activo ? 'Activo' : 'Oculto'}</span></td>
                          <td>
                            {imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageUrl}
                                className="announcement-image announcement-image--table"
                                alt={`Imagen del anuncio: ${a.titulo}`}
                              />
                            )}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-icon btn-icon--cyan" title="Editar anuncio" onClick={() => openEdit(a)}>
                                <Pencil size={14} />
                              </button>
                              {/* Ahora abre ConfirmModal en lugar de eliminar directo */}
                              <button className="btn-icon btn-icon--red" title="Eliminar anuncio" onClick={() => handleDeleteClick(a)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      {/* ── MODAL CREAR / EDITAR ─────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</h3>
                <p>Completa la información del anuncio</p>
              </div>
              <button className="btn-close" type="button" onClick={() => setModalOpen(false)}>X</button>
            </div>

            <div className="modal-body">
              <div>
                <label className="date-label" htmlFor="anuncio-titulo">Titulo</label>
                <input
                  id="anuncio-titulo"
                  className="form-select"
                  placeholder="Ingresa el título del anuncio"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className="date-label" htmlFor="anuncio-descripcion">Descripcion</label>
                <textarea
                  id="anuncio-descripcion"
                  className="form-textarea"
                  placeholder="Ingresa la descripción del anuncio"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className="date-label" htmlFor="anuncio-prioridad">Prioridad</label>
                <select
                  id="anuncio-prioridad"
                  className="form-select"
                  aria-label="Selecciona la prioridad del anuncio"
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                >
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>

              <div>
                <label className="date-label" htmlFor="anuncio-imagen">Imagen</label>
                <input
                  type="file"
                  id="anuncio-imagen"
                  className="form-select"
                  accept="image/*"
                  title="Selecciona una imagen para el anuncio"
                  aria-label="Selecciona una imagen para el anuncio"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setForm({ ...form, fotografia: file });
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                {preview && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      className="announcement-image announcement-image--preview"
                      alt="Vista previa de la imagen del anuncio"
                    />
                  </>
                )}
              </div>
            </div>

            {saveError && <span className="error-text">{saveError}</span>}

            <div className="modal-footer">
              <button className="btn btn--outline" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn--yellow" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR ELIMINAR ─────────────────────────── */}
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar anuncio"
        message={`¿Seguro que deseas eliminar el anuncio "${pendingDeleteTitulo}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
          setPendingDeleteTitulo('');
        }}
      />

    </div>
  );
}
