'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, ListOrdered, Bell } from 'lucide-react';

export default function LoginPage() {
  const [correo,   setCorreo]   = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Solicitar la clave pública RSA al servidor (genera un par nuevo por sesión)
      const keyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/public-key`);
      const { keyId, publicKey: publicKeyPem } = await keyRes.json();

      // 2. Importar la clave pública PEM al Web Crypto API del navegador
      const pemBody = publicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '');
      const pemBuffer = Uint8Array.from(atob(pemBody), (c: string) => c.charCodeAt(0));
      const rsaPublicKey = await crypto.subtle.importKey(
        'spki',
        pemBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );

      // 3. Generar una clave AES-256 aleatoria (única por sesión)
      const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-CBC', length: 256 },
        true, // exportable para cifrarla con RSA
        ['encrypt']
      );

      // 4. Generar IV aleatorio de 16 bytes (viaja junto al mensaje, no se reutiliza)
      const iv = crypto.getRandomValues(new Uint8Array(16));

      // 5. Cifrar las credenciales con AES-256-CBC
      const plaintext = JSON.stringify({ correo, password });
      const encryptedDataBuffer = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        aesKey,
        new TextEncoder().encode(plaintext)
      );
      // 6. Exportar la clave AES raw y cifrarla con la clave pública RSA-OAEP
      const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
      const encryptedKeyBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        rsaPublicKey,
        rawAesKey
      );
      // 7. Convertir buffers a Base64 para armar el payload JSON
      const toBase64 = (buf: ArrayBuffer) =>
        btoa(String.fromCharCode(...new Uint8Array(buf)));

      const payload = {
        keyId,
        encryptedKey:  toBase64(encryptedKeyBuffer),
        iv:            btoa(String.fromCharCode(...iv)),
        encryptedData: toBase64(encryptedDataBuffer),
      };
      // 8. Enviar — las credenciales nunca viajan en texto plano
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.status === 'pending')  { window.location.href = '/pending';   return; }
        if (data.status === 'approved') {
 // 78. Guardar sesión en localStorage con el nombre que el dashboard espera
        localStorage.setItem('user', JSON.stringify(data.usuario));
        window.location.href = '/dashboard';
          return;
        }
      } else { alert(data.message); }
    } catch (err) {
      console.error('[Seguridad] Error en el flujo de login cifrado:', err);
      alert('Error de conexión');
    }
  };

  return (
    <div className="login-page">

      <section className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <img src="/logo.png" alt="Logo" width="60" height="60" />
          </div>
          <h1 className="hero-title">SchedMaster</h1>
          <p className="hero-subtitle">Gestión inteligente de horarios UTEQ.</p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon"><CircleCheck size={20} strokeWidth={2.5} /></div>
              <span className="feature-text">Reserva tu horario favorito</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ListOrdered size={20} strokeWidth={2.5} /></div>
              <span className="feature-text">Fila virtual inteligente</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Bell size={20} strokeWidth={2.5} /></div>
              <span className="feature-text">Notificaciones en tiempo real</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-section">
        <div className="decorative-shape shape-1" />
        <div className="decorative-shape shape-2" />
        <div className="login-container">
          <header className="login-header">
            <h1>Bienvenido de <span className="highlight">nuevo</span></h1>
            <p>Ingresa tus credenciales para continuar</p>
          </header>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo institucional</label>
              <input type="email" className="auth-input" placeholder="usuario@uteq.edu.mx"
                value={correo} onChange={e => setCorreo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" className="auth-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <div className="forgot-password"><a href="#">¿Olvidaste tu contraseña?</a></div>
            </div>
            <button type="submit" className="btn btn--blue btn--full btn--lg">
              Iniciar sesión
            </button>
          </form>
          <div className="divider"><span>¿Primera vez?</span></div>
          <div className="auth-link"><Link href="/register">Crea tu cuenta aquí</Link></div>
        </div>
      </section>

    </div>
  );
}