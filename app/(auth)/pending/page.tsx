'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LogOut,
  Info,
  Clock,
  LifeBuoy,
  ChevronDown,
  Mail,
  Phone,
  Check
} from 'lucide-react';

export default function PendingAccountPage() {

  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [propuesta, setPropuesta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const aceptarPropuesta = async () => {

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/aceptar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_propuesta: propuesta.id_propuesta
          })
        }
      );

      if (res.ok) {
  alert("Propuesta aceptada correctamente. Por favor, inicia sesión nuevamente.");
  localStorage.removeItem("user"); // limpia el usuario para forzar login
  router.push("/login"); // redirige al login
} else {

        alert("No se pudo aceptar la propuesta");

      }

    } catch (err) {

      console.error(err);
      alert("Error de conexión");

    }

  };

  // 🔹 Obtener usuario desde localStorage
  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!storedUser?.id_usuario) {
      router.push("/login");
      return;
    }

    setUser(storedUser);

  }, []);

  // 🔹 Consultar propuesta del usuario
  useEffect(() => {

    if (!user?.id_usuario) return;

    const fetchPropuesta = async () => {

      try {

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/propuestas/usuario/${user.id_usuario}`
        );

        const data = await res.json();

        if (data) {
          setPropuesta(data);
        }

      } catch (error) {

        console.error("Error obteniendo propuesta", error);

      } finally {

        setLoading(false);

      }

    };

    fetchPropuesta();

  }, [user]);

  return (
    <div className="page">

      <div className="wrap">

        <div className="top">
          <div className="brand">SCHEDMASTER</div>
        </div>

        <section className="card">

          {/* 🔹 SI HAY PROPUESTA */}

          {!loading && propuesta && (

            <>

              <div className="hero">

                <div className="state">
                  <Info />
                </div>

                <div>

                  <h1 className="title">
                    Nueva propuesta de horario
                  </h1>

                  <p className="message">
                    El administrador ha propuesto un horario alternativo para tu inscripción.
                  </p>

                </div>

              </div>

              <div className="proposal-box">

                <div className="proposal-data">

                  <div>
                    <strong>Horario:</strong>{" "}
                    {propuesta.horario?.hora_inicio?.substring(11,16)} -{" "}
                    {propuesta.horario?.hora_fin?.substring(11,16)}
                  </div>

                  <div>
                    <strong>Días:</strong>{" "}
                    {propuesta.dias?.map((d:any)=>d.dia.nombre).join(", ")}
                  </div>

                </div>

              </div>

            </>

          )}

          {/* 🔹 SI NO HAY PROPUESTA */}

          {!loading && !propuesta && (

            <div className="hero">

              <div className="state">
                <Info />
              </div>

              <div>

                <h1 className="title">
                  Cuenta pendiente de aprobación
                </h1>

                <p className="message">
                  Tu cuenta fue registrada correctamente. En cuanto el administrador la apruebe,
                  podrás acceder al sistema.
                </p>

                <div className="status">
                  <Clock /> Estado: Pendiente
                </div>

              </div>

            </div>

          )}

          {/* BOTONES */}

          <div className="actions">

            {propuesta && (

              <button
                className="btn btn--green btn--full btn--lg"
                onClick={aceptarPropuesta}
              >
                <Check /> Aceptar propuesta
              </button>

            )}

            <button
              className="btn btn--blue btn--full btn--lg"
              onClick={handleLogout}
            >
              <LogOut /> Cerrar sesión
            </button>

          </div>

          <div className="foot">
            Si tu cuenta ya fue aprobada y sigues viendo esta pantalla,
            cierra sesión e inicia nuevamente.
          </div>

          {/* SOPORTE */}

          <div className="support">

            <details>

              <summary>

                <span className="sum-left">
                  <LifeBuoy /> Soporte
                </span>

                <ChevronDown className="chev" />

              </summary>

              <div className="support-body">

                <div className="support-item">

                  <Mail />

                  <div>

                    Correo:
                    <a href="mailto:soporte@schedmaster.uteq.mx">
                      soporte@schedmaster.uteq.mx
                    </a>

                    <small>
                      Incluye tu matrícula y una breve descripción.
                    </small>

                  </div>

                </div>

                <div className="support-item">

                  <Phone />

                  <div>

                    Teléfono:
                    <a href="tel:+524421234567">
                      +52 442 123 4567
                    </a>

                    <small>
                      Horario: Lunes a Viernes.
                    </small>

                  </div>

                </div>

              </div>

            </details>

          </div>

        </section>

      </div>

    </div>
  );
}