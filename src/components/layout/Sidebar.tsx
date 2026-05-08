'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, Search, Edit3, BarChart2, Calendar, Download, Sun, Moon, User, Settings2 } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();

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
      <div className="p-8 pb-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border border-border/50 shadow-md overflow-hidden p-1.5 transition-transform hover:scale-105 duration-300">
          <Image src="/logo_vec.svg" alt="Logo" width={82} height={82} quality={100} className="object-contain" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Policlínico Tabancura</h2>
        <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 tracking-wider uppercase">Registro digital de laboratorio</p>
      </div>

      {/* Search Input Trigger */}
      <div className="px-4 mt-2 mb-4">
        <button
          onClick={triggerSearch}
          className="w-full flex items-center justify-between px-3 h-11 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/70 hover:border-primary/20 text-muted-foreground text-xs font-medium transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-muted-foreground/80 font-medium">Buscar en la app...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[9px] font-bold text-muted-foreground">
            <span>Alt</span><span>+</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-auto py-2 flex flex-col gap-1.5 px-4">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-4 mb-2">Menú Principal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
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

        {/* Minimalist User Section */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30 rounded-xl border border-border/20 h-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-foreground leading-tight">Admin Laboratorio</span>
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
