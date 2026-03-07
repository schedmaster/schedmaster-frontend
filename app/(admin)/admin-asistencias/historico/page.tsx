'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, CheckCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../components/AdminSidebar';
import AlertModal from "../../../components/AlertModal";

interface ArchivoHistorico {
  id:number
  archivo:string
  fecha:string
  fecha_subida:string
  hash:string
  subidoPor:string
  ruta_archivo:string
}

export default function HistoricoAsistenciasPage(){

  const router = useRouter()

  const [archivos,setArchivos] = useState<ArchivoHistorico[]>([])
  const [archivo,setArchivo] = useState<File | null>(null)
  const [fecha,setFecha] = useState('')

  const [alertOpen,setAlertOpen] = useState(false)
  const [alertMessage,setAlertMessage] = useState("")

  /* ==========================
     CARGAR HISTÓRICO
  ========================== */

  const cargarHistorico = async () => {

    try{

      const res = await fetch("http://localhost:3001/api/admin-asistencia/historico")

      const data = await res.json()

      setArchivos(data)

    }catch(error){

      console.error("Error cargando histórico:",error)

      setAlertMessage("Error cargando el histórico de archivos")
      setAlertOpen(true)

    }

  }

  useEffect(()=>{

    cargarHistorico()

  },[])

  /* ==========================
     SUBIR ARCHIVO
  ========================== */

  const handleSubir = async () => {

    if(!archivo || !fecha){

      setAlertMessage("Selecciona un archivo y una fecha")
      setAlertOpen(true)
      return

    }

    const formData = new FormData()

    formData.append("archivo",archivo)
    formData.append("fecha",fecha)
    formData.append("id_usuario","1")

    try{

      const res = await fetch(
        "http://localhost:3001/api/admin-asistencia/upload-and-hash",
        {
          method:"POST",
          body:formData
        }
      )

      const data = await res.json()

      setAlertMessage(data.message || "Operación realizada")
      setAlertOpen(true)

      setArchivo(null)
      setFecha('')

      cargarHistorico()

    }catch(error){

      console.error(error)

      setAlertMessage("Error al subir el archivo")
      setAlertOpen(true)

    }

  }

  /* ==========================
     FORMATO FECHA
  ========================== */

  const formatDate = (date:string)=>{
    if(!date) return "-"
    return new Date(date).toLocaleDateString("es-MX")
  }

  return(

    <div className="app">

      <AdminSidebar onLogout={()=>console.log('logout')}/>

      <main className="main">
        <div className="main-inner">

          {/* HEADER */}

          <header className="section-header">

            <div>
              <h2>Histórico de Asistencias</h2>
              <p>Sube y consulta listas físicas digitalizadas</p>
            </div>

            <button
              className="btn btn--outline"
              onClick={()=>router.push('/admin-asistencias')}
            >
              <ArrowLeft size={16}/> Regresar
            </button>

          </header>

          {/* SUBIR ARCHIVO */}

          <div
            className="filter-bar"
            style={{
              display:"flex",
              gap:"12px",
              alignItems:"center",
              flexWrap:"nowrap"
            }}
          >

            <input
              type="file"
              id="archivoHistorico"
              style={{display:'none'}}
              onChange={(e)=>{
                const file = e.target.files?.[0] || null
                setArchivo(file)
              }}
            />

            <label htmlFor="archivoHistorico" className="btn btn--blue">
              <Upload size={18}/> Seleccionar archivo
            </label>

            <input
              type="date"
              className="form-select"
              style={{width:"180px"}}
              value={fecha}
              onChange={(e)=>setFecha(e.target.value)}
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

                <span className="row-name">
                  <CheckCircle size={16}/> Archivo seleccionado
                </span>

                <span className="row-sub muted">
                  {archivo.name} · Solo falta agregar la fecha
                </span>

              </div>

            </div>

          )}

          {/* TABLA HISTÓRICO */}

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
                      <td colSpan={4} className="muted">
                        No hay archivos registrados
                      </td>
                    </tr>

                  ) : (

                    archivos.map((a)=>(

                      <tr key={a.id}>

                        <td className="muted">
                          {formatDate(a.fecha)}
                        </td>

                        <td>
                          {a.archivo}
                        </td>

                        <td className="muted">
                          {formatDate(a.fecha_subida)}
                        </td>

                        <td>

                          <div className="row-actions">

                            <button
                              className="btn-icon btn-icon--cyan"
                              title="Ver archivo"
                              onClick={()=>{
                                window.open(
                                  `http://localhost:3001/${a.ruta_archivo}`,
                                  "_blank"
                                )
                              }}
                            >
                              <Eye size={14}/>
                            </button>

                          </div>

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

      {/* MODAL ALERTA */}

      <AlertModal
        open={alertOpen}
        message={alertMessage}
        onClose={()=>setAlertOpen(false)}
      />

    </div>

  )

}