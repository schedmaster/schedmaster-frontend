'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, RotateCw } from 'lucide-react';
import AlertModal from '../../components/AlertModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type PendingTwoFactor = {
  twoFactorToken: string;
  correo?: string;
  expiresAt: number;
};

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [pending, setPending] = useState<PendingTwoFactor | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Aviso');
  const [modalMessage, setModalMessage] = useState('');

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = otp.join('');

  const maskedEmail = useMemo(() => {
    if (!pending?.correo) return 'tu correo registrado';

    const [localPart, domain] = pending.correo.split('@');
    if (!domain) return pending.correo;

    const safeLocal = localPart.length <= 2
      ? `${localPart[0] || '*'}*`
      : `${localPart.slice(0, 2)}***`;

    return `${safeLocal}@${domain}`;
  }, [pending]);

  useEffect(() => {
    const raw = sessionStorage.getItem('twoFactorLogin');

    if (!raw) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PendingTwoFactor;
      if (!parsed.twoFactorToken || !parsed.expiresAt) {
        sessionStorage.removeItem('twoFactorLogin');
        router.replace('/login');
        return;
      }

      setPending(parsed);
      setSecondsLeft(Math.max(Math.floor((parsed.expiresAt - Date.now()) / 1000), 0));
    } catch {
      sessionStorage.removeItem('twoFactorLogin');
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!pending) return;

    const timer = setInterval(() => {
      const remaining = Math.max(Math.floor((pending.expiresAt - Date.now()) / 1000), 0);
      setSecondsLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [pending]);

  const redirectAfterLogin = (data: any) => {
    localStorage.setItem('user', JSON.stringify(data.usuario));
    sessionStorage.removeItem('twoFactorLogin');

    if (data.status === 'pending') {
      router.push('/pending');
      return;
    }

    if (data.status === 'approved') {
      if (data.usuario.id_rol === 1 || data.usuario.id_rol === 2) {
        router.push('/anuncios');
        return;
      }

      if (data.usuario.id_rol === 3 || data.usuario.id_rol === 4) {
        router.push('/dashboard');
        return;
      }
    }

    setModalTitle('Error');
    setModalMessage('No se pudo determinar el destino del usuario.');
    setModalOpen(true);
  };

  const focusOtpIndex = (index: number) => {
    otpRefs.current[index]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const onlyDigits = value.replace(/\D/g, '');

    if (!onlyDigits) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    const nextOtp = [...otp];

    if (onlyDigits.length > 1) {
      const chars = onlyDigits.slice(0, OTP_LENGTH).split('');
      chars.forEach((char, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < OTP_LENGTH) {
          nextOtp[targetIndex] = char;
        }
      });
      setOtp(nextOtp);
      focusOtpIndex(Math.min(index + chars.length, OTP_LENGTH - 1));
      return;
    }

    nextOtp[index] = onlyDigits;
    setOtp(nextOtp);

    if (index < OTP_LENGTH - 1) {
      focusOtpIndex(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      focusOtpIndex(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusOtpIndex(index - 1);
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusOtpIndex(index + 1);
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedDigits) return;

    const nextOtp = Array(OTP_LENGTH).fill('');
    pastedDigits.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    focusOtpIndex(Math.min(pastedDigits.length, OTP_LENGTH - 1));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending || loading) return;

    if (!/^\d{6}$/.test(code.trim())) {
      setModalTitle('Código inválido');
      setModalMessage('Ingresa un código de 6 dígitos.');
      setModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twoFactorToken: pending.twoFactorToken,
          code: code.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410 || res.status === 409 || res.status === 400) {
          sessionStorage.removeItem('twoFactorLogin');
        }

        setModalTitle('No se pudo verificar');
        setModalMessage(data.message || 'Error verificando el código.');
        setModalOpen(true);
        return;
      }

      redirectAfterLogin(data);
    } catch (error) {
      console.error('Error verificando 2FA:', error);
      setModalTitle('Error de conexión');
      setModalMessage('No fue posible conectar con el servidor.');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pending || resendLoading) return;

    setResendLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorToken: pending.twoFactorToken })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410 || res.status === 409 || res.status === 400) {
          sessionStorage.removeItem('twoFactorLogin');
        }

        setModalTitle('No se pudo reenviar');
        setModalMessage(data.message || 'No fue posible reenviar el código.');
        setModalOpen(true);
        return;
      }

      const nextExpiresAt = Date.now() + (Number(data.expiresInSeconds) || 0) * 1000;
      const nextPending = {
        ...pending,
        expiresAt: nextExpiresAt
      };

      setPending(nextPending);
      setSecondsLeft(Math.max(Math.floor((nextExpiresAt - Date.now()) / 1000), 0));
      sessionStorage.setItem('twoFactorLogin', JSON.stringify(nextPending));

      setModalTitle('Código reenviado');
      setModalMessage('Te enviamos un nuevo código a tu correo.');
      setModalOpen(true);
    } catch (error) {
      console.error('Error reenviando 2FA:', error);
      setModalTitle('Error de conexión');
      setModalMessage('No fue posible conectar con el servidor.');
      setModalOpen(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-page verify-2fa-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <img src="/logo.png" alt="Logo" width="60" height="60" />
          </div>
          <h1 className="hero-title">Verificación 2FA</h1>
          <p className="hero-subtitle">Protegemos tu acceso con un segundo factor de autenticación.</p>
          <div className="feature-list verify-feature-list">
            <div className="feature-item">
              <div className="feature-icon"><ShieldCheck size={20} strokeWidth={2.5} /></div>
              <span className="feature-text">Código temporal de un solo uso</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Mail size={20} strokeWidth={2.5} /></div>
              <span className="feature-text">Enviado a {maskedEmail}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-section">
        <div className="decorative-shape shape-1" />
        <div className="decorative-shape shape-2" />
        <div className="login-container">
          <header className="login-header">
            <h1>Ingresa tu <span className="highlight">código</span></h1>
            <p>Revisa tu correo y escribe el código de 6 dígitos para continuar.</p>
            <p className="verify-status-pill">
              {secondsLeft > 0 ? `Expira en ${secondsLeft}s` : 'El código puede haber expirado. Solicita uno nuevo.'}
            </p>
          </header>

          <form onSubmit={handleVerify} className="verify-form">
            <div className="form-group verify-code-group">
              <label>Código de verificación</label>
              <div className="otp-grid" role="group" aria-label="Código de verificación de seis dígitos">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={index === 0}
                    aria-label={`Dígito ${index + 1}`}
                    required
                  />
                ))}
              </div>
              <p className="verify-code-hint">Puedes escribir o pegar los 6 dígitos.</p>
            </div>

            <button
              type="submit"
              className="btn btn--blue btn--full btn--lg"
              disabled={loading || !pending || code.length !== OTP_LENGTH}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>

          <div className="verify-actions">
            <button
              type="button"
              className="btn btn--full btn--lg verify-resend-btn"
              onClick={handleResend}
              disabled={resendLoading || !pending}
            >
              <RotateCw size={16} /> {resendLoading ? 'Reenviando...' : 'Reenviar código'}
            </button>

            <Link href="/login" className="verify-login-link">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </section>

      <AlertModal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          if (!sessionStorage.getItem('twoFactorLogin')) {
            router.replace('/login');
          }
        }}
      />
    </div>
  );
}