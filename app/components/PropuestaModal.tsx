'use client';

import { useEffect, useState } from 'react';
import { X, Send, Clock } from 'lucide-react';
import AlertModal from './AlertModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Props {
  open: boolean;
  onClose: () => void;
  idInscripcion: number;
  correoDestino: string;
  onSuccess: (disponibles?: number) => void;
}

export default function PropuestaModal({ open, onClose, idInscripcion, correoDestino, onSuccess }: Props) {

  const [horarios, setHorarios]                   = useState<any[]>([]);
  const [diasHorario, setDiasHorario]             = useState<any[]>([]);
  const [horarioId, setHorarioId]                 = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [loading, setLoading]                     = useState(false);
  const [alertOpen, setAlertOpen]                 = useState(false);
  const [alertMessage, setAlertMessage]           = useState('');

  // Cargar horarios
  useEffect(() => {
    if (!open) return;
    fetch(`${API_URL}/horarios`)
      .then(r => r.json())
      .then(d => setHorarios(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setHorarios([]));
  }, [open]);

  // Cargar días del horario seleccionado
  useEffect(() => {
    if (!horarioId) { setDiasHorario([]); return; }
    fetch(`${API_URL}/horarios/${horarioId}/dias`)
      .then(async r => {
        if (!r.ok) throw new Error('Error obteniendo días');
        return r.json();
      })
      .then(data => setDiasHorario(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setDiasHorario([]));
  }, [horarioId]);

  const toggleDia = (id: number) => {
    setDiasSeleccionados(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setHorarioId('');
    setDiasSeleccionados([]);
  };

  const enviarPropuesta = async () => {
    if (!horarioId || diasSeleccionados.length === 0) {
      setAlertMessage('Selecciona horario y días.');
      setAlertOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/propuestas/propuesta-inscripcion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            correo: correoDestino, 
            id_inscripcion: idInscripcion, 
            horarioId, 
            dias: diasSeleccionados 
          })
        }
      );

      const data = await res.json();

      if (res.status === 409) {
        // Horario lleno — mostrar aviso dentro del modal y no cerrar
        setAlertMessage('Los lugares en este horario han sido cubiertos. Selecciona otro horario o día.');
        setAlertOpen(true);
        return;
      }

      if (!res.ok) {
        setAlertMessage(data?.message || 'Error enviando propuesta.');
        setAlertOpen(true);
        return;
      }

      // Éxito — cerrar y notificar con disponibles
      onClose();
      resetForm();
      onSuccess(data.disponibles);

    } catch {
      setAlertMessage('Error de conexión.');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box modal-box--wide">

        <div className="modal-header">
          <div>
            <div className="log-title-row">
              <Clock size={20}/>
              <h3>Proponer horario</h3>
            </div>
            <p className="muted">Enviar propuesta a {correoDestino}</p>
          </div>
          <button className="btn-close" onClick={onClose} title="Cerrar">
            <X/>
          </button>
        </div>

        <div className="modal-body">

          <div className="form-group">
            <label>Horario</label>
            <select
              className="select"
              aria-label="Selecciona horario"
              value={horarioId}
              onChange={e => {
                setHorarioId(e.target.value);
                setDiasSeleccionados([]);
              }}
            >
              <option value="">Selecciona horario</option>
              {horarios.map(h => (
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
                {diasHorario.map(d => {
                  const id   = d.id_dia  ?? d.dia?.id_dia;
                  const nombre = d.nombre ?? d.dia?.nombre;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`dia-btn ${diasSeleccionados.includes(id) ? 'active' : ''}`}
                      onClick={() => toggleDia(id)}
                    >
                      {nombre}
                    </button>
                  );
                })}
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
            {loading ? 'Enviando...' : 'Enviar propuesta'}
          </button>
        </div>

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