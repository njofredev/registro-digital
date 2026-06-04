'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Scan, Activity, Calendar, Stethoscope, MapPin, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#f43f5e', '#6366f1'];

function parseSpanishOrISODate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  }
  return new Date(cleaned);
}

function getStartOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dd = String(monday.getDate()).padStart(2, '0');
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function getMonthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function RadiologiaDashboardClient({ data }: { data: any[] }) {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');

  // Basic stats
  const totalExamenes = data.length;
  const finalizados = data.filter(d => d.proceso === 'FINALIZADO' || d.proceso === 'ENVIADO').length;
  const pendientes = totalExamenes - finalizados;

  const averageAge = useMemo(() => {
    const validAges = data.map(d => d.edad).filter(x => typeof x === 'number' && !isNaN(x));
    if (validAges.length === 0) return 0;
    const sum = validAges.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / validAges.length);
  }, [data]);

  // Aggregate Exámenes counts
  const examenesCounts = useMemo(() => {
    const counts = {
      'Panorámica': 0,
      'Cefalométrico': 0,
      'Teleradiografía': 0,
      'T. ATM': 0,
      'T. Grupo/Pieza': 0,
      'T. Arcada': 0,
      'T. Total': 0,
      'Retroalveolar': 0,
      'RX Mano': 0,
      'Bitewing': 0,
    };
    data.forEach(r => {
      if (r.rx_panoramica) counts['Panorámica']++;
      if (r.analisis_cefalometrico) counts['Cefalométrico']++;
      if (r.teleradiografia) counts['Teleradiografía']++;
      if (r.tomografia_atm) counts['T. ATM']++;
      if (r.tomografia_grupo_pieza) counts['T. Grupo/Pieza']++;
      if (r.tomografia_arcada) counts['T. Arcada']++;
      if (r.tomografia_total) counts['T. Total']++;
      if (r.rx_retroalveolar_total) counts['Retroalveolar']++;
      if (r.rx_mano) counts['RX Mano']++;
      if (r.bitewing_bilateral) counts['Bitewing']++;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Branch statistics
  const sucursalData = useMemo(() => {
    const counts = data.reduce((acc, r) => {
      const s = r.sucursal || 'Sin asignar';
      const p = r.sucursal || 'Sin asignar';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count: count as number }));
  }, [data]);

  // Status statistics
  const estadoData = useMemo(() => {
    const counts = data.reduce((acc, r) => {
      const p = r.proceso || 'PENDIENTE';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [data]);

  // Doctor stats
  const doctorData = useMemo(() => {
    const counts = data.reduce((acc, r) => {
      const d = r.doctor || 'Externo / Desconocido';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  // Grouped trend data depending on timeFilter
  const filteredTrendData = useMemo(() => {
    const parsedRecords = data
      .map(r => ({ ...r, parsedDate: parseSpanishOrISODate(r.fecha_toma_examen || r.fecha_entrega) }))
      .filter(r => r.parsedDate !== null)
      .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

    if (parsedRecords.length === 0) return [];

    if (timeFilter === 'month') {
      const groups: Record<string, { label: string; count: number; sortKey: number }> = {};
      parsedRecords.forEach(r => {
        const label = getMonthLabel(r.parsedDate!);
        const sortKey = r.parsedDate!.getFullYear() * 100 + r.parsedDate!.getMonth();
        if (!groups[label]) {
          groups[label] = { label, count: 0, sortKey };
        }
        groups[label].count++;
      });
      return Object.values(groups)
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(g => ({ date: g.label, count: g.count }));
    }

    if (timeFilter === 'week') {
      const groups: Record<string, { label: string; count: number; sortKey: number }> = {};
      parsedRecords.forEach(r => {
        const label = `Sem ${getStartOfWeek(r.parsedDate!)}`;
        const d = new Date(r.parsedDate!);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const sortKey = monday.getTime();
        
        if (!groups[label]) {
          groups[label] = { label, count: 0, sortKey };
        }
        groups[label].count++;
      });
      return Object.values(groups)
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(g => ({ date: g.label, count: g.count }));
    }

    // Daily grouping
    const groups: Record<string, { label: string; count: number; sortKey: number }> = {};
    parsedRecords.forEach(r => {
      const label = r.fecha_toma_examen || r.fecha_entrega || '';
      const sortKey = r.parsedDate!.getTime();
      if (!groups[label]) {
        groups[label] = { label, count: 0, sortKey };
      }
      groups[label].count++;
    });

    const dailyData = Object.values(groups)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(g => ({ date: g.label, count: g.count }));

    if (timeFilter === 'day') {
      // Show the last 15 active days of records
      return dailyData.slice(-15);
    }

    return dailyData;
  }, [data, timeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Radiografías</CardTitle>
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500 dark:text-sky-400 border border-sky-500/20">
              <Scan className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{totalExamenes}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Registrados en total</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finalizados / Enviados</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">{finalizados}</div>
            <p className="text-[11px] text-muted-foreground mt-1">{Math.round((finalizados / (totalExamenes || 1)) * 100)}% de tasa de completado</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pendientes</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{pendientes}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Radiografías pendientes de entrega</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edad Promedio</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 dark:text-purple-400 border border-purple-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{averageAge} <span className="text-sm font-bold text-muted-foreground">años</span></div>
            <p className="text-[11px] text-muted-foreground mt-1">Edad media de pacientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Trend Area Chart */}
        <Card className="p-6 border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <div className="w-1.5 h-5 bg-sky-400 rounded-full" />
              <TrendingUp className="h-5 w-5 text-sky-400" />
              Tendencia de Radiografías Tomadas
            </h3>

            <div className="flex items-center bg-secondary/40 border border-border/40 p-1 rounded-xl shadow-sm self-start">
              {(['day', 'week', 'month', 'all'] as const).map((filter) => {
                const labels = { day: 'Día', week: 'Semana', month: 'Mes', all: 'Todo' };
                return (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeFilter === filter
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tickMargin={12} stroke="#64748b" tickLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exámenes Requeridos Bar Chart */}
        <Card className="p-6 border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-sky-400 rounded-full" />
            Radiografías más Solicitadas
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examenesCounts} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis type="number" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" tickLine={false} width={90} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Branch / Sucursal Pie Chart */}
        <Card className="p-6 border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-sky-400 rounded-full" />
            Derivaciones por Sucursal
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sucursalData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} fill="#8884d8" paddingAngle={4} dataKey="value" label={{ fontSize: 11, fill: 'var(--foreground)' }}>
                  {sucursalData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workflow State Bar Chart */}
        <Card className="p-6 border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-sky-400 rounded-full" />
            Estado del Flujo (Proceso)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Doctors Bar Chart */}
        <Card className="p-6 border-border/40 bg-card/40 dark:bg-card/25 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-sky-400 rounded-full" />
            Top 5 Profesionales Derivadores
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} tickMargin={8} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
