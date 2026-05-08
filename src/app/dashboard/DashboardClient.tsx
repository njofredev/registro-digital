'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Layers, Activity, CalendarDays, Award, TrendingUp } from 'lucide-react';

const COLORS = ['#20d489', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'];

// Helper function to robustly parse both Spanish textual dates ("28 de enero de 2026") and ISO strings ("2026-05-08")
function parseSpanishOrISODate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();

  // If it's already an ISO date (e.g., 2026-05-08)
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  }

  // Spanish months mapping
  const months: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };

  // Try to match "DD de [mes] de YYYY"
  const match = cleaned.toLowerCase().match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2];
    const year = parseInt(match[3], 10);

    if (monthName in months) {
      return new Date(year, months[monthName], day);
    }
  }

  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function DashboardClient({ data }: { data: any[] }) {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | '3months' | 'all'>('all');

  // Aggregate Metrics
  const totalCasos = data.length;

  const tonsCounts = data.reduce((acc, curr) => {
    if (curr.tons_a_cargo) acc[curr.tons_a_cargo] = (acc[curr.tons_a_cargo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxTons = (Object.entries(tonsCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const materialCounts = data.reduce((acc, curr) => {
    if (curr.material) acc[curr.material] = (acc[curr.material] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxMaterial = (Object.entries(materialCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const dateCounts = data.reduce((acc, curr) => {
    if (curr.fecha_ingreso) acc[curr.fecha_ingreso] = (acc[curr.fecha_ingreso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxDate = (Object.entries(dateCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Chart Data: States
  const estadoData = Object.entries(
    data.reduce((acc, curr) => {
      if (curr.estado) acc[curr.estado] = (acc[curr.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  // Chart Data: Materials
  const materialData = Object.entries(materialCounts).map(([name, value]) => ({ name, value }));

  // Chart Data: Workload
  const tonsData = Object.entries(tonsCounts).map(([name, count]) => ({ name, count }));

  // Filter out empty entries and count registrations per day
  const trendCounts = data.reduce((acc, curr) => {
    if (curr.fecha_ingreso && curr.fecha_ingreso.trim()) {
      const trimmed = curr.fecha_ingreso.trim();
      acc[trimmed] = (acc[trimmed] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Compute Trend Data chronologically, filtering out invalid dates
  const trendData = useMemo(() => {
    return Object.entries(trendCounts)
      .map(([date, count]) => ({ date, count, parsedDate: parseSpanishOrISODate(date) }))
      .filter(item => item.parsedDate !== null) // Exclude invalid dates
      .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime()) // Perfect chronological sort
      .map(({ date, count }) => ({ date, count }));
  }, [trendCounts]);

  // Apply Time Filter dynamically based on latest valid date in DB
  const filteredTrendData = useMemo(() => {
    if (trendData.length === 0) return [];

    // Last element is guaranteed to be the latest valid date due to our chronological sorting
    const latestDate = parseSpanishOrISODate(trendData[trendData.length - 1].date)!;

    return trendData.filter(item => {
      const itemDate = parseSpanishOrISODate(item.date)!;
      const diffTime = latestDate.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Guard against future items or negative day differences
      if (diffDays < 0) return false;

      if (timeFilter === 'day') return diffDays <= 1;
      if (timeFilter === 'week') return diffDays <= 7;
      if (timeFilter === 'month') return diffDays <= 30;
      if (timeFilter === '3months') return diffDays <= 90;
      return true; // 'all'
    });
  }, [trendData, timeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Volumen Total</CardTitle>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{totalCasos}</div>
            <p className="text-xs text-muted-foreground mt-1">Casos registrados históricos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Rendimiento Técnico</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Award className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground truncate" title={maxTons}>{maxTons}</div>
            <p className="text-xs text-muted-foreground mt-1">Tons con más registros</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Material Preferido</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground truncate" title={maxMaterial}>{maxMaterial}</div>
            <p className="text-xs text-muted-foreground mt-1">Más utilizado globalmente</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Peak de Ingresos</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <CalendarDays className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground truncate">{maxDate}</div>
            <p className="text-xs text-muted-foreground mt-1">Fecha con más solicitudes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* TOP CHART 1: Dynamic Temporal Trend */}
        <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg md:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-400 rounded-full" />
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Tendencia Temporal de Ingresos
            </h3>

            {/* Real-time Timeframe filter */}
            <div className="flex items-center bg-background/50 border border-border/50 p-1 rounded-xl shadow-sm self-start">
              {(['day', 'week', 'month', '3months', 'all'] as const).map((filter) => {
                const labels = { day: 'Día', week: 'Semana', month: 'Mes', '3months': '3 Meses', all: 'Todo' };
                return (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === filter
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                      }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20d489" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#20d489" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} />
                <Area type="monotone" dataKey="count" stroke="#20d489" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* MID CHART 1: Workflow States */}
        <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg mb-6 tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            Flujo de Trabajo por Estado
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* MID CHART 2: Materials Distribution */}
        <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
          <h3 className="font-bold text-lg mb-6 tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            Distribución de Materiales
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={materialData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} fill="#8884d8" paddingAngle={4} dataKey="value" label={{ fontSize: 11, fill: 'var(--foreground)' }}>
                  {materialData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* BOTTOM CHART: Technical Workload */}
        <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg md:col-span-2">
          <h3 className="font-bold text-lg mb-6 tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-500 rounded-full" />
            Carga de Trabajo Asignada (Tons)
          </h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tonsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
