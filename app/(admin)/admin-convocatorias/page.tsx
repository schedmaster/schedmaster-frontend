'use client';

import { useState, useEffect } from 'react';
import { Plus, CalendarDays, Pencil, Power, PowerOff, X, Save } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

interface Convocatoria {
  id: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaIngreso: string;
  fechaFinPeriodo: string; // agregado
  estado: 'activada' | 'desactivada';
}

type FormState = Convocatoria;

/* =========================
   MODAL
==========================*/

interface ModalProps {
  onClose: () => void;
  title: string;
  subtitle: string;
  form: FormState;
  field: any;
  guardarConvocatoria: () => void;
}

const ModalContent = ({
  onClose,
  title,
  subtitle,
  form,
  field,
  guardarConvocatoria
}: ModalProps) => (
  <div className="modal-box modal-box--wide">

    <div className="modal-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <button type="button" className="btn-close" onClick={onClose} title="Cerrar">
        <X />
      </button>
    </div>

    <div className="modal-body">

      <div className="form-group">
        <label><CalendarDays /> Periodo</label>
        <input
          className="form-select"
          type="text"
          placeholder="Ej. Mayo – Agosto 2026"
          {...field('periodo')}
        />
      </div>

      <div className="form-group">
        <label>Fecha inicio inscripciones</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaInicio')}
        />
      </div>

      <div className="form-group">
        <label>Fecha fin inscripciones</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaFin')}
        />
      </div>

      <div className="form-group">
        <label>Fecha ingreso oficial</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaIngreso')}
        />
      </div>

      <div className="form-group">
        <label>Fecha fin del periodo</label>
        <input
          className="form-select"
          type="date"
          {...field('fechaFinPeriodo')}
        />
      </div>

      <div className="form-group">
        <label>Estado</label>
        <select className="form-select" {...field('estado')}>
          <option value="activada">Activada</option>
          <option value="desactivada">Desactivada</option>
        </select>
      </div>

    </div>

    <div className="modal-footer">
      <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
      <button type="button" className="btn btn--blue" onClick={guardarConvocatoria}>
        <Save /> Guardar
      </button>
    </div>

  </div>
);

/* =========================
   COMPONENTE PRINCIPAL
==========================*/

export default function AdminConvocatoriasPage() {

  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const emptyForm: FormState = {
    id: 0,
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
    fechaIngreso: '',
    fechaFinPeriodo: '',
    estado: 'activada'
  };

  const [form, setForm] = useState<FormState>(emptyForm);

  /* =========================
     CARGAR CONVOCATORIAS
  ==========================*/

  useEffect(() => {
    cargarConvocatorias();
  }, []);

  const cargarConvocatorias = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-convocatoria`);
      const data = await res.json();

      const formateadas = data.map((p: any) => ({
        id: p.id_periodo,
        periodo: p.nombre_periodo,
        fechaInicio: p.fecha_inicio_inscripcion.split('T')[0],
        fechaFin: p.fecha_fin_inscripcion.split('T')[0],
        fechaIngreso: p.fecha_inicio_actividades.split('T')[0],
        fechaFinPeriodo: p.fecha_fin_periodo.split('T')[0],
        estado: p.estado === 'activo' ? 'activada' : 'desactivada'
      }));

      setConvocatorias(formateadas);

    } catch (error) {
      console.error("Error cargando convocatorias", error);
    }
  };

  /* =========================
     MODALES
  ==========================*/

  const openCrear = () => {
    setForm(emptyForm);
    setModalCrear(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCrear = () => {
    setModalCrear(false);
    document.body.style.overflow = '';
  };

  const openEditar = (c: Convocatoria) => {
    setForm(c);
    setModalEditar(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditar = () => {
    setModalEditar(false);
    document.body.style.overflow = '';
  };

  const field = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  /* =========================
     GUARDAR CONVOCATORIA
  ==========================*/

  const guardarConvocatoria = async () => {
    try {

      const esEdicion = form.id > 0;
      const url = esEdicion 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin-convocatoria/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin-convocatoria`;

      const res = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_periodo: form.periodo,
          fecha_inicio_inscripcion: form.fechaInicio,
          fecha_fin_inscripcion: form.fechaFin,
          fecha_inicio_actividades: form.fechaIngreso,
          fecha_fin_periodo: form.fechaFinPeriodo,
          estado: form.estado === 'activada' ? 'activo' : 'inactivo',
          id_entrenador: 1
        })
      });

      if (!res.ok) throw new Error("Error al guardar");

      closeCrear();
      closeEditar();
      cargarConvocatorias();

    } catch (error) {
      console.error(error);
      alert("Error al guardar convocatoria");
    }
  };

  /* =========================
     VISTA
  ==========================*/

  return (
    <div className="app">
      <AdminSidebar />
      <main className="main">
        <div className="main-inner">
          <header className="section-header">
            <div>
              <h2>Convocatorias</h2>
              <p>Administra los periodos de inscripción disponibles</p>
            </div>

            <button className="btn btn--yellow" onClick={openCrear}>
              <Plus /> Nueva convocatoria
            </button>
          </header>

          <section className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Inicio inscripciones</th>
                    <th>Fin inscripciones</th>
                    <th>Ingreso oficial</th>
                    <th>Fin del periodo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {convocatorias.map(c => (
                    <tr key={c.id}>
                      <td>{c.periodo}</td>
                      <td className="muted">{c.fechaInicio}</td>
                      <td className="muted">{c.fechaFin}</td>
                      <td className="muted">{c.fechaIngreso}</td>
                      <td className="muted">{c.fechaFinPeriodo}</td>
                      <td>
                        <span className={`chip chip--${c.estado}`}>
                          {c.estado === 'activada' ? <Power size={14} /> : <PowerOff size={14} />}
                          {c.estado}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-icon btn-icon--cyan"
                            onClick={() => openEditar(c)}
                            title="Editar convocatoria"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {modalCrear && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeCrear()}
        >
          <ModalContent
            onClose={closeCrear}
            title="Nueva convocatoria"
            subtitle="Configura un nuevo periodo de inscripciones"
            form={form}
            field={field}
            guardarConvocatoria={guardarConvocatoria}
          />
        </div>
      )}

      {modalEditar && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeEditar()}
        >
          <ModalContent
            onClose={closeEditar}
            title="Editar convocatoria"
            subtitle="Actualiza la información del periodo"
            form={form}
            field={field}
            guardarConvocatoria={guardarConvocatoria}
          />
        </div>
      )}

    </div>
  );
}