'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Pencil, Trash2, ClipboardList, X, Save } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import Bitacora from '../../components/Bitacora';
import ConfirmModal from '../../components/ConfirmModal';

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
  rol: Rol;
  estado: Estado;
}

const AVATAR_COLORS = ['ac1','ac2','ac3','ac4','ac5','ac6','ac7','ac8'] as const;
const getAvatarClass = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const ROL_LABELS: Record<Rol, string> = {
  estudiante: 'Alumno',
  docente: 'Docente',
  entrenador: 'Entrenador',
  administrador_general: 'Admin General',
};

export default function AdminUsuariosPage() {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');

  const [bitacoraOpen, setBitacoraOpen] = useState(false);
  const [bitacoraUsuario, setBitacoraUsuario] = useState<{ id: number; nombre: string } | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
  });

  const [openConfirm, setOpenConfirm] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`);
      if (res.ok) {
        const data = await res.json();

        const formateados = data.map((u: any) => ({
          id: u.id_usuario,
          nombre: u.nombre,
          apellido: `${u.apellido_paterno} ${u.apellido_materno}`,
          iniciales: `${u.nombre[0]}${u.apellido_paterno[0]}`.toUpperCase(),
          correo: u.correo,
          matricula: u.id_usuario.toString(),
          carrera: u.carrera?.nombre_carrera || 'Sin carrera',
          rol: u.rol.nombre_rol,
          estado: u.activo ? 'activo' : 'inactivo',
        }));

        setUsuarios(formateados);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  useEffect(() => {
    let f = [...usuarios];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(u =>
        `${u.nombre} ${u.apellido} ${u.correo} ${u.matricula}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (filterRol) f = f.filter(u => u.rol === filterRol);
    if (filterEstado) f = f.filter(u => u.estado === filterEstado);
    if (filterCarrera) f = f.filter(u => u.carrera.toLowerCase() === filterCarrera.toLowerCase());

    setFilteredUsuarios(f);
  }, [usuarios, searchQuery, filterRol, filterEstado, filterCarrera]);

  const handleEditar = (usr: Usuario) => {
    const [ap, am] = usr.apellido.split(' ');

    setUsuarioEditar(usr);
    setFormData({
      nombre: usr.nombre,
      apellido_paterno: ap || '',
      apellido_materno: am || '',
      correo: usr.correo,
    });

    setOpenEditModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioEditar) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/editar`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: usuarioEditar.id,
            ...formData
          }),
        }
      );

      if (res.ok) {
        setOpenEditModal(false);
        document.body.style.overflow = '';
        fetchUsuarios();
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = (id: number) => {
    setUsuarioEliminar(id);
    setOpenConfirm(true);
  };

  const confirmarEliminar = async () => {
    if (!usuarioEliminar) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/eliminar`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuarioEliminar }),
        }
      );

      if (res.ok) fetchUsuarios();

    } catch (error) {
      console.error(error);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleBitacora = (id: number, nombre: string) => {
    setBitacoraUsuario({ id, nombre });
    setBitacoraOpen(true);
  };

  return (
    <div className="app">
      <AdminSidebar/>

      <main className="main">
        <div className="main-inner">

          <header className="section-header">
            <div>
              <h2>Gestión de Usuarios</h2>
              <p>Administra los usuarios de la plataforma</p>
            </div>
            <button className="btn btn--yellow">
              <UserPlus /> Nuevo Usuario
            </button>
          </header>

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
          </section>

          <section className="row-list">
            {filteredUsuarios.map(usr => (
              <div key={usr.id} className="row-card">

                <div className={`row-avatar ${getAvatarClass(usr.id)}`}>
                  {usr.iniciales}
                </div>

                <div className="row-info">
                  <span className="row-name">
                    {usr.nombre} {usr.apellido}
                  </span>
                  <span className="row-sub muted">{usr.correo}</span>
                </div>

                <div className="row-actions">

                  <span className={`chip chip--${usr.rol}`}>
                    {ROL_LABELS[usr.rol]}
                  </span>

                  <span className={`chip chip--${usr.estado}`}>
                    {usr.estado}
                  </span>

                  <button className="btn-icon btn-icon--blue"
                    onClick={() => handleBitacora(usr.id, `${usr.nombre} ${usr.apellido}`)}>
                    <ClipboardList />
                  </button>

                  <button className="btn-icon btn-icon--cyan"
                    onClick={() => handleEditar(usr)}>
                    <Pencil />
                  </button>

                  <button className="btn-icon btn-icon--red"
                    onClick={() => handleEliminar(usr.id)}>
                    <Trash2 />
                  </button>

                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* MODAL EDITAR ESTILO CONVOCATORIAS */}
      {openEditModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">

            <div className="modal-header">
              <div>
                <h3>Editar usuario</h3>
                <p>Actualiza la información del usuario</p>
              </div>
              <button className="btn-close" onClick={() => {
                setOpenEditModal(false);
                document.body.style.overflow = '';
              }}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>

              <div className="modal-body">

                <div className="form-group">
                  <label>Nombre</label>
                  <input className="form-select" name="nombre" value={formData.nombre} onChange={handleChange}/>
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Apellido Paterno</label>
                    <input className="form-select" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange}/>
                  </div>

                  <div className="form-group half-width">
                    <label>Apellido Materno</label>
                    <input className="form-select" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange}/>
                  </div>
                </div>

                <div className="form-group">
                  <label>Correo</label>
                  <input className="form-select" name="correo" value={formData.correo} onChange={handleChange}/>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn--outline"
                  onClick={() => {
                    setOpenEditModal(false);
                    document.body.style.overflow = '';
                  }}>
                  Cancelar
                </button>

                <button type="submit" className="btn btn--blue">
                  <Save /> Guardar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        open={openConfirm}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={confirmarEliminar}
        title="Desactivar usuario"
        message="¿Seguro que deseas desactivar este usuario?"
      />

    </div>
  );
}