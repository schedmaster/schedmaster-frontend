'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Pencil, ClipboardList, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import Bitacora, { Comentario } from '../../components/Bitacora';
import ConfirmModal from '../../components/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Rol = 'estudiante' | 'docente' | 'entrenador' | 'administrador_general';
type Estado = 'activo' | 'inactivo';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  iniciales: string;
  correo: string;
  matricula: string;
  carrera: string;
  id_carrera: number | null;
  id_rol: number;
  rol: Rol;
  estado: Estado;
}

const AVATAR_COLORS = ['ac1','ac2','ac3','ac4','ac5','ac6','ac7','ac8'] as const;
const getAvatarClass = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const ROL_LABELS: Record<Rol, string> = {
  estudiante: 'Alumno',
  docente: 'Docente',
  entrenador: 'Entrenador',
  administrador_general: 'Admin',
};

const ROLES_CON_BITACORA: Rol[] = ['estudiante', 'docente'];

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [bitacoraOpen, setBitacoraOpen] = useState(false);
  const [bitacoraUsuario, setBitacoraUsuario] = useState<{ id: number; nombre: string } | null>(null);
  const [bitacoraComentarios, setBitacoraComentarios] = useState<Comentario[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [openNuevoModal, setOpenNuevoModal] = useState(false);

  const emptyEdit = { nombre: '', apellido_paterno: '', apellido_materno: '', correo: '', id_rol: 1 };
  const [formEdit, setFormEdit] = useState(emptyEdit);

  const emptyNuevo = { nombre: '', apellido_paterno: '', apellido_materno: '', correo: '', contrasena: '', id_rol: 3 };
  const [formNuevo, setFormNuevo] = useState(emptyNuevo);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [usuarioToggle, setUsuarioToggle] = useState<{ id: number; activo: boolean } | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      if (res.ok) {
        const data = await res.json();
        const formateados: Usuario[] = data.map((u: any) => ({
          id: u.id_usuario,
          nombre: u.nombre,
          apellido: `${u.apellido_paterno} ${u.apellido_materno}`,
          iniciales: `${u.nombre[0]}${u.apellido_paterno[0]}`.toUpperCase(),
          correo: u.correo,
          matricula: u.id_usuario.toString(),
          carrera: u.carrera?.nombre_carrera || 'Sin carrera',
          id_carrera: u.id_carrera ?? null,
          id_rol: u.id_rol,
          rol: u.rol.nombre_rol as Rol,
          estado: u.activo ? 'activo' : 'inactivo',
        }));
        setUsuarios(formateados);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  useEffect(() => {
    let f = [...usuarios];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(u =>
        `${u.nombre} ${u.apellido} ${u.correo} ${u.matricula}`.toLowerCase().includes(q)
      );
    }
    if (filterRol)     f = f.filter(u => u.rol === filterRol);
    if (filterEstado)  f = f.filter(u => u.estado === filterEstado);
    if (filterCarrera) f = f.filter(u => u.carrera.toLowerCase() === filterCarrera.toLowerCase());
    setFilteredUsuarios(f);
  }, [usuarios, searchQuery, filterRol, filterEstado, filterCarrera]);

  const openModal  = () => { document.body.style.overflow = 'hidden'; };
  const closeModal = () => { document.body.style.overflow = ''; };

  const handleEditar = (usr: Usuario) => {
    const [ap, am] = usr.apellido.split(' ');
    setUsuarioEditar(usr);
    setFormEdit({ nombre: usr.nombre, apellido_paterno: ap || '', apellido_materno: am || '', correo: usr.correo, id_rol: usr.id_rol });
    setOpenEditModal(true);
    openModal();
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormEdit(prev => ({ ...prev, [name]: name === 'id_rol' ? parseInt(value) : value }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditar) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuarioEditar.id, nombre: formEdit.nombre, apellido_paterno: formEdit.apellido_paterno, apellido_materno: formEdit.apellido_materno, correo: formEdit.correo, id_rol: formEdit.id_rol, id_carrera: usuarioEditar.id_carrera }),
      });
      if (res.ok) { setOpenEditModal(false); closeModal(); fetchUsuarios(); }
    } catch (error) { console.error(error); }
  };

  const handleAbrirNuevo = () => {
    setFormNuevo(emptyNuevo);
    setOpenNuevoModal(true);
    openModal();
  };

  const handleChangeNuevo = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormNuevo(prev => ({ ...prev, [name]: name === 'id_rol' ? parseInt(value) : value }));
  };

  const handleSubmitNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/usuarios/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: formNuevo.nombre, apellido_paterno: formNuevo.apellido_paterno, apellido_materno: formNuevo.apellido_materno, correo: formNuevo.correo, contrasena: formNuevo.contrasena, id_rol: formNuevo.id_rol }),
      });
      if (res.ok) { setOpenNuevoModal(false); closeModal(); fetchUsuarios(); }
    } catch (error) { console.error(error); }
  };

  const handleToggle = (usr: Usuario) => {
    setUsuarioToggle({ id: usr.id, activo: usr.estado === 'activo' });
    setOpenConfirm(true);
  };

  const confirmarToggle = async () => {
    if (!usuarioToggle) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuarioToggle.id }),
      });
      if (res.ok) fetchUsuarios();
    } catch (error) { console.error(error); }
    finally { setOpenConfirm(false); setUsuarioToggle(null); }
  };

  const handleBitacora = async (id: number, nombre: string) => {
    setBitacoraUsuario({ id, nombre });
    setBitacoraComentarios([]);
    setBitacoraOpen(true);
    openModal();
    try {
      const res = await fetch(`${API_URL}/usuarios/bitacora/${id}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Comentario[] = data.map((e: any) => ({
          id: e.id_entrada,
          autorNombre: e.autor_nombre,
          autorIniciales: e.autor_nombre.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
          fecha: e.fecha,
          texto: e.texto,
        }));
        setBitacoraComentarios(mapped);
      }
    } catch (error) { console.error(error); }
  };

  const handleNuevoComentario = async (usuarioId: number, texto: string) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/bitacora`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuarioId, texto, autor_nombre: 'Admin UTEQ' }),
      });
      if (res.ok) {
        const nueva = await res.json();
        const comentario: Comentario = {
          id: nueva.id_entrada,
          autorNombre: nueva.autor_nombre,
          autorIniciales: nueva.autor_nombre.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
          fecha: nueva.fecha,
          texto: nueva.texto,
        };
        setBitacoraComentarios(prev => [comentario, ...prev]);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="app">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Gestión de Usuarios</h2>
              <p>Administra los usuarios de la plataforma</p>
            </div>
            <button className="btn btn--yellow" onClick={handleAbrirNuevo}>
              <UserPlus /> Nuevo Usuario
            </button>
          </header>

          {/* ── FILTROS RESPONSIVOS ──────────────────────────────────── */}
          <section className="filter-bar">
            <div className="field">
              <Search />
              <input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtros que faltaban conectar al JSX */}
            <select
              className="select"
              value={filterRol}
              onChange={e => setFilterRol(e.target.value)}
              aria-label="Filtrar por rol"
            >
              <option value="">Todos los roles</option>
              <option value="estudiante">Alumno</option>
              <option value="docente">Docente</option>
              <option value="entrenador">Entrenador</option>
              <option value="administrador_general">Admin General</option>
            </select>

            <select
              className="select"
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <select
              className="select"
              value={filterCarrera}
              onChange={e => setFilterCarrera(e.target.value)}
              aria-label="Filtrar por carrera"
            >
              <option value="">Todas las carreras</option>
              {Array.from(new Set(usuarios.map(u => u.carrera))).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </section>

          {/* ── LISTA DE USUARIOS ────────────────────────────────────── */}
          <section className="row-list">
            {filteredUsuarios.map(usr => (
              <div key={usr.id} className="row-card">
                <div className={`row-avatar ${getAvatarClass(usr.id)}`}>{usr.iniciales}</div>

                <div className="row-info">
                  <span className="row-name">{usr.nombre} {usr.apellido}</span>
                  <span className="row-sub muted">{usr.correo}</span>
                  <span className="row-sub muted">{usr.carrera}</span>
                </div>

                {/* row-actions con flex-wrap para que no se desborde en móvil */}
                <div className="row-actions" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  <span className={`chip chip--${usr.rol}`}>{ROL_LABELS[usr.rol]}</span>
                  <span className={`chip chip--${usr.estado}`}>{usr.estado}</span>
                  {ROLES_CON_BITACORA.includes(usr.rol) && (
                    <button
                      className="btn-icon btn-icon--blue"
                      title="Ver bitácora"
                      onClick={() => handleBitacora(usr.id, `${usr.nombre} ${usr.apellido}`)}
                    >
                      <ClipboardList />
                    </button>
                  )}
                  <button
                    className="btn-icon btn-icon--cyan"
                    title="Editar usuario"
                    onClick={() => handleEditar(usr)}
                  >
                    <Pencil />
                  </button>
                  <button
                    className={`btn-icon ${usr.estado === 'activo' ? 'btn-icon--red' : 'btn-icon--green'}`}
                    onClick={() => handleToggle(usr)}
                    title={usr.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  >
                    {usr.estado === 'activo' ? <ToggleRight /> : <ToggleLeft />}
                  </button>
                </div>
              </div>
            ))}
          </section>

        </div>
      </main>

      {/* ── MODAL EDITAR ─────────────────────────────────────────────── */}
      {openEditModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-header">
              <div><h3>Editar usuario</h3><p>Actualiza la información del usuario</p></div>
              <button className="btn-close" onClick={() => { setOpenEditModal(false); closeModal(); }}><X /></button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre</label>
                  <input className="form-select" name="nombre" value={formEdit.nombre} onChange={handleChangeEdit} />
                </div>
                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Apellido Paterno</label>
                    <input className="form-select" name="apellido_paterno" value={formEdit.apellido_paterno} onChange={handleChangeEdit} />
                  </div>
                  <div className="form-group half-width">
                    <label>Apellido Materno</label>
                    <input className="form-select" name="apellido_materno" value={formEdit.apellido_materno} onChange={handleChangeEdit} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input className="form-select" name="correo" value={formEdit.correo} onChange={handleChangeEdit} />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="form-select" name="id_rol" value={formEdit.id_rol} onChange={handleChangeEdit}>
                    <option value={1}>Alumno</option>
                    <option value={2}>Docente</option>
                    <option value={3}>Entrenador</option>
                    <option value={4}>Admin General</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => { setOpenEditModal(false); closeModal(); }}>Cancelar</button>
                <button type="submit" className="btn btn--blue"><Save /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVO USUARIO ──────────────────────────────────────── */}
      {openNuevoModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-header">
              <div><h3>Nuevo usuario</h3><p>Completa los datos del nuevo usuario</p></div>
              <button className="btn-close" onClick={() => { setOpenNuevoModal(false); closeModal(); }}><X /></button>
            </div>
            <form onSubmit={handleSubmitNuevo}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre</label>
                  <input className="form-select" name="nombre" value={formNuevo.nombre} onChange={handleChangeNuevo} required />
                </div>
                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Apellido Paterno</label>
                    <input className="form-select" name="apellido_paterno" value={formNuevo.apellido_paterno} onChange={handleChangeNuevo} required />
                  </div>
                  <div className="form-group half-width">
                    <label>Apellido Materno</label>
                    <input className="form-select" name="apellido_materno" value={formNuevo.apellido_materno} onChange={handleChangeNuevo} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input className="form-select" type="email" name="correo" value={formNuevo.correo} onChange={handleChangeNuevo} required />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input className="form-select" type="password" name="contrasena" value={formNuevo.contrasena} onChange={handleChangeNuevo} required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="form-select" name="id_rol" value={formNuevo.id_rol} onChange={handleChangeNuevo}>
                    <option value={3}>Entrenador</option>
                    <option value={4}>Admin General</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => { setOpenNuevoModal(false); closeModal(); }}>Cancelar</button>
                <button type="submit" className="btn btn--yellow"><UserPlus /> Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BITÁCORA ─────────────────────────────────────────────────── */}
      {bitacoraUsuario && (
        <Bitacora
          isOpen={bitacoraOpen}
          onClose={() => { setBitacoraOpen(false); setBitacoraUsuario(null); setBitacoraComentarios([]); closeModal(); }}
          usuarioNombre={bitacoraUsuario.nombre}
          usuarioId={bitacoraUsuario.id}
          comentariosIniciales={bitacoraComentarios}
          onNuevoComentario={handleNuevoComentario}
        />
      )}

      <ConfirmModal
        open={openConfirm}
        onCancel={() => { setOpenConfirm(false); setUsuarioToggle(null); }}
        onConfirm={confirmarToggle}
        title={usuarioToggle?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        message={usuarioToggle?.activo ? '¿Seguro que deseas desactivar este usuario?' : '¿Seguro que deseas activar este usuario?'}
      />
    </div>
  );
}