import Link from 'next/link';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { gxFontClass } from '../../styles/fonts';

export default function SeleccionServicioPage() {
  return <main className={`gx-scope gx-app gx-service-entry ${gxFontClass}`}><section className="gx-card gx-conv-empty"><Dumbbell size={36}/><h1>Entrena con SchedMaster</h1><p>Crea tu cuenta en cualquier momento. Al entrar podrás consultar anuncios, rutinas y convocatorias para solicitar un horario en el gimnasio.</p><div className="gx-conv-actions"><Link className="gx-btn gx-btn--primary" href="/register">Crear cuenta <ArrowRight size={16}/></Link><Link className="gx-btn gx-btn--outline" href="/login">Ya tengo cuenta</Link></div></section></main>;
}
