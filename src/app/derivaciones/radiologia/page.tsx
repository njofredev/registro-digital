import { getRadiologiaDerivacionesRegistros } from './actions';
import RadiologiaDashboardClient from './RadiologiaDashboardClient';
import { Scan } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Métricas de Radiología - Derivaciones",
  description: "Métricas y estadísticas de radiología para derivaciones del Policlínico Tabancura",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RadiologiaDerivacionesPage() {
  const registros = await getRadiologiaDerivacionesRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/20">
          <Scan className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Métricas de Radiología</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Derivaciones
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Métricas, estadísticas y flujo de trabajo de radiografías de derivaciones.
          </p>
        </div>
      </div>

      <RadiologiaDashboardClient data={registros} />
    </div>
  );
}
