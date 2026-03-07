'use client';

import { X } from 'lucide-react';

interface AlertModalProps {
  open: boolean
  title?: string
  message: string
  buttonText?: string
  onClose: () => void
}

export default function AlertModal({
  open,
  title = "Mensaje",
  message,
  buttonText = "Aceptar",
  onClose
}: AlertModalProps){

  if(!open) return null

  return(

    <div
      className="modal-overlay"
      onClick={(e)=> e.target === e.currentTarget && onClose()}
    >

      <div className="modal-box">

        <button
          className="modal-close"
          onClick={onClose}
        >
          <X size={20}/>
        </button>

        <h2>{title}</h2>

        <p className="muted">
          {message}
        </p>

        <div
          style={{
            marginTop:"20px",
            display:"flex",
            justifyContent:"flex-end"
          }}
        >

          <button
            className="btn btn--blue"
            onClick={onClose}
          >
            {buttonText}
          </button>

        </div>

      </div>

    </div>

  )
}