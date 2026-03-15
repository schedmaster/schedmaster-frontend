'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import HorarioForm from '../../components/HorarioForm';

export default function HorariosPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  // 🔐 Protegemos la ruta igual que el Dashboard
  useEffect(() => {
    const verificarAcceso = () => {
      const usuarioLogueado = localStorage.getItem('user');
      if (!usuarioLogueado) {
        router.push('/login');
      } else {
        setAutorizado(true);
      }
    };

    const timer = setTimeout(verificarAcceso, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // ⏳ Loader mientras verifica sesión
  if (!autorizado) {
    return (
      <div className="loader">
        <p>Cargando SchedMaster...</p>
      </div>
    );
  }

  return (
    // 👇 AQUÍ ESTÁ LA MAGIA DEL DISEÑO: Envolvemos todo en tu layout principal
    <div className="app">
      {/* Tu menú lateral hermoso */}
      <AdminSidebar />

      <main className="main">
        <div className="main-inner">
          
          <header className="section-header">
            <div>
              <h2>Gestión de Horarios</h2>
              <p>Da de alta, edita o desactiva los horarios de SchedMaster.</p>
            </div>
          </header>

          <section className="mt-8">
            <HorarioForm />
          </section>

        </div>
      </main>
    </div>
  );
}