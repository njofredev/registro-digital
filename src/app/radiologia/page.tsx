import { getRadiologiaRegistros } from './actions';
import RadiologiaDashboardClient from './RadiologiaDashboardClient';
import { Scan } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard de Radiología",
  description: "Métricas y estadísticas de uso de radiografías del Policlínico Tabancura",
};

export default async function RadiologiaPage() {
  const registros = await getRadiologiaRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
          <Scan className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Radiología</h1>
          <p className="text-muted-foreground mt-1">
            Métricas, estadísticas y flujo de trabajo para radiografías.
          </p>
        </div>
      </div>

      <RadiologiaDashboardClient data={registros} />
    </div>
  );
}
