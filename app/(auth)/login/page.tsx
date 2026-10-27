'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, ListOrdered, Bell } from 'lucide-react';
import AlertModal from '../../components/AlertModal';
import ThemeToggle from '../../components/ThemeToggle';
import { gxFontClass } from '../../styles/fonts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginPage() {
  const router = useRouter();

  const [correo,   setCorreo]   = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keyRes = await fetch(`${API_URL}/auth/public-key`);
      if (!keyRes.ok) throw new Error('No se pudo obtener la clave pública');

      const { keyId, publicKey: publicKeyPem } = await keyRes.json();

      const pemBody = publicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replaceAll('\n', '');

      const pemBuffer = Uint8Array.from(atob(pemBody), c => c.codePointAt(0) ?? 0);

      const rsaPublicKey = await crypto.subtle.importKey(
        'spki',
        pemBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );

      const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(16));

      const encryptedDataBuffer = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        aesKey,
        new TextEncoder().encode(JSON.stringify({ correo, password }))
      );

      const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

      const encryptedKeyBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        rsaPublicKey,
        rawAesKey
      );

      const toBase64 = (buf: ArrayBuffer) =>
        btoa(String.fromCodePoint(...new Uint8Array(buf)));

      const payload = {
        keyId,
        encryptedKey: toBase64(encryptedKeyBuffer),
        iv: btoa(String.fromCodePoint(...iv)),
        encryptedData: toBase64(encryptedDataBuffer),
      };

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.message || 'Error en login');
        setModalOpen(true);
        return;
      }

      if (data.requiresTwoFactor && data.twoFactorToken) {
        sessionStorage.setItem(
          'twoFactorLogin',
          JSON.stringify({
            twoFactorToken: data.twoFactorToken,
            correo: correo.toLowerCase().trim(),
            expiresAt: Date.now() + (Number(data.expiresInSeconds) || 0) * 1000
          })
        );

        router.push('/verify-2fa');
        return;
      }

      if (data.status === 'pending') {
        localStorage.setItem('user', JSON.stringify(data.usuario));
        router.push('/pending');
        return;
      }

      if (data.status === 'approved') {
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('sessionToken', data.token);

        if (data.usuario.id_rol === 1 || data.usuario.id_rol === 2) {
          router.push('/anuncios');
          return;
        }

        if (data.usuario.id_rol === 3 || data.usuario.id_rol === 4) {
          router.push('/dashboard');
          return;
        }

        setModalMessage('Rol de usuario no reconocido');
        setModalOpen(true);
        return;
      }

      setModalMessage('Estado de usuario no reconocido');
      setModalOpen(true);
    } catch (error) {
      console.error('Error login:', error);
      setModalMessage('Error de conexión con el servidor');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`gx-scope gx-auth-page ${gxFontClass}`}>
      <div className="gx-auth-fab-theme"><ThemeToggle /></div>

      <section className="gx-auth-brand">
        <div className="gx-auth-brand-bg">
          <div className="gx-hero-orb gx-hero-orb--1 gx-float-a" />
          <div className="gx-hero-orb gx-hero-orb--2 gx-float-b" />
        </div>
        <div className="gx-auth-brand-inner">
          <div className="gx-auth-logo">
            <img src="/logo.png" alt="Logo" width="48" height="48" />
          </div>
          <h1>SchedMaster</h1>
          <p>Gestión inteligente de horarios UTEQ.</p>

          <div className="gx-auth-feature-list">
            <div className="gx-auth-feature">
              <span className="gx-auth-feature-icon"><CircleCheck size={18} strokeWidth={2.5} /></span>
              <span>Reserva tu horario favorito</span>
            </div>
            <div className="gx-auth-feature">
              <span className="gx-auth-feature-icon"><ListOrdered size={18} strokeWidth={2.5} /></span>
              <span>Fila virtual inteligente</span>
            </div>
            <div className="gx-auth-feature">
              <span className="gx-auth-feature-icon"><Bell size={18} strokeWidth={2.5} /></span>
              <span>Notificaciones en tiempo real</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gx-auth-form-side">
        <div className="gx-auth-form-wrap">
          <header className="gx-auth-form-head">
            <h1>Bienvenido de <span className="gx-grad-text">nuevo</span></h1>
            <p>Ingresa tus credenciales para continuar</p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="gx-field">
              <label htmlFor="login-correo">Correo institucional</label>
              <input
                type="email"
                id="login-correo"
                className="gx-input"
                placeholder="usuario@uteq.edu.mx"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="gx-field">
              <label htmlFor="login-password">Contraseña</label>
              <input
                type="password"
                id="login-password"
                className="gx-input"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="gx-btn gx-btn--primary gx-btn--full gx-btn--lg"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </section>

      <AlertModal
        open={modalOpen}
        title="Error"
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
