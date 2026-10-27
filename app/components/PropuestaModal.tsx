'use client';
import { apiFetch } from '../lib/api';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Mail, Send, X } from 'lucide-react';
import AlertModal from './AlertModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Props {
  open: boolean;
  onClose: () => void;
  idInscripcion: number;
  correoDestino: string;
  onSuccess: (disponibles?: number) => void;
}

interface Horario {
  id_horario: number;
  hora_inicio: string;
  hora_fin: string;
}

interface DiaHorario {
  id_dia?: number;
  nombre?: string;
  dia?: {
    id_dia: number;
    nombre: string;
  };
}

export default function PropuestaModal({
  open,
  onClose,
  idInscripcion,
  correoDestino,
  onSuccess
}: Readonly<Props>) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [diasHorario, setDiasHorario] = useState<DiaHorario[]>([]);
  const [horarioId, setHorarioId] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!open) return;

    fetch(`${API_URL}/horarios`)
      .then(r => r.json())
      .then(d => setHorarios(Array.isArray(d) ? d : d?.data || []))
      .catch((error) => {
        console.error('Error cargando horarios:', error);
        setHorarios([]);
      });
  }, [open]);

  useEffect(() => {
    if (!horarioId) {
      setDiasHorario([]);
      return;
    }

    fetch(`${API_URL}/horarios/${horarioId}/dias`)
      .then(async r => {
        if (!r.ok) throw new Error('Error obteniendo dias');
        return r.json();
      })
      .then(data => setDiasHorario(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setDiasHorario([]));
  }, [horarioId]);

  const resetForm = () => {
    setHorarioId('');
    setDiasSeleccionados([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDia = (id: number) => {
    setDiasSeleccionados(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const enviarPropuesta = async () => {
    if (!horarioId || diasSeleccionados.length === 0) {
      setAlertMessage('Selecciona horario y dias.');
      setAlertOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(`${API_URL}/propuestas/propuesta-inscripcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correoDestino,
          id_inscripcion: idInscripcion,
          horarioId,
          dias: diasSeleccionados
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setAlertMessage('Los lugares en este horario han sido cubiertos. Selecciona otro horario o dia.');
        setAlertOpen(true);
        return;
      }

      if (!res.ok) {
        setAlertMessage(data?.message || 'No se pudo enviar la propuesta.');
        setAlertOpen(true);
        return;
      }

      onSuccess(data?.disponibles);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error enviando propuesta:', error);
      setAlertMessage('Error de conexion.');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const canSubmit = Boolean(horarioId && diasSeleccionados.length > 0 && !loading);

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-box--wide proposal-modal">
        <div className="proposal-modal__header">
          <div className="proposal-modal__heading">
            <span className="proposal-modal__icon">
              <Clock size={20} />
            </span>
            <div>
              <h3>Proponer horario</h3>
              <p>Enviar propuesta de cambio</p>
            </div>
          </div>

          <button type="button" className="btn-close" onClick={handleClose} title="Cerrar">
            <X />
          </button>
        </div>

        <div className="proposal-modal__body">
          <div className="proposal-modal__recipient">
            <span className="proposal-modal__recipient-label">Destino</span>
            <span className="proposal-modal__recipient-value">
              <Mail size={15} />
              {correoDestino}
            </span>
          </div>

          <div className="proposal-modal__field">
            <label htmlFor="horarioId">
              <Clock size={14} />
              Horario
            </label>
            <select
              id="horarioId"
              className="select proposal-modal__select"
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
                  {h.hora_inicio?.substring(0, 5)} - {h.hora_fin?.substring(0, 5)}
                </option>
              ))}
            </select>
          </div>

          {horarioId && (
            <div className="proposal-modal__field">
              <div className="proposal-modal__label-row">
                <span className="input-label">
                  <CalendarDays size={14} />
                  Dias disponibles
                </span>
                <span>{diasSeleccionados.length} seleccionados</span>
              </div>

              <div className="proposal-modal__days">
                {diasHorario.length === 0 ? (
                  <p className="proposal-modal__empty">No hay dias disponibles.</p>
                ) : (
                  diasHorario.map(d => {
                    const id = d.id_dia ?? d.dia?.id_dia;
                    const nombre = d.nombre ?? d.dia?.nombre;
                    if (!id || !nombre) return null;

                    return (
                      <button
                        key={id}
                        type="button"
                        className={`proposal-modal__day ${diasSeleccionados.includes(id) ? 'is-selected' : ''}`}
                        onClick={() => toggleDia(id)}
                      >
                        {nombre}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="proposal-modal__footer">
          <button type="button" className="btn btn--outline" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--blue"
            onClick={enviarPropuesta}
            disabled={!canSubmit}
          >
            <Send size={16} />
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
