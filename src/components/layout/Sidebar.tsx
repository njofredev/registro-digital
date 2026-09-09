'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PlusCircle, Search, Edit3, BarChart2, Calendar, Download, Sun, Moon, User, Settings2, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { name: 'Nuevo Ingreso', href: '/ingreso', icon: PlusCircle },
  { name: 'Buscador', href: '/visualizador', icon: Search },
  { name: 'Edición', href: '/edicion', icon: Edit3 },
  { name: 'Agenda Entregas', href: '/entregas', icon: Calendar },
  { name: 'Exportar Reportes', href: '/exportar', icon: Download },
];



export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const isDerivacionesRadiologia = pathname.startsWith('/derivaciones/radiologia');
  const isDerivaciones = pathname.startsWith('/derivaciones') && !isDerivacionesRadiologia;
  const isRadiologia = pathname.startsWith('/radiologia');

  const cubosItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Nuevo Ingreso', href: '/ingreso', icon: PlusCircle },
    { name: 'Buscador', href: '/visualizador', icon: Search },
    { name: 'Edición', href: '/edicion', icon: Edit3 },
    { name: 'Agenda Entregas', href: '/entregas', icon: Calendar },
    { name: 'Exportar Reportes', href: '/exportar', icon: Download },
  ];

  const derivacionesCubosItems = [
    { name: 'Dashboard', href: '/derivaciones/dashboard', icon: BarChart2 },
    { name: 'Nuevo Ingreso', href: '/derivaciones/ingreso', icon: PlusCircle },
    { name: 'Buscador', href: '/derivaciones/visualizador', icon: Search },
    { name: 'Edición', href: '/derivaciones/edicion', icon: Edit3 },
    { name: 'Agenda Entregas', href: '/derivaciones/entregas', icon: Calendar },
    { name: 'Exportar Reportes', href: '/derivaciones/exportar', icon: Download },
  ];

  const radiologiaItems = [
    { name: 'Dashboard', href: '/radiologia', icon: BarChart2 },
    { name: 'Ingreso', href: '/radiologia/ingreso', icon: PlusCircle },
    { name: 'Reportería', href: '/radiologia/reporteria', icon: Download },
  ];

  const derivacionesRadiologiaItems = [
    { name: 'Dashboard', href: '/derivaciones/radiologia', icon: BarChart2 },
    { name: 'Ingreso', href: '/derivaciones/radiologia/ingreso', icon: PlusCircle },
    { name: 'Reportería', href: '/derivaciones/radiologia/reporteria', icon: Download },
  ];

  const activeItems = isDerivacionesRadiologia
    ? derivacionesRadiologiaItems
    : isDerivaciones
      ? derivacionesCubosItems
      : isRadiologia
        ? radiologiaItems
        : cubosItems;

  // Dynamic greeting, time and date states
  const [time, setTime] = React.useState('');
  const [greeting, setGreeting] = React.useState('');
  const [dateStr, setDateStr] = React.useState('');

  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Greeting based on hour
      const hours = now.getHours();
      let greet = 'Buenas noches';
      if (hours >= 6 && hours < 12) greet = 'Buenos días';
      else if (hours >= 12 && hours < 20) greet = 'Buenas tardes';
      setGreeting(greet);

      // System Time
      const timeString = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTime(timeString);

      // System Date
      const dateString = now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });
      setDateStr(dateString.charAt(0).toUpperCase() + dateString.slice(1));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to trigger Alt+K keyboard event programmatically
  const triggerSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      altKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="w-72 bg-card/40 backdrop-blur-2xl border-r border-border/40 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20">

      {/* Header */}
      <div className="p-6 pb-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3.5 border border-border/50 shadow-md overflow-hidden p-1.5 transition-transform hover:scale-105 duration-300">
          <Image src="/logo_vec.svg" alt="Logo" width={72} height={72} quality={100} className="object-contain" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Policlínico Tabancura</h2>
        
        {/* System Identifier Badges */}
        <div className="mt-2.5">
          {isDerivacionesRadiologia ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-sm shadow-teal-500/10">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Deriv. Radiología
            </div>
          ) : isDerivaciones ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Deriv. Cubos
            </div>
          ) : isRadiologia ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Radiología Lab
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Cubos Lab
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-auto py-2 flex flex-col gap-1.5 px-4">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-4 mb-2">
          {isDerivacionesRadiologia 
            ? 'Menú Radiología Deriv.' 
            : isDerivaciones 
              ? 'Menú Cubos Deriv.' 
              : isRadiologia 
                ? 'Menú Radiología' 
                : 'Menú Cubos'}
        </p>
        {activeItems.map((item) => {
          const isActive = item.href.includes('?')
            ? pathname === item.href.split('?')[0] && searchParams.get(item.href.split('?')[1].split('=')[0]) === item.href.split('?')[1].split('=')[1]
            : pathname === item.href || (pathname === '/' && item.href === '/dashboard') || (pathname === '/derivaciones' && item.href === '/derivaciones/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? isDerivacionesRadiologia
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20"
                    : isDerivaciones
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                      : isRadiologia
                        ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
                        : "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              <span className="relative z-10 font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Dynamic Greeting/Clock */}
      <div className="p-4 border-t border-border/40 bg-card/20 backdrop-blur-md space-y-3">

        {/* Minimalist User Section with Link to Inicio */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30 rounded-xl border border-border/20">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
              isDerivacionesRadiologia
                ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                : isDerivaciones
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : isRadiologia
                    ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                    : "bg-primary/10 border-primary/20 text-primary"
            )}>
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight">
                {isDerivacionesRadiologia 
                  ? 'Admin Rad. Deriv.' 
                  : isDerivaciones 
                    ? 'Admin Cubos Deriv.' 
                    : isRadiologia 
                      ? 'Admin Radiología' 
                      : 'Admin Lab Cubos'}
              </span>
              <Link href="/inicio" className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5 font-medium">
                ← Cambiar de Sistema
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Greeting & Real-time Clock Section */}
        <div className="flex flex-col gap-2 px-3.5 py-3 border border-border/20 rounded-2xl bg-secondary/15">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-foreground tracking-tight leading-none">{greeting}</span>
              <span className="text-xs font-bold text-muted-foreground/80 leading-none mt-1">{time || '--:--:--'}</span>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background/50 border-border/50 hover:bg-secondary/80 transition-all shrink-0 shadow-sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground/50 border-t border-border/10 pt-2 mt-1 uppercase tracking-wide leading-none">
            {dateStr || '...'}
          </div>
        </div>
      </div>
    </div>
  );
}
