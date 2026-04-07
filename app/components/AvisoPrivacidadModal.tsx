"use client";

import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AvisoPrivacidadModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay">

      <div className="modal-box modal-box--wide">

        {/* BOTÓN CERRAR */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h3>Aviso de Privacidad</h3>
            <p>Protección y uso de tus datos personales</p>
          </div>
        </div>

        {/* BODY */}
        <div className="modal-body text-sm space-y-3">

          <p>
            En cumplimiento a la Ley Federal de Protección de Datos Personales 
            en Posesión de los Particulares, SchedMaster informa sobre el uso 
            y protección de los datos personales.
          </p>

          <p>
            <strong>Datos recabados:</strong> nombre, matrícula, carrera, 
            cuatrimestre, correo institucional y contraseña.
          </p>

          <p>
            <strong>Finalidad:</strong> registro de usuarios, control de aforo, 
            reservas de gimnasio y envío de notificaciones.
          </p>

          <p>
            <strong>Protección:</strong> la información se resguarda con medidas 
            de seguridad y cifrado para evitar accesos no autorizados.
          </p>

          <p>
            <strong>Derechos ARCO:</strong> puedes acceder, rectificar, cancelar 
            u oponerte al uso de tus datos.
          </p>

          <p>
            Los datos no serán utilizados con fines comerciales.
          </p>

        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn--blue"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}