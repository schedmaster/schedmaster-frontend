import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/carrusel.css";

// 1. Asegúrate de tener esta línea para importar el bot
import ChatBot from "./components/ChatBot";
import CustomCursor from "./components/CustomCursor";
import ServiceWorker from "./components/ServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SchedMaster · Gimnasio universitario UTEQ",
  description: "Reserva tu horario, consulta convocatorias y gestiona tu acceso al gimnasio universitario UTEQ.",
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'SchedMaster', statusBarStyle: 'default' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem('darkMode')==='true')document.documentElement.classList.add('dark')}catch(e){}`
        }} />
        
        {children}

        {/* 2. Asegúrate de que el componente esté AQUÍ, justo antes de cerrar el body */}
        <ChatBot />
        <CustomCursor />
        <ServiceWorker />

      </body>
    </html>
  );
}
