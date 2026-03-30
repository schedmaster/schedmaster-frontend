'use client';

import { useEffect, useState } from 'react';
import { X, Send, Clock } from 'lucide-react';
import AlertModal from './AlertModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  correo: string;
  onPropuestaEnviada: () => void;
}

export default function PropuestaModal({ isOpen, onClose, correo, onPropuestaEnviada }: Props) {

  const [horarios, setHorarios] = useState<any[]>([]);
  const [diasHorario, setDiasHorario] = useState<any[]>([]);
  const [horarioId, setHorarioId] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 1. Cargar horarios (Ruta directa)
  useEffect(() => {
    if (!isOpen) return;

    fetch(`http://localhost:3001/api/horarios`)
      .then(r => r.json())
      .then(d => setHorarios(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setHorarios([]));
  }, [isOpen]);

  // 2. Cargar días (Ruta directa)
  useEffect(() => {
    if (!horarioId) {
      setDiasHorario([]);
      return;
    }

    fetch(`http://localhost:3001/api/horarios/${horarioId}/dias`)
      .then(async (r) => {
        // Si el backend responde con error HTML, lo atrapamos aquí
        if (!r.ok && r.headers.get("content-type")?.includes("text/html")) {
            throw new Error("El backend respondió con una página HTML (Posible ruta no encontrada 404)");
        }
        return r.json();
      })
      .then(data => {
        const diasListos = Array.isArray(data) ? data : (data?.data || []);
        setDiasHorario(diasListos);
      })
      .catch((error) => {
        console.error("Error obteniendo días:", error);
        setDiasHorario([]);
      });
  }, [horarioId]);

  const toggleDia = (id: number) => {
    setDiasSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  // 3. Enviar propuesta (Ruta directa)
  const enviarPropuesta = async () => {
    if (!horarioId || diasSeleccionados.length === 0) {
      setAlertMessage('Selecciona horario y días.');
      setAlertOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/api/propuestas/propuesta-inscripcion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo,
            horarioId,
            dias: diasSeleccionados
          })
        }
      );

      if (res.ok) {
        setAlertMessage('Propuesta enviada al correo.');
        setAlertOpen(true);
        onClose();
        setHorarioId('');
        setDiasSeleccionados([]);
        onPropuestaEnviada(); 
      } else {
        setAlertMessage('Error enviando propuesta.');
        setAlertOpen(true);
      }
    } catch (e) {
      setAlertMessage('Error de conexión.');
      setAlertOpen(true);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-box--wide">
        <div className="modal-header">
          <div>
            <div className="log-title-row">
              <Clock size={20} />
              <h3>Proponer horario</h3>
            </div>
            <p className="muted">
              Enviar propuesta a {correo}
            </p>
          </div>
          <button className="btn-close" onClick={onClose} title="Cerrar">
            <X />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Horario</label>
            <select
              className="select"
              aria-label="Selecciona horario"
              value={horarioId}
              onChange={(e) => {
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
                {diasHorario.map(d => (
                  <button
                    key={d.id_dia || d.dia?.id_dia} 
                    type="button"
                    className={`dia-btn ${diasSeleccionados.includes(d.id_dia || d.dia?.id_dia) ? 'active' : ''}`}
                    onClick={() => toggleDia(d.id_dia || d.dia?.id_dia)}
                  >
                    {d.nombre || d.dia?.nombre}
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
            <Send size={16} />
            {loading ? "Enviando..." : "Enviar propuesta"}
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