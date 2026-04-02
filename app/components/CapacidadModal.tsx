'use client';

import { X, AlertTriangle, Ban } from 'lucide-react';

interface CapacidadModalProps {
  open: boolean;
  disponibles: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CapacidadModal({
  open,
  disponibles,
  onConfirm,
  onCancel,
}: CapacidadModalProps) {

  if (!open) return null;

  const lleno = disponibles <= 0;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-box">

        <button className="modal-close" onClick={onCancel} aria-label="Cerrar">
          <X size={20} />
        </button>

        {lleno ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
              <Ban size={22} />
              <h2 style={{ margin: 0 }}>Horario sin lugares</h2>
            </div>

            <p className="muted" style={{ marginTop: 12 }}>
              Los lugares en este horario y día han sido cubiertos.
              No es posible aprobar ni enviar propuestas para esta combinación.
            </p>

            <div className="modal-actions">
              <button className="btn btn--red" onClick={onCancel}>
                Entendido
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--yellow, #ca8a04)' }}>
              <AlertTriangle size={22} />
              <h2 style={{ margin: 0 }}>Cupo casi lleno</h2>
            </div>

            <p className="muted" style={{ marginTop: 12 }}>
              Solo quedan <strong>{disponibles} lugar{disponibles !== 1 ? 'es' : ''}</strong> disponibles
              en este horario y día. ¿Deseas continuar?
            </p>

            <div className="modal-actions">
              <button className="btn btn--gray" onClick={onCancel}>
                Cancelar
              </button>
              <button className="btn btn--blue" onClick={onConfirm}>
                Sí, continuar
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}