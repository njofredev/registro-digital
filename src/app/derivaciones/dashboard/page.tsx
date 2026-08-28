import { getDerivaciones } from '../actions';
import DerivacionesDashboardClient from './DerivacionesDashboardClient';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Métricas de Derivaciones",
};

export default async function DerivacionesDashboardPage() {
  const registros = await getDerivaciones();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Derivaciones</h1>
          <p className="text-muted-foreground mt-1">Indicadores de rendimiento, materiales y carga de trabajo de derivaciones.</p>
        </div>
      </div>
      
      <DerivacionesDashboardClient data={registros} />
    </div>
  );
}
