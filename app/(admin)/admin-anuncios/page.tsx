'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Megaphone } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

interface Anuncio {
  id: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fotografia: string;
  fecha_publicacion: string;
  activo: boolean;
}

export default function AdminAnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Anuncio | null>(null);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Alta',
    fotografia: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/anuncios')
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(err => console.error(err));
  }, []);

  const anunciosFiltrados = anuncios.filter(a =>
    a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      titulo: '',
      descripcion: '',
      prioridad: 'Alta',
      fotografia: null,
    });
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (a: Anuncio) => {
    setEditing(a);

    setForm({
      titulo: a.titulo || '',
      descripcion: a.descripcion || '',
      prioridad: a.prioridad || 'Alta',
      fotografia: null,
    });

    setPreview(
      a.fotografia
        ? `http://localhost:3001/imagenes/${a.fotografia}`
        : null
    );

    setModalOpen(true);
  };

  const deleteAnuncio = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/api/anuncios/${id}`, {
        method: 'DELETE',
      });

      setAnuncios(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('prioridad', form.prioridad);

      if (form.fotografia) {
        formData.append('imagen', form.fotografia);
      }

      const url = editing
        ? `http://localhost:3001/api/anuncios/${editing.id}`
        : 'http://localhost:3001/api/anuncios';

      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (editing) {
        setAnuncios(prev =>
          prev.map(a => (a.id === editing.id ? data : a))
        );
      } else {
        setAnuncios(prev => [...prev, data]);
      }

      setModalOpen(false);
      setEditing(null);
      setPreview(null);

    } catch (error) {
      console.error(error);
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
                    anunciosFiltrados.map(a => (
                      <tr key={a.id}>
                        <td>{a.titulo}</td>

                        <td>
                          <span className={prioridadChip(a.prioridad)}>
                            {a.prioridad}
                          </span>
                        </td>

                        <td className="muted">
                          {new Date(a.fecha_publicacion).toLocaleDateString()}
                        </td>

                        <td>
                          <span className={`chip ${a.activo ? 'chip--activo' : 'chip--inactivo'}`}>
                            {a.activo ? 'Activo' : 'Oculto'}
                          </span>
                        </td>

                        <td>
                          {a.fotografia && (
                            <img
                              src={`http://localhost:3001/imagenes/${a.fotografia}`}
                              className="announcement-image"
                              style={{ width: '80px' }}
                            />
                          )}
                        </td>

                        <td>
                          <div className="row-actions">
                            <button className="btn-icon btn-icon--cyan" onClick={() => openEdit(a)}>
                              <Pencil size={14} />
                            </button>

                            <button className="btn-icon btn-icon--red" onClick={() => deleteAnuncio(a.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          </section>

        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">

            <div className="modal-header">
              <div>
                <h3>{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</h3>
                <p>Completa la información del anuncio</p>
              </div>
              <button className="btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body">

              <div>
                <label className="date-label">Título</label>
                <input
                  className="form-select"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className="date-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className="date-label">Prioridad</label>
                <select
                  className="form-select"
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                >
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>

              <div>
                <label className="date-label">Imagen</label>
                <input
                  type="file"
                  className="form-select"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    setForm({ ...form, fotografia: file });

                    if (file) {
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {preview && (
                  <img
                    src={preview}
                    className="announcement-image"
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn--outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn--yellow" onClick={handleSave}>
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}