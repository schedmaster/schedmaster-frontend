'use client';

import { useState } from 'react';
import AlertModal from './AlertModal';

const HorarioForm = () => {
  const [formData, setFormData] = useState({
    id_periodo: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_actividad: '',
    capacidad_maxima: '',
    dias: [] as number[]
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idDia = parseInt(e.target.value);
    if (e.target.checked) {
      setFormData({ ...formData, dias: [...formData.dias, idDia] });
    } else {
      setFormData({ ...formData, dias: formData.dias.filter(dia => dia !== idDia) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/horarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setAlertMessage('Horario creado con éxito en la base de datos.');
        setAlertOpen(true);
      } else {
        setAlertMessage('Hubo un error al guardar el horario.');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setAlertMessage('No se pudo conectar con el servidor.');
      setAlertOpen(true);
    }
  };

  return (
    <div className="horario-form-container">
      <form onSubmit={handleSubmit} className="horario-form">
        
        <div className="form-group">
          <label>ID del Periodo</label>
          <input type="number" name="id_periodo" placeholder="Ej. 1" onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Hora Inicio</label>
            <input type="time" name="hora_inicio" onChange={handleChange} required step="1" title="Hora de inicio" />
          </div>
          <div className="form-group half-width">
            <label>Hora Fin</label>
            <input type="time" name="hora_fin" onChange={handleChange} required step="1" title="Hora de fin" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Tipo de Actividad</label>
            <input type="text" name="tipo_actividad" placeholder="Ej. Crossfit" onChange={handleChange} required />
          </div>
          <div className="form-group half-width">
            <label>Capacidad Máxima</label>
            <input type="number" name="capacidad_maxima" placeholder="Ej. 20" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Días de la semana</label>
          <div className="checkbox-group">
            <label className="checkbox-label"><input type="checkbox" value="1" onChange={handleDiaChange} /> Lunes</label>
            <label className="checkbox-label"><input type="checkbox" value="2" onChange={handleDiaChange} /> Martes</label>
            <label className="checkbox-label"><input type="checkbox" value="3" onChange={handleDiaChange} /> Miércoles</label>
            <label className="checkbox-label"><input type="checkbox" value="4" onChange={handleDiaChange} /> Jueves</label>
            <label className="checkbox-label"><input type="checkbox" value="5" onChange={handleDiaChange} /> Viernes</label>
          </div>
        </div>

        <button type="submit" className="btn-submit">
          Guardar Horario
        </button>

      </form>

      <AlertModal
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
};

export default HorarioForm;