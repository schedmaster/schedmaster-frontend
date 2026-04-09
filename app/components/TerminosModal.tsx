"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TerminosModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay">

      <div className="modal-box modal-box--wide">

        {/* Cerrar */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h3>Términos y Condiciones</h3>
            <p>Uso del sistema SchedMaster</p>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body text-sm space-y-3">

          <p>
            Al registrarte en la plataforma SchedMaster, aceptas los siguientes términos y condiciones:
          </p>

          <p><strong>1. Uso del sistema:</strong> El usuario se compromete a utilizar la plataforma únicamente con fines académicos.</p>

          <p><strong>2. Registro de información:</strong> El usuario deberá proporcionar información verídica y actualizada.</p>

          <p><strong>3. Cuenta y seguridad:</strong> El usuario es responsable de su contraseña y uso de su cuenta.</p>

          <p><strong>4. Reservas:</strong> El usuario deberá respetar los horarios seleccionados.</p>

          <p><strong>5. Uso adecuado:</strong> Queda prohibido el uso indebido del sistema.</p>

          <p><strong>6. Disponibilidad:</strong> El sistema puede tener interrupciones por mantenimiento.</p>

          <p><strong>7. Modificaciones:</strong> SchedMaster puede actualizar estos términos.</p>

          <p><strong>8. Aceptación:</strong> Al registrarte, aceptas estos términos y condiciones.</p>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn--blue">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}