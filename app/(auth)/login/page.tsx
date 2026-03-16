'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, ListOrdered, Bell } from 'lucide-react';
import AlertModal from "../../components/AlertModal";

export default function LoginPage() {

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // 1️⃣ Obtener clave pública RSA
      const keyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/public-key`
      );

      if (!keyRes.ok) throw new Error("No se pudo obtener la clave pública");

      const { keyId, publicKey: publicKeyPem } = await keyRes.json();

      // 2️⃣ Importar clave pública
      const pemBody = publicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '');

      const pemBuffer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

      const rsaPublicKey = await crypto.subtle.importKey(
        "spki",
        pemBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );

      // Generar clave AES
      const aesKey = await crypto.subtle.generateKey(
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt"]
      );

      //  Generar IV
      const iv = crypto.getRandomValues(new Uint8Array(16));

      // Cifrar credenciales
      const plaintext = JSON.stringify({ correo, password });
      const encryptedDataBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        aesKey,
        new TextEncoder().encode(plaintext)
      );

      // Exportar AES y cifrarla con RSA
      const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
      const encryptedKeyBuffer = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaPublicKey,
        rawAesKey
      );

      // Convertir a Base64
      const toBase64 = (buffer: ArrayBuffer) =>
        btoa(String.fromCharCode(...new Uint8Array(buffer)));

      const payload = {
        keyId,
        encryptedKey: toBase64(encryptedKeyBuffer),
        iv: btoa(String.fromCharCode(...iv)),
        encryptedData: toBase64(encryptedDataBuffer)
      };

      // Enviar login
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );

      const data = await res.json();

      // Error de credenciales
      if (!res.ok) {
        setModalMessage(data.message || "Error en login");
        setModalOpen(true);
        return;
      }

      // 9Redirecciones según estado y rol
     if (data.status === "pending") {

  localStorage.setItem('user', JSON.stringify(data.usuario));

  window.location.href = "/pending";
  return;
}

      if (data.status === "approved") {
        localStorage.setItem('user', JSON.stringify(data.usuario));

        // 🔹 Estudiante o docente → anuncios
        if (data.usuario.id_rol === 1 || data.usuario.id_rol === 2) {
          window.location.href = "/anuncios";
          return;
        }

        // 🔹 Entrenador o administrador → dashboard
        if (data.usuario.id_rol === 3 || data.usuario.id_rol === 4) {
          window.location.href = "/dashboard";
          return;
        }

        // Por seguridad: cualquier otro caso desconocido
        setModalMessage("Rol de usuario no reconocido");
        setModalOpen(true);
        return;
      }

      // Estado desconocido
      setModalMessage("Estado de usuario no reconocido");
      setModalOpen(true);

    } catch (error) {
      console.error("Error login:", error);
      setModalMessage("Error de conexión con el servidor");
      setModalOpen(true);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <img src="/logo.png" alt="Logo" width="60" height="60" />
          </div>
          <h1 className="hero-title">SchedMaster</h1>
          <p className="hero-subtitle">Gestión inteligente de horarios UTEQ.</p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon"><CircleCheck size={20} strokeWidth={2.5}/></div>
              <span>Reserva tu horario favorito</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ListOrdered size={20} strokeWidth={2.5}/></div>
              <span>Fila virtual inteligente</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Bell size={20} strokeWidth={2.5}/></div>
              <span>Notificaciones en tiempo real</span>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN */}
      <section className="login-section">
        <div className="decorative-shape shape-1"/>
        <div className="decorative-shape shape-2"/>
        <div className="login-container">

          <header className="login-header">
            <h1>Bienvenido de <span className="highlight">nuevo</span></h1>
            <p>Ingresa tus credenciales para continuar</p>
          </header>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Correo institucional</label>
              <input
                type="email"
                className="auth-input"
                placeholder="usuario@uteq.edu.mx"
                value={correo}
                onChange={(e)=>setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
              <div className="forgot-password">
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--blue btn--full btn--lg"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>

          </form>

          <div className="divider"><span>¿Primera vez?</span></div>

          <div className="auth-link">
            <Link href="/register">Crea tu cuenta aquí</Link>
          </div>

        </div>
      </section>

      {/* MODAL */}
      <AlertModal
        open={modalOpen}
        title="Error"
        message={modalMessage}
        onClose={()=>setModalOpen(false)}
      />

    </div>
  );
}