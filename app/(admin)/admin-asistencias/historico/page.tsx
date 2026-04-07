'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Eye } from 'lucide-react'
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

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const cargarHistorico = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/asistencias/historico')

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

  const formatDate = (date: string) => {
    if (!date) return "-"
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <div className="app">
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">
          <header className="section-header">
            <div>
              <h2>Histórico de Asistencias</h2>
              <p>Consulta listas físicas digitalizadas</p>
            </div>
            <button
              className="btn btn--outline"
              onClick={() => router.push('/admin-asistencias')}
            >
              <ArrowLeft size={16} /> Regresar
            </button>
          </header>

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