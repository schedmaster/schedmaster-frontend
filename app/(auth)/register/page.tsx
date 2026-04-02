'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import TerminosModal from "@/app/components/TerminosModal";

export default function RegisterPage() {

  const router = useRouter();

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

  const [showTerminos, setShowTerminos] = useState(false);

  const [errors,setErrors] = useState<any>({});
  const [horarios,setHorarios] = useState<any[]>([]);
  const [diasHorario,setDiasHorario] = useState<any[]>([]);
  const [divisiones,setDivisiones] = useState<any[]>([]);
  const [carreras,setCarreras] = useState<any[]>([]);
  const [strength,setStrength] = useState(0);
  const [progress,setProgress] = useState(0);
  const [success,setSuccess] = useState(false);

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios`)
      .then(r=>r.json())
      .then(d=>setHorarios(Array.isArray(d)?d:d?.data||[]))
      .catch(()=>setHorarios([]));
  },[]);

  useEffect(() => {
    if (!form.horarioId) {
      setDiasHorario([]);
      setForm(prev => ({ ...prev, diasSeleccionados: [] }));
      return;
    }

    const horarioElegido = horarios.find(h => h.id_horario.toString() === form.horarioId.toString());

    if (horarioElegido && horarioElegido.dias_ids) {
      const nombresDias = horarioElegido.dias_semana.split(', ');
      
      const diasArmados = horarioElegido.dias_ids.map((id: number, index: number) => ({
        id_dia: id,
        nombre: nombresDias[index]
      }));
      
      setDiasHorario(diasArmados);
      setForm(prev => ({ ...prev, diasSeleccionados: [] })); 
    } else {
      setDiasHorario([]);
    }
  }, [form.horarioId, horarios]);

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalogo/divisiones`)
      .then(r=>r.json())
      .then(setDivisiones)
      .catch(()=>setDivisiones([]));
  },[]);

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

  useEffect(()=>{
    const fields=['nombre','apellido_paterno','apellido_materno','email','password','confirmPassword','horarioId'];
    let filled=fields.filter(f=>(form as any)[f]).length;
    if(form.terms) filled++;
    setProgress((filled/(fields.length+1))*100);
  },[form]);

  const handleChange=(e:any)=>{
    const {name,value,type,checked}=e.target;
    setForm(prev=>({
      ...prev,
      [name]:type==='checkbox'?checked:value
    }));

    if(name==='password'){
      let s=0;
      if(value.length>=8) s++;
      if(/[A-Z]/.test(value)) s++;
      if(/[0-9]/.test(value)) s++;
      setStrength(s);
    }
  };

  const toggleDia=(id:number)=>{
    setForm(prev=>({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(id)
        ? prev.diasSeleccionados.filter(d=>d!==id)
        : [...prev.diasSeleccionados,id]
    }));
  };

  useEffect(()=>{
    const newErrors:any={};
    if(!form.nombre) newErrors.nombre="campo obligatorio";
    if(!form.apellido_paterno) newErrors.apellido_paterno="campo obligatorio";
    if(!form.apellido_materno) newErrors.apellido_materno="campo obligatorio";
    if(!form.email) newErrors.email="campo obligatorio";
    else if(!form.email.endsWith("@uteq.edu.mx")) {
  newErrors.email = "Debe ser un correo institucional (@uteq.edu.mx)";
}
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

  const handleSubmit=async(e:any)=>{
    e.preventDefault();
    if (!form.email.endsWith("@uteq.edu.mx")) {
  alert("Solo se permiten correos institucionales (@uteq.edu.mx)");
  return;
}
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
        return alert(`Error al registrar: ${errorData.message}`);
      }

      setSuccess(true);
      setTimeout(()=>router.push('/login'),2000);

    }catch{
      alert('Error de conexión al registrar');
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
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Tipo de usuario</label>
                <select name="tipo" value={form.tipo} className="auth-select" onChange={handleChange}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input name="nombre" value={form.nombre} className="auth-input" onChange={handleChange}/>
                </div>
                <div className="form-group">
                  <label>Apellido paterno</label>
                  <input name="apellido_paterno" value={form.apellido_paterno} className="auth-input" onChange={handleChange}/>
                </div>
                <div className="form-group">
                  <label>Apellido materno</label>
                  <input name="apellido_materno" value={form.apellido_materno} className="auth-input" onChange={handleChange}/>
                </div>
              </div>

<div className="form-group">
  <label>Correo institucional</label>

  <input
    name="email"
    type="email"
    value={form.email}
    className={`auth-input ${errors.email ? "input-error" : ""}`}
    onChange={handleChange}
  />

  {errors.email && (
    <p className="error-text">{errors.email}</p>
  )}
</div>

              {form.tipo==="estudiante" && (
                <>
                  <div className="form-group">
                    <label>División</label>
                    <select name="division" value={form.division} className="auth-select" onChange={handleChange}>
                      <option value="">Selecciona división</option>
                      {divisiones.map(d=>(<option key={d.id_division} value={d.id_division}>{d.nombre_division}</option>))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Carrera</label>
                    <select name="carrera" value={form.carrera} className="auth-select" onChange={handleChange}>
                      <option value="">Selecciona carrera</option>
                      {carreras.map(c=>(<option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Horario</label>
                <select name="horarioId" value={form.horarioId} className="auth-select" onChange={handleChange}>
                  <option value="">Selecciona horario</option>
                  {horarios.map(h=>(<option key={h.id_horario} value={h.id_horario}>{h.hora_inicio} - {h.hora_fin}</option>))}
                </select>
              </div>

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
                </div>
              )}

              <div className="form-group">
                <label>Contraseña</label>
                <input name="password" type="password" className="auth-input" onChange={handleChange}/>
              </div>

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input name="confirmPassword" type="password" className="auth-input" onChange={handleChange}/>
              </div>

              {/* Modal*/}
              <div className="checkbox-wrapper">
                <input 
                  id="terms" 
                  type="checkbox" 
                  name="terms" 
                  checked={form.terms} 
                  onChange={handleChange}
                />

<label htmlFor="terms">
  Acepto los{" "}
  <span
    onClick={() => setShowTerminos(true)}
    style={{ color: "#00A4E0", cursor: "pointer", fontWeight: "700" }}
  >
    términos y condiciones
  </span>
</label>
              </div>

              <button type="submit" disabled={!formValid} className="btn btn--blue btn--full btn--lg">
                Crear mi cuenta
              </button>
            </form>
          </div>
        ):(<div>Cuenta creada</div>)}

        {/*  MODAL */}
<TerminosModal 
  open={showTerminos} 
  onClose={() => setShowTerminos(false)} 
/>

      </div>
    </div>
  );
}