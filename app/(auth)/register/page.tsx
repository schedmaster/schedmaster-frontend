'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleCheck, Lock } from 'lucide-react';
import TerminosModal from "@/app/components/TerminosModal";
import AlertModal from '../../components/AlertModal';
import { gxFontClass } from '../../styles/fonts';

function getRoleId(tipo: string) {
  if (tipo === 'estudiante') return 1;
  if (tipo === 'docente') return 2;
  return 3;
}

const INITIAL_FORM = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  tipo: 'estudiante',
  division: '',
  carrera: '',
  password: '',
  confirmPassword: '',
  terms: false
};

function addStudentValidationErrors(
  form: typeof INITIAL_FORM,
  errors: Record<string, string>
) {
  if (form.tipo !== 'estudiante') return;
  if (!form.division) errors.division = 'campo obligatorio';
  if (!form.carrera) errors.carrera = 'campo obligatorio';
}

function getValidationErrors(form: typeof INITIAL_FORM) {
  const errors: Record<string, string> = {};
  if (!form.nombre) errors.nombre = 'campo obligatorio';
  if (!form.apellido_paterno) errors.apellido_paterno = 'campo obligatorio';
  if (!form.apellido_materno) errors.apellido_materno = 'campo obligatorio';
  if (!form.email) errors.email = 'campo obligatorio';
  addStudentValidationErrors(form, errors);
  if (!form.password) errors.password = 'campo obligatorio';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'las contrasenas no coinciden';
  if (!form.terms) errors.terms = 'acepta los terminos';
  return errors;
}

function getPasswordStatus(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /\d|[^A-Za-z0-9]/.test(password);
  const checks = [hasMinLength, hasUppercase, hasNumberOrSymbol];
  const strength = checks.filter(Boolean).length;
  const level = password
    ? Math.min(4, Math.floor((strength / checks.length) * 4))
    : 0;

  return { hasMinLength, hasUppercase, hasNumberOrSymbol, level };
}

export default function RegisterPage() {
  const router = useRouter();
  const progressFillRef = useRef<HTMLDivElement | null>(null);

  const [form,setForm] = useState(INITIAL_FORM);

  const [showTerminos, setShowTerminos] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [divisiones, setDivisiones] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Base API url (from env)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const {
    hasMinLength,
    hasUppercase,
    hasNumberOrSymbol,
    level: passwordMeterLevel
  } = getPasswordStatus(form.password);

  useEffect(() => {
    fetch(`${API_URL}/catalogo/divisiones`)
      .then(r => r.json())
      .then(setDivisiones)
      .catch(() => setDivisiones([]));
  }, []);

  // Cargar carreras según división
  useEffect(()=>{
    if(!form.division){
      setCarreras([]);
      return;
    }
    fetch(`${API_URL}/catalogo/carreras/${form.division}`)
      .then(r => r.json())
      .then(setCarreras)
      .catch(() => setCarreras([]));
  }, [form.division]);

  useEffect(() => {
    const fields = ['nombre', 'apellido_paterno', 'apellido_materno', 'email', 'password', 'confirmPassword'];
    let filled = fields.filter(f => (form as any)[f]).length;
    if (form.terms) filled++;
    setProgress((filled / (fields.length + 1)) * 100);
  }, [form]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validación
  useEffect(() => {
    setErrors(getValidationErrors(form));
  }, [form]);

  const formValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formValid) return;

    const datosParaBackend = {
      nombre: form.nombre,
      apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno,
      correo: form.email,
      password: form.password,
      id_carrera: form.carrera,
      id_division: form.division,
      id_rol: getRoleId(form.tipo)
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaBackend)
      });

      if(res.ok){
        setSuccess(true);
        setTimeout(()=>router.push('/login'),2000);
        return;
      }

      const errorData=await res.json();
      setAlertMessage(`Error al registrar: ${errorData.message}`);
      setAlertOpen(true);

    }catch(error){
      console.error('Error registrando usuario:', error);
      setAlertMessage('Error de conexion al registrar');
      setAlertOpen(true);
    }
  };

  return (
    <div className={`gx-scope gx-reg-page ${gxFontClass}`}>
      <div className="gx-reg-page-bg">
        <div className="gx-hero-orb gx-hero-orb--1 gx-float-a" />
        <div className="gx-hero-orb gx-hero-orb--2 gx-float-b" />
      </div>

      <div className="gx-reg-container">
        {success ? (
          <div className="gx-card gx-reg-success">
            <div className="gx-reg-success-icon"><CircleCheck size={36}/></div>
            <h2>¡Cuenta creada!</h2>
            <p>Redirigiendo al inicio de sesión…</p>
          </div>
        ) : (
          <div className="gx-card gx-reg-card">
            <button type="button" className="gx-btn gx-btn--outline gx-btn--sm gx-reg-back" onClick={() => router.push('/')}>
              <ArrowLeft size={16} /> Volver al inicio
            </button>

            <div className="gx-reg-head">
              <div className="gx-reg-badge"><CircleCheck size={28}/></div>
              <h1>Únete a <span className="gx-grad-text">SchedMaster</span></h1>
              <p>Completa tu información para crear tu cuenta</p>
            </div>

            <div className="gx-reg-progress">
              <span ref={progressFillRef} style={{ width: `${progress}%` }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="gx-field">
                <label htmlFor="tipo">Tipo de usuario</label>
                <select id="tipo" title="Tipo de usuario" name="tipo" value={form.tipo} className="gx-select" onChange={handleChange}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div className="gx-reg-row">
                <div className="gx-field">
                  <label>Nombre</label>
                  <input name="nombre" value={form.nombre} className="gx-input" onChange={handleChange} />
                </div>
                <div className="gx-field">
                  <label>Apellido paterno</label>
                  <input name="apellido_paterno" value={form.apellido_paterno} className="gx-input" onChange={handleChange} />
                </div>
                <div className="gx-field">
                  <label>Apellido materno</label>
                  <input name="apellido_materno" value={form.apellido_materno} className="gx-input" onChange={handleChange} />
                </div>
              </div>

              <div className="gx-field">
                <label>Correo</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  className={`gx-input ${errors.email ? "is-invalid" : ""}`}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="gx-error-text">{errors.email}</p>
                )}
              </div>

              {/* División y carrera */}
              {form.tipo==="estudiante" && (
                <div className="gx-reg-row gx-reg-row--2">
                  <div className="gx-field">
                    <label htmlFor="division">División</label>
                    <select id="division" title="División" name="division" value={form.division} className="gx-select" onChange={handleChange}>
                      <option value="">Selecciona división</option>
                      {divisiones.map(d=>(<option key={d.id_division} value={d.id_division}>{d.nombre_division}</option>))}
                    </select>
                  </div>

                  <div className="gx-field">
                    <label htmlFor="carrera">Carrera</label>
                    <select id="carrera" title="Carrera" name="carrera" value={form.carrera} className="gx-select" onChange={handleChange}>
                      <option value="">Selecciona carrera</option>
                      {carreras.map(c => (<option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>))}
                    </select>
                  </div>
                </div>
              )}

              <div className="gx-field">
                <label htmlFor="password"><Lock size={14}/> Contraseña</label>
                <input id="password" title="Contraseña" name="password" type="password" className="gx-input" placeholder="Crea una contraseña segura" onChange={handleChange}/>

                <div className="gx-pw-meter" aria-live="polite">
                  <div className="gx-pw-bars" aria-hidden="true">
                    <span className={`gx-pw-bar ${passwordMeterLevel >= 1 ? 'is-active' : ''}`} />
                    <span className={`gx-pw-bar ${passwordMeterLevel >= 2 ? 'is-active' : ''}`} />
                    <span className={`gx-pw-bar ${passwordMeterLevel >= 3 ? 'is-active' : ''}`} />
                    <span className={`gx-pw-bar ${passwordMeterLevel >= 4 ? 'is-active' : ''}`} />
                  </div>

                  <ul className="gx-pw-list">
                    <li className={`gx-pw-item ${hasMinLength ? 'is-met' : ''}`}>
                      <span className="gx-pw-dot" aria-hidden="true" />
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className={`gx-pw-item ${hasUppercase ? 'is-met' : ''}`}>
                      <span className="gx-pw-dot" aria-hidden="true" />
                      <span>Una letra mayúscula</span>
                    </li>
                    <li className={`gx-pw-item ${hasNumberOrSymbol ? 'is-met' : ''}`}>
                      <span className="gx-pw-dot" aria-hidden="true" />
                      <span>Un número o símbolo</span>
                    </li>
                  </ul>
                </div>

                {!!form.password && errors.password && <small className="gx-error-text">{errors.password}</small>}
              </div>

              <div className="gx-field">
                <label htmlFor="confirmPassword"><Lock size={14}/> Confirmar contraseña</label>
                <input id="confirmPassword" title="Confirmar contraseña" name="confirmPassword" type="password" className="gx-input" placeholder="Confirma tu contraseña" onChange={handleChange}/>
                {!!form.confirmPassword && errors.confirmPassword && <small className="gx-error-text">{errors.confirmPassword}</small>}
              </div>

              <div className="gx-checkbox-row" style={{ marginBottom: 20 }}>
                <input id="terms" type="checkbox" name="terms" checked={form.terms} onChange={handleChange}/>
                <label htmlFor="terms">
                  Acepto los <button type="button" onClick={() => setShowTerminos(true)}>términos y condiciones</button>
                </label>
              </div>

              <button type="submit" disabled={!formValid} className="gx-btn gx-btn--primary gx-btn--full gx-btn--lg">
                Crear mi cuenta
              </button>
            </form>
          </div>
        )}

        <TerminosModal
          open={showTerminos}
          onClose={() => setShowTerminos(false)}
        />
      </div>

      <AlertModal
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
