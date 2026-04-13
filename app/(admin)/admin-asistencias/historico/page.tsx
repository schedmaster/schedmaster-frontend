'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, CheckCircle, Eye, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../../../components/AdminSidebar'
import AlertModal from "../../../components/AlertModal"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'


interface ArchivoHistorico {
  id_historico: number
  nombre_archivo: string
  ruta_archivo: string
  fecha_lista: string
  fecha_subida: string
}

export default function HistoricoAsistenciasPage() {
  const router = useRouter()

  const [archivos, setArchivos] = useState<ArchivoHistorico[]>([])
  const [archivo, setArchivo] = useState<File | null>(null)
  const [fecha, setFecha] = useState("")
  const [searchQuery, setSearchQuery] = useState('')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  /* ==========================
     CARGAR HISTORICO
  ========================== */
  const cargarHistorico = async (query = '') => {
    try {
      const term = query.trim()
      const endpoint = term
        ? `${API_URL}/api/asistencias/historico?q=${encodeURIComponent(term)}`
        : `${API_URL}/api/asistencias/historico`

      const res = await fetch(endpoint)
      
      if (!res.ok) throw new Error("Error en la respuesta del servidor")
      
      const data = await res.json()
      setArchivos(data)
    } catch (error) {
      console.error(error)
      setAlertMessage("Error cargando histórico")
      setAlertOpen(true)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarHistorico(searchQuery)
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    cargarHistorico('')
  }, [])

  /* ==========================
     SUBIR ARCHIVO
  ========================== */
  const handleSubir = async () => {
    if (!archivo || !fecha) {
      setAlertMessage("Selecciona archivo y fecha")
      setAlertOpen(true)
      return
    }

    const formData = new FormData()
    formData.append("archivo", archivo)
    formData.append("fecha", fecha)
    formData.append("id_usuario", "1") // Aquí asume el ID 1 del Admin

    try {
      const res = await fetch(`${API_URL}/api/asistencias/upload-and-hash`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()
      
      if (res.ok) {
        setAlertMessage("Archivo subido con éxito")
      } else {
        setAlertMessage(data.message || "Error al subir")
      }
      
      setAlertOpen(true)
      setArchivo(null)
      setFecha("")
      cargarHistorico(searchQuery)
    } catch (error) {
      console.error(error)
      setAlertMessage("Error subiendo archivo")
      setAlertOpen(true)
    }
  }

  /* ==========================
     FORMATEAR FECHA
  ========================== */
  const formatDate = (date: string) => {
    if (!date) return "-"
    // Aseguramos que la fecha no se desfase por la zona horaria al mostrarla
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <div className="app app--admin-attendance-history">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">
          <header className="section-header">
            <div>
              <h2>Histórico de Asistencias</h2>
              <p>Sube y consulta listas físicas digitalizadas</p>
            </div>
            <button
              className="btn btn--outline"
              onClick={() => router.push('/admin-asistencias')}
            >
              <ArrowLeft size={16} /> Regresar
            </button>
          </header>

          {/* CONTROLES */}
          <div className="controls-container">
            <label htmlFor="archivoHistorico" className="btn btn--blue btn-label">
              <Upload size={18} /> Seleccionar archivo
            </label>

            <input
              type="file"
              id="archivoHistorico"
              hidden
              className="hidden-input"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setArchivo(file)
              }}
            />

            <input
              type="date"
              className="form-select"
              placeholder="Selecciona una fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />

            <button
              className="btn btn--yellow"
              onClick={handleSubir}
              disabled={!archivo || !fecha}
            >
              Subir lista
            </button>
          </div>

          {/* ARCHIVO SELECCIONADO */}
          {archivo && (
            <div className="row-card">
              <div className="row-info">
                <span className="row-name row-name-flex">
                  <CheckCircle size={16} color="green" /> Archivo seleccionado
                </span>
                <span className="row-sub muted">
                  {archivo.name}
                </span>
              </div>
            </div>
          )}

          <section className="filter-bar">
            <div className="field">
              <Search />
              <input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          {/* TABLA */}
          <section className="table-area">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha lista</th>
                    <th>Archivo</th>
                    <th>Fecha subida</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {archivos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted empty-state">
                        No hay archivos registrados
                      </td>
                    </tr>
                  ) : (
                    archivos.map((a, index) => (
                      <tr key={`${a.id_historico}-${index}`}>
                        <td className="muted">{formatDate(a.fecha_lista)}</td>
                        <td>{a.nombre_archivo}</td>
                        <td className="muted">{formatDate(a.fecha_subida)}</td>
                        <td>
                          <button
                            className="btn-icon btn-icon--cyan"
                            title="Ver documento"
                            onClick={() => {
                              window.open(`${API_URL}/${a.ruta_archivo}`, "_blank")
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      <AlertModal
        open={alertOpen}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  )
}