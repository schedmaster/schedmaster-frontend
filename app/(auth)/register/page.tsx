'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleCheck, Lock } from 'lucide-react';
import AlertModal from '../../components/AlertModal';

export default function RegisterPage() {

  const router = useRouter();
  const progressFillRef = useRef<HTMLDivElement | null>(null);

  const [form,setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    tipo: 'estudiante', 
    division: '',
    carrera: '',
    horarioId: '',
    diasSeleccionados: [] as number[],
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [errors,setErrors] = useState<any>({});
  const [horarios,setHorarios] = useState<any[]>([]);
  const [diasHorario,setDiasHorario] = useState<any[]>([]);
  const [divisiones,setDivisiones] = useState<any[]>([]);
  const [carreras,setCarreras] = useState<any[]>([]);
  const [progress,setProgress] = useState(0);
  const [success,setSuccess] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const hasMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumberOrSymbol = /[0-9]|[^A-Za-z0-9]/.test(form.password);
  const passwordStrength = [hasMinLength, hasUppercase, hasNumberOrSymbol].filter(Boolean).length;
  const passwordMeterLevel = form.password
    ? Math.min(4, Math.floor((passwordStrength / 3) * 4))
    : 0;

  // 1. Cargar todos los horarios (Esto ya trae los días incluidos gracias a nuestro backend)
  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios`)
      .then(r=>r.json())
      .then(d=>setHorarios(Array.isArray(d)?d:d?.data||[]))
      .catch(()=>setHorarios([]));
  },[]);

  // 2.  SOLUCIÓN: Extraer los días directamente de la lista que ya tenemos en memoria
  useEffect(() => {
    if (!form.horarioId) {
      setDiasHorario([]);
      setForm(prev => ({ ...prev, diasSeleccionados: [] }));
      return;
    }

    // Buscamos el horario exacto que el alumno seleccionó en el dropdown
    const horarioElegido = horarios.find(h => h.id_horario.toString() === form.horarioId.toString());

    if (horarioElegido && horarioElegido.dias_ids) {
      // Separamos el texto de los días ("Lunes, Miércoles") en un arreglo
      const nombresDias = horarioElegido.dias_semana.split(', ');
      
      // Construimos el arreglo de objetos para que tus botones se puedan dibujar
      const diasArmados = horarioElegido.dias_ids.map((id: number, index: number) => ({
        id_dia: id,
        nombre: nombresDias[index]
      }));
      
      setDiasHorario(diasArmados);
      // Limpiamos los días seleccionados por si el alumno cambió de horario a mitad del registro
      setForm(prev => ({ ...prev, diasSeleccionados: [] })); 
    } else {
      setDiasHorario([]);
    }
  }, [form.horarioId, horarios]);

  // Cargar divisiones
  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalogo/divisiones`)
      .then(r=>r.json())
      .then(setDivisiones)
      .catch(()=>setDivisiones([]));
  },[]);

  // Cargar carreras según división
  useEffect(()=>{
    if(!form.division){
      setCarreras([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalogo/carreras/${form.division}`)
      .then(r=>r.json())
      .then(setCarreras)
      .catch(()=>setCarreras([]));
  },[form.division]);

  // Barra de progreso
  useEffect(()=>{
    const fields=['nombre','apellido_paterno','apellido_materno','email','password','confirmPassword','horarioId'];
    let filled=fields.filter(f=>(form as any)[f]).length;
    if(form.terms) filled++;
    setProgress((filled/(fields.length+1))*100);
  },[form]);

  useEffect(() => {
    if (!progressFillRef.current) return;
    progressFillRef.current.style.width = `${progress}%`;
  }, [progress]);

  // Manejo de inputs
  const handleChange=(e:any)=>{
    const {name,value,type,checked}=e.target;
    setForm(prev=>({
      ...prev,
      [name]:type==='checkbox'?checked:value
    }));
  };

  // Toggle selección de días
  const toggleDia=(id:number)=>{
    setForm(prev=>({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(id)
        ? prev.diasSeleccionados.filter(d=>d!==id)
        : [...prev.diasSeleccionados,id]
    }));
  };

  // Validación
  useEffect(()=>{
    const newErrors:any={};
    if(!form.nombre) newErrors.nombre="campo obligatorio";
    if(!form.apellido_paterno) newErrors.apellido_paterno="campo obligatorio";
    if(!form.apellido_materno) newErrors.apellido_materno="campo obligatorio";
    if(!form.email) newErrors.email="campo obligatorio";
    if(form.tipo==="estudiante"){
      if(!form.division) newErrors.division="campo obligatorio";
      if(!form.carrera) newErrors.carrera="campo obligatorio";
    }
    if(!form.horarioId) newErrors.horarioId="campo obligatorio";
    if(form.diasSeleccionados.length===0) newErrors.dias="selecciona al menos un día";
    if(!form.password) newErrors.password="campo obligatorio";
    if(form.confirmPassword!==form.password) newErrors.confirmPassword="las contraseñas no coinciden";
    if(!form.terms) newErrors.terms="acepta los términos";
    setErrors(newErrors);
  },[form, form.diasSeleccionados.length]);

  const formValid=Object.keys(errors).length===0;

  // Submit
  const handleSubmit=async(e:any)=>{
    e.preventDefault();
    if(!formValid) return;

    const datosParaBackend={
      nombre: form.nombre,
      apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno,
      correo: form.email,
      password: form.password,
      id_carrera: form.carrera,
      id_division: form.division,
      id_rol: form.tipo==='estudiante'?1: form.tipo==='docente'?2:3,
      id_horario: form.horarioId,
      dias_seleccionados: form.diasSeleccionados
    };

    try{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(datosParaBackend)
      });

      if(!res.ok){
        const errorData=await res.json();
        setAlertMessage(`Error al registrar: ${errorData.message}`);
        setAlertOpen(true);
        return;
      }

      setSuccess(true);
      setTimeout(()=>router.push('/login'),2000);

    }catch{
      setAlertMessage('Error de conexión al registrar');
      setAlertOpen(true);
    }
  };

  return(
    <div className="register-page">
      <div className="register-page container">
        {!success?(
          <div className="card--glass">
            <button type="button" className="btn btn--back" onClick={()=>router.push('/login')}>
              <ArrowLeft size={18}/> Volver al inicio
            </button>

            <div className="page-header">
              <div className="logo-badge"><CircleCheck size={32}/></div>
              <h1 className="title">Únete a <span className="highlight">SchedMaster</span></h1>
              <p className="subtitle">Completa tu información para crear tu cuenta</p>
            </div>

            <div className="progress-bar">
              <div ref={progressFillRef} className="progress-fill" />
            </div>

            <form onSubmit={handleSubmit}>

              {/* Tipo usuario */}
              <div className="form-group">
                <label htmlFor="tipo">Tipo de usuario</label>
                <select id="tipo" title="Tipo de usuario" name="tipo" value={form.tipo} className="auth-select" onChange={handleChange}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              {/* Nombre completo */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input id="nombre" title="Nombre" name="nombre" value={form.nombre} className="auth-input" onChange={handleChange}/>
                  {errors.nombre && <small className="error-text">{errors.nombre}</small>}
                </div>
                <div className="form-group">
                  <label htmlFor="apellido_paterno">Apellido paterno</label>
                  <input id="apellido_paterno" title="Apellido paterno" name="apellido_paterno" value={form.apellido_paterno} className="auth-input" onChange={handleChange}/>
                  {errors.apellido_paterno && <small className="error-text">{errors.apellido_paterno}</small>}
                </div>
                <div className="form-group">
                  <label htmlFor="apellido_materno">Apellido materno</label>
                  <input id="apellido_materno" title="Apellido materno" name="apellido_materno" value={form.apellido_materno} className="auth-input" onChange={handleChange}/>
                  {errors.apellido_materno && <small className="error-text">{errors.apellido_materno}</small>}
                </div>
              </div>

              {/* Correo */}
              <div className="form-group">
                <label htmlFor="email">Correo institucional</label>
                <input id="email" title="Correo institucional" name="email" type="email" value={form.email} className="auth-input" onChange={handleChange}/>
                {errors.email && <small className="error-text">{errors.email}</small>}
              </div>

              {/* División y carrera */}
              {form.tipo==="estudiante" && (
                <>
                  <div className="form-group">
                    <label htmlFor="division">División</label>
                    <select id="division" title="División" name="division" value={form.division} className="auth-select" onChange={handleChange}>
                      <option value="">Selecciona división</option>
                      {divisiones.map(d=>(<option key={d.id_division} value={d.id_division}>{d.nombre_division}</option>))}
                    </select>
                    {errors.division && <small className="error-text">{errors.division}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="carrera">Carrera</label>
                    <select id="carrera" title="Carrera" name="carrera" value={form.carrera} className="auth-select" onChange={handleChange}>
                      <option value="">Selecciona carrera</option>
                      {carreras.map(c=>(<option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>))}
                    </select>
                    {errors.carrera && <small className="error-text">{errors.carrera}</small>}
                  </div>
                </>
              )}

              {/* Horario */}
              <div className="form-group">
                <label htmlFor="horarioId">Horario</label>
                <select id="horarioId" title="Horario" name="horarioId" value={form.horarioId} className="auth-select" onChange={handleChange}>
                  <option value="">Selecciona horario</option>
                  {horarios.map(h=>(<option key={h.id_horario} value={h.id_horario}>{h.hora_inicio} - {h.hora_fin}</option>))}
                </select>
                {errors.horarioId && <small className="error-text">{errors.horarioId}</small>}
              </div>

              {/* Días */}
              {form.horarioId && (
                <div className="dias-container">
                  {diasHorario.map(d=>(
                    <button 
                      key={d.id_dia} 
                      type="button" 
                      className={`dia-btn ${form.diasSeleccionados.includes(d.id_dia)?'active':''}`} 
                      onClick={()=>toggleDia(d.id_dia)}
                    >
                      {d.nombre}
                    </button>
                  ))}
                  {errors.dias && <small className="error-text">{errors.dias}</small>}
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label className="input-label" htmlFor="password"><Lock size={16}/> Contraseña</label>
                <input id="password" title="Contraseña" name="password" type="password" className="auth-input" placeholder="Crea una contraseña segura" onChange={handleChange}/>

                <div className="password-validator" aria-live="polite">
                  <div className="password-validator-bars" role="presentation">
                    <span className={`password-validator-bar ${passwordMeterLevel >= 1 ? 'is-active' : ''}`} />
                    <span className={`password-validator-bar ${passwordMeterLevel >= 2 ? 'is-active' : ''}`} />
                    <span className={`password-validator-bar ${passwordMeterLevel >= 3 ? 'is-active' : ''}`} />
                    <span className={`password-validator-bar ${passwordMeterLevel >= 4 ? 'is-active' : ''}`} />
                  </div>

                  <ul className="password-validator-list">
                    <li className={`password-validator-item ${hasMinLength ? 'is-met' : ''}`}>
                      <span className="password-validator-dot" aria-hidden="true" />
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className={`password-validator-item ${hasUppercase ? 'is-met' : ''}`}>
                      <span className="password-validator-dot" aria-hidden="true" />
                      <span>Una letra mayúscula</span>
                    </li>
                    <li className={`password-validator-item ${hasNumberOrSymbol ? 'is-met' : ''}`}>
                      <span className="password-validator-dot" aria-hidden="true" />
                      <span>Un número o símbolo</span>
                    </li>
                  </ul>
                </div>

                {!!form.password && errors.password && <small className="error-text">{errors.password}</small>}
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="confirmPassword"><Lock size={16}/> Confirmar contraseña</label>
                <input id="confirmPassword" title="Confirmar contraseña" name="confirmPassword" type="password" className="auth-input" placeholder="Confirma tu contraseña" onChange={handleChange}/>
                {!!form.confirmPassword && errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
              </div>

              <div className="checkbox-wrapper">
                <input id="terms" type="checkbox" name="terms" checked={form.terms} onChange={handleChange}/>
                <label htmlFor="terms">Acepto los <a href="#">términos y condiciones</a></label>
              </div>
              {errors.terms && <small className="error-text">{errors.terms}</small>}

              <button type="submit" disabled={!formValid} className="btn btn--blue btn--full btn--lg">Crear mi cuenta</button>
            </form>
          </div>
        ):(
          <div className="card--glass card--center">
            <div className="success-icon"><CircleCheck size={40}/></div>
            <h2 className="success-title">¡Cuenta creada!</h2>
            <p className="success-text">Redirigiendo al inicio de sesión…</p>
          </div>
        )}
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