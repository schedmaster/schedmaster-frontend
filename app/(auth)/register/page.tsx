'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '', apellido_paterno: '', apellido_materno: '',
    email: '', tipo: 'estudiante', division: '', carrera: '',
    horarioId: '', diasSeleccionados: [] as number[],
    password: '', confirmPassword: '', terms: false,
  });

  const [horarios,    setHorarios]    = useState<any[]>([]);
  const [diasHorario, setDiasHorario] = useState<any[]>([]);
  const [strength,    setStrength]    = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [success,     setSuccess]     = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios`)
      .then(r => r.json())
      .then(d => setHorarios(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setHorarios([]));
  }, []);

  useEffect(() => {
    if (!form.horarioId) return setDiasHorario([]);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios/${form.horarioId}/dias`)
      .then(r => r.json()).then(setDiasHorario).catch(() => setDiasHorario([]));
  }, [form.horarioId]);

  useEffect(() => {
    const fields = ['nombre','apellido_paterno','apellido_materno','email','password','confirmPassword','horarioId'];
    let filled = fields.filter(f => (form as any)[f]).length;
    if (form.terms) filled++;
    setProgress((filled / (fields.length + 1)) * 100);
  }, [form]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'password') {
      let s = 0;
      if (value.length >= 8) s++;
      if (/[A-Z]/.test(value)) s++;
      if (/[0-9]/.test(value)) s++;
      setStrength(s);
    }
  };

  const toggleDia = (id: number) => setForm(prev => ({
    ...prev,
    diasSeleccionados: prev.diasSeleccionados.includes(id)
      ? prev.diasSeleccionados.filter(d => d !== id)
      : [...prev.diasSeleccionados, id],
  }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert('Las contraseñas no coinciden');
    
    // TRADUCCIÓN PARA EL BACKEND
    const datosParaBackend = {
      nombre: form.nombre,
      apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno,
      correo: form.email, 
      password: form.password,
      id_carrera: form.carrera,
      id_division: form.division,
      id_rol: form.tipo === 'estudiante' ? 2 : 3, 
      id_horario: form.horarioId,
      dias_seleccionados: form.diasSeleccionados 
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(datosParaBackend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return alert(`Error al registrar: ${errorData.message || 'Revisa la consola'}`);
      }
      
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      alert('Error de conexión al registrar');
    }
  };

  return (
    <div className="register-page">
      <div className="register-page container">
        {!success ? (
          <div className="card--glass">

            {/* btn--back reemplaza btn-secondary */}
            <button type="button" className="btn btn--back" onClick={() => router.push('/login')}>
              <ArrowLeft size={18} /> Volver al inicio
            </button>

            <div className="page-header">
              <div className="logo-badge"><CircleCheck size={32} /></div>
              <h1 className="title">Únete a <span className="highlight">SchedMaster</span></h1>
              <p className="subtitle">Completa tu información para crear tu cuenta</p>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" data-progress={progress} />
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de usuario</label>
                <select id="tipo" name="tipo" value={form.tipo} title="Selecciona tipo de usuario" className="auth-select" onChange={handleChange}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input name="nombre" value={form.nombre} className="auth-input" placeholder="Nombre" onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Apellido Paterno</label>
                  <input name="apellido_paterno" value={form.apellido_paterno} className="auth-input" placeholder="Apellido Paterno" onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Apellido Materno</label>
                <input name="apellido_materno" value={form.apellido_materno} className="auth-input" placeholder="Apellido Materno" onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Correo institucional</label>
                <input name="email" value={form.email} type="email" className="auth-input" placeholder="correo@uteq.edu.mx" onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="horarioId">Horario</label>
                <select id="horarioId" name="horarioId" value={form.horarioId} title="Selecciona un horario" className="auth-select" onChange={handleChange}>
                  <option value="">Selecciona horario</option>
                  {horarios.map(h => (
                    <option key={h.id_horario} value={h.id_horario}>{h.hora_inicio} - {h.hora_fin}</option>
                  ))}
                </select>
              </div>

              {form.horarioId && (
                <div className="dias-container">
                  {diasHorario.map(d => (
                    <button key={d.id_dia} type="button"
                      className={`dia-btn ${form.diasSeleccionados.includes(d.id_dia) ? 'active' : ''}`}
                      onClick={() => toggleDia(d.id_dia)}>
                      {d.nombre}
                    </button>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label>Contraseña</label>
                <input name="password" type="password" className="auth-input" placeholder="••••••••" onChange={handleChange} />
                <div className="password-hints">
                  <div className={strength >= 1 ? 'hint ok' : 'hint'}>Mínimo 8 caracteres</div>
                  <div className={strength >= 2 ? 'hint ok' : 'hint'}>Una mayúscula</div>
                  <div className={strength >= 3 ? 'hint ok' : 'hint'}>Un número</div>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input name="confirmPassword" type="password" className="auth-input" placeholder="••••••••" onChange={handleChange} />
              </div>

              <div className="checkbox-wrapper">
                <input id="terms" type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
                <label htmlFor="terms">Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a></label>
              </div>

              {/* btn--full + btn--lg reemplaza btn-primary */}
              <button type="submit" className="btn btn--blue btn--full btn--lg">
                Crear mi cuenta
              </button>

            </form>
          </div>
        ) : (
          <div className="card--glass card--center">
            <div className="success-icon"><CircleCheck size={40} /></div>
            <h2 className="success-title">¡Cuenta creada!</h2>
            <p className="success-text">Redirigiendo al inicio de sesión…</p>
          </div>
        )}
      </div>
    </div>
  );
}