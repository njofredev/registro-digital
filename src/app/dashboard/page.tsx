import { getRegistros } from '../actions';
import DashboardClient from './DashboardClient';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: "Métricas",
};

export default async function DashboardPage() {
  const registros = await getRegistros();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas del Laboratorio</h1>
          <p className="text-muted-foreground mt-1">Indicadores de rendimiento, materiales y carga de trabajo por técnico.</p>
        </div>
      </div>
      
      <DashboardClient data={registros} />
    </div>
  );
}
