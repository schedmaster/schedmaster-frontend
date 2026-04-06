'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Send, ClipboardList } from 'lucide-react';

export interface Comentario {
  id: number;
  autorNombre: string;
  autorIniciales: string;
  fecha: string;
  texto: string;
}

interface BitacoraProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioNombre: string;
  usuarioId: number;
  comentariosIniciales?: Comentario[];
  onNuevoComentario?: (usuarioId: number, texto: string) => void;
}

const AVATAR_COLORS = ['ac1','ac2','ac3','ac4','ac5','ac6','ac7','ac8'] as const;
const getAvatarClass = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function Bitacora({
  isOpen, onClose, usuarioNombre, usuarioId,
  comentariosIniciales = [], onNuevoComentario,
}: BitacoraProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(comentariosIniciales);
  const [nuevoTexto,  setNuevoTexto]  = useState('');
  const [sortOrder,   setSortOrder]   = useState<'reciente' | 'lejano'>('reciente');

  // ✅ FIX: sincronizar cuando el page cargue los comentarios desde la BD
  useEffect(() => {
    setComentarios(comentariosIniciales);
  }, [comentariosIniciales]);

  // ✅ FIX: limpiar texto al cerrar/cambiar usuario
  useEffect(() => {
    if (!isOpen) setNuevoTexto('');
  }, [isOpen]);

  const comentariosOrdenados = useMemo(() =>
    [...comentarios].sort((a, b) => {
      const diff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      return sortOrder === 'reciente' ? diff : -diff;
    }), [comentarios, sortOrder]);

  const handleEnviar = () => {
    const texto = nuevoTexto.trim();
    if (!texto) return;
    if (onNuevoComentario) {
      onNuevoComentario(usuarioId, texto);
    } else {
      setComentarios(prev => [{
        id: Date.now(), autorNombre: 'Admin UTEQ',
        autorIniciales: 'AU', fecha: new Date().toISOString(), texto,
      }, ...prev]);
    }
    setNuevoTexto('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="modal-box modal-box--wide log-modal">

        <div className="modal-header">
          <div>
            <div className="log-title-row">
              <ClipboardList size={20} />
              <h3>Bitácora</h3>
            </div>
            <p>{usuarioNombre}</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar"><X /></button>
        </div>

        <div className="log-filter-bar">
          <span className="log-filter-label">Ordenar por</span>
          <select className="select log-filter-select" value={sortOrder}
            aria-label="Ordenar comentarios por fecha"
            onChange={e => setSortOrder(e.target.value as 'reciente' | 'lejano')}>
            <option value="reciente">Fecha más reciente</option>
            <option value="lejano">Fecha más lejana</option>
          </select>
          <span className="log-count muted">
            {comentarios.length} {comentarios.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="log-list">
          {comentariosOrdenados.length === 0 ? (
            <div className="log-empty">
              <ClipboardList size={36} />
              <p className="log-empty-title">Sin registros aún</p>
              <p className="log-empty-desc">Agrega el primer comentario de esta bitácora</p>
            </div>
          ) : comentariosOrdenados.map((c, idx) => (
            <div key={c.id} className="log-entry">
              <div className={`log-entry-avatar ${getAvatarClass(idx)}`}>{c.autorIniciales}</div>
              <div className="log-entry-body">
                <div className="log-entry-meta">
                  <span className="log-entry-author">{c.autorNombre}</span>
                  <span className="log-entry-date muted">{formatFecha(c.fecha)}</span>
                </div>
                <p className="log-entry-text">{c.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="log-compose">
          <textarea className="form-textarea log-textarea"
            placeholder="Escribe un comentario… (Ctrl+Enter para enviar)"
            value={nuevoTexto}
            onChange={e => setNuevoTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleEnviar(); } }}
            rows={3}
          />
          <div className="log-compose-actions">
            <span className="log-hint muted">Ctrl+Enter para enviar</span>
            <button className="btn btn--blue" onClick={handleEnviar} disabled={!nuevoTexto.trim()}>
              <Send size={16} /> Enviar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}