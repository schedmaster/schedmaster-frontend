'use client';

import { useEffect, useState } from 'react';
import { X, Send, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  correo: string;
  onPropuestaEnviada: () => void;
}

export default function PropuestaModal({ isOpen, onClose, correo }: Props) {

  const [horarios,setHorarios] = useState<any[]>([]);
  const [diasHorario,setDiasHorario] = useState<any[]>([]);
  const [horarioId,setHorarioId] = useState('');
  const [diasSeleccionados,setDiasSeleccionados] = useState<number[]>([]);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{

    if(!isOpen) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios`)
      .then(r=>r.json())
      .then(d=>setHorarios(Array.isArray(d)?d:d?.data||[]))
      .catch(()=>setHorarios([]));

  },[isOpen]);


  useEffect(()=>{

    if(!horarioId){
      setDiasHorario([]);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/horarios/${horarioId}/dias`)
      .then(r=>r.json())
      .then(setDiasHorario)
      .catch(()=>setDiasHorario([]));

  },[horarioId]);


  const toggleDia=(id:number)=>{

    setDiasSeleccionados(prev=>
      prev.includes(id)
        ? prev.filter(d=>d!==id)
        : [...prev,id]
    );

  };


  const enviarPropuesta = async () => {

    if(!horarioId || diasSeleccionados.length===0){
      alert("Selecciona horario y días");
      return;
    }

    setLoading(true);

    try{

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/propuesta-inscripcion`,
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            correo,
            horarioId,
            dias:diasSeleccionados
          })
        }
      );

      if(res.ok){

        alert("Propuesta enviada al correo");

        onClose();

        setHorarioId('');
        setDiasSeleccionados([]);

      }else{

        alert("Error enviando propuesta");

      }

    }catch(e){

      alert("Error de conexión");

    }

    setLoading(false);

  };


  if(!isOpen) return null;

  return(

    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>

      <div className="modal-box modal-box--wide">

        <div className="modal-header">

          <div>

            <div className="log-title-row">
              <Clock size={20}/>
              <h3>Proponer horario</h3>
            </div>

            <p className="muted">
              Enviar propuesta a {correo}
            </p>

          </div>

          <button className="btn-close" onClick={onClose}>
            <X/>
          </button>

        </div>


        <div className="modal-body">

          <div className="form-group">

            <label>Horario</label>

            <select
              className="select"
              value={horarioId}
              onChange={(e)=>{
                setHorarioId(e.target.value);
                setDiasSeleccionados([]);
              }}
            >

              <option value="">Selecciona horario</option>

              {horarios.map(h=>(
                <option key={h.id_horario} value={h.id_horario}>
                  {h.hora_inicio} - {h.hora_fin}
                </option>
              ))}

            </select>

          </div>


          {horarioId && (

            <div className="form-group">

              <label>Días disponibles</label>

              <div className="dias-container">

                {diasHorario.map(d=>(

                  <button
                    key={d.id_dia}
                    type="button"
                    className={`dia-btn ${diasSeleccionados.includes(d.id_dia) ? 'active' : ''}`}
                    onClick={()=>toggleDia(d.id_dia)}
                  >
                    {d.nombre}
                  </button>

                ))}

              </div>

            </div>

          )}

        </div>


        <div className="log-compose-actions">

          <button
            className="btn btn--blue"
            onClick={enviarPropuesta}
            disabled={loading}
          >
            <Send size={16}/>
            {loading ? "Enviando..." : "Enviar propuesta"}
          </button>

        </div>

      </div>

    </div>

  );


}