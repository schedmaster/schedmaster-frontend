'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { clearSession } from '../../lib/api';
import { gxFontClass } from '../../styles/fonts';
import BrandLogo from '../../components/BrandLogo';

export default function PendingPage() {
  const router = useRouter();
  return (
    <main className={`gx-scope gx-status-page ${gxFontClass}`}>
      <div className="gx-status-wrap">
        <div className="gx-status-top"><Link href="/"><BrandLogo eager /></Link></div>
        <section className="gx-card gx-status-card">
          <div className="gx-status-hero">
            <div className="gx-status-icon"><Info size={22}/></div>
            <div>
              <h1>Cuenta no habilitada</h1>
              <p className="gx-status-message">Contacta a la administración para revisar el estado de tu cuenta. Las solicitudes y contrapropuestas del gimnasio se consultan dentro del panel cuando tu cuenta está habilitada.</p>
            </div>
          </div>
          <div className="gx-status-actions">
            <button className="gx-btn gx-btn--primary" onClick={() => { clearSession(); router.push('/login'); }}>Volver al inicio de sesión</button>
          </div>
        </section>
      </div>
    </main>
  );
}
