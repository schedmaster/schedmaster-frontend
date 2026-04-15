'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, ListOrdered, Bell, Sun, Moon } from 'lucide-react';
import AlertModal from '../../components/AlertModal';
import { useDarkMode } from '../../hooks/useDarkMode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginPage() {
  const { darkMode, toggle } = useDarkMode();
  const router = useRouter();

  const [correo,   setCorreo]   = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const keyRes = await fetch(`${API_URL}/auth/public-key`);
      if (!keyRes.ok) throw new Error('No se pudo obtener la clave pública');

      const { keyId, publicKey: publicKeyPem } = await keyRes.json();

      const pemBody = publicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '');

      const pemBuffer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

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
        btoa(String.fromCharCode(...new Uint8Array(buf)));

      const payload = {
        keyId,
        encryptedKey: toBase64(encryptedKeyBuffer),
        iv: btoa(String.fromCharCode(...iv)),
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
    <div className="login-page">

      <button className="dark-toggle" onClick={toggle} aria-label="Cambiar tema">
        {mounted ? (
          darkMode ? <Moon size={18} /> : <Sun size={18} />
        ) : (
          <span style={{ width: 18, height: 18, display: 'inline-block' }} />
        )}
      </button>

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
              <input
                type="email"
                className="auth-input"
                placeholder="usuario@uteq.edu.mx"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                required
              />
              {/* <div className="forgot-password"> */}
                {/* <a href="#">¿Olvidaste tu contraseña?</a> */}
              {/* </div> */}
            </div>

            <button
              type="submit"
              className="btn btn--blue btn--full btn--lg"
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