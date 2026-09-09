import Link from 'next/link';
import Image from 'next/image';
import { Box, Scan, ArrowRight, ShieldCheck, Layers, Sparkles } from 'lucide-react';

export const metadata = {
  title: "Portal Central - Policlínico Tabancura",
  description: "Acceso exclusivo a sistemas internos del Policlínico Tabancura",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InicioPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between relative overflow-hidden selection:bg-primary/30">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-border/60 shadow-md overflow-hidden p-1">
            <Image src="/logo_vec.svg" alt="Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">Policlínico Tabancura</h1>
            <p className="text-xs text-muted-foreground font-medium">Plataforma de Registros Clínicos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Acceso Interno Autorizado</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col justify-center">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Portal de Selección
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Selecciona el sistema de trabajo
          </h2>
          <p className="text-muted-foreground mt-2.5 text-sm md:text-base leading-relaxed">
            Gestión independiente de registros para Laboratorio Digital y Derivaciones.
          </p>
        </div>

        {/* Grid de 2 Categorías con sus 4 Sistemas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Categoría 1: Laboratorio Digital */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Categoría 1</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Registro de Laboratorio Digital</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Órdenes generales y exámenes directos del laboratorio clínico.
              </p>

              {/* Sub-tarjetas */}
              <div className="space-y-3.5">
                {/* 1. Cubos Lab */}
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/70 border border-border/40 hover:border-primary/40 transition-all duration-300 group/item hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover/item:scale-105 transition-transform">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">
                        1. Registro de Cubos Dentales
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Control de bloques, diseño fresado y entregas generales.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>

                {/* 2. Radiología Lab */}
                <Link
                  href="/radiologia"
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/70 border border-border/40 hover:border-sky-500/40 transition-all duration-300 group/item hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover/item:scale-105 transition-transform">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/item:text-sky-400 transition-colors">
                        2. Registro de Radiología
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Exámenes imagenológicos, toma de rayos y reportería general.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:text-sky-400 group-hover/item:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>2 Módulos operativos</span>
              <span className="font-semibold text-foreground/80">Laboratorio Digital</span>
            </div>
          </div>

          {/* Categoría 2: Derivaciones */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Categoría 2</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Registro de Derivaciones</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Gestión especializada para trabajos y pacientes derivados.
              </p>

              {/* Sub-tarjetas */}
              <div className="space-y-3.5">
                {/* 3. Cubos Derivaciones */}
                <Link
                  href="/derivaciones/dashboard"
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/70 border border-border/40 hover:border-emerald-500/40 transition-all duration-300 group/item hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover/item:scale-105 transition-transform">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/item:text-emerald-400 transition-colors">
                        3. Derivaciones de Cubos Dentales
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Trabajos de diseño, fresado y prótesis derivados.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:text-emerald-400 group-hover/item:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>

                {/* 4. Radiología Derivaciones */}
                <Link
                  href="/derivaciones/radiologia"
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/70 border border-border/40 hover:border-teal-500/40 transition-all duration-300 group/item hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover/item:scale-105 transition-transform">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/item:text-teal-400 transition-colors">
                        4. Derivaciones de Radiología
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Exámenes imagenológicos derivados, control y entregas.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:text-teal-400 group-hover/item:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>2 Módulos operativos</span>
              <span className="font-semibold text-foreground/80">Derivaciones</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground relative z-10">
        <p>© {new Date().getFullYear()} Policlínico Tabancura. Todos los derechos reservados.</p>
        <p className="font-medium">Uso exclusivo personal interno</p>
      </footer>
    </div>
  );
}
