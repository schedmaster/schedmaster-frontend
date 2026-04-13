'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, CheckCircle, Eye, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../../../components/AdminSidebar'
import AlertModal from "../../../components/AlertModal"

// Igual que las demás páginas admin — sin /api duplicado
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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
  const [loading, setLoading] = useState(false)

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  /* ── CARGAR HISTORICO ─────────────────────────────────────── */
  const cargarHistorico = async (query = '') => {
    try {
      const term = query.trim()
      // Usa el mismo patrón que asistencias: ${API_URL}/asistencias/...
      const endpoint = term
        ? `${API_URL}/asistencias/historico?q=${encodeURIComponent(term)}`
        : `${API_URL}/asistencias/historico`

      const res = await fetch(endpoint)

      if (!res.ok) {
        // Intenta leer el mensaje del backend antes de mostrar error genérico
        const errorData = await res.json().catch(() => null)
        const msg = errorData?.message || `Error ${res.status}: ${res.statusText}`
        setAlertMessage(msg)
        setAlertOpen(true)
        return
      }

      const data = await res.json()
      setArchivos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setAlertMessage("No se pudo conectar con el servidor")
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

  /* ── SUBIR ARCHIVO ───────────────────────────────────────── */
  const handleSubir = async () => {
    if (!archivo || !fecha) {
      setAlertMessage("Selecciona un archivo y una fecha")
      setAlertOpen(true)
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("archivo", archivo)
    formData.append("fecha", fecha)
    formData.append("id_usuario", "1")

    try {
      // Mismo patrón: sin /api duplicado
      const res = await fetch(`${API_URL}/asistencias/upload-and-hash`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setAlertMessage("Archivo subido con éxito")
        setArchivo(null)
        setFecha("")
        cargarHistorico(searchQuery)
      } else {
        setAlertMessage(data.message || "Error al subir el archivo")
      }
    } catch (error) {
      console.error(error)
      setAlertMessage("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
      setAlertOpen(true)
    }
  }

  /* ── FORMATEAR FECHA ─────────────────────────────────────── */
  const formatDate = (date: string) => {
    if (!date) return "-"
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

          {/* ── CONTROLES DE SUBIDA ─────────────────────────────── */}
          <div className="controls-container">
            <label htmlFor="archivoHistorico" className="btn btn--blue btn-label">
              <Upload size={18} /> Seleccionar archivo
            </label>
            <input
              type="file"
              id="archivoHistorico"
              hidden
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />

            <input
              type="date"
              className="form-select"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />

            <button
              className="btn btn--yellow"
              onClick={handleSubir}
              disabled={!archivo || !fecha || loading}
            >
              {loading ? 'Subiendo...' : 'Subir lista'}
            </button>
          </div>

          {/* ── ARCHIVO SELECCIONADO ─────────────────────────────── */}
          {archivo && (
            <div className="row-card">
              <div className="row-info">
                <span className="row-name row-name-flex">
                  <CheckCircle size={16} color="green" /> Archivo seleccionado
                </span>
                <span className="row-sub muted">{archivo.name}</span>
              </div>
            </div>
          )}

          {/* ── BUSCADOR ─────────────────────────────────────────── */}
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

          {/* ── TABLA ────────────────────────────────────────────── */}
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
                              // Construye la URL correcta para ver el archivo
                              const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
                              window.open(`${base}/${a.ruta_archivo}`, "_blank")
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