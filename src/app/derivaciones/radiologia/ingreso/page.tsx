import { getRadiologiaDerivacionesRegistros } from '../actions';
import RadiologiaDerivacionesClient from '../RadiologiaDerivacionesClient';
import { Scan } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Ingreso de Radiología - Derivaciones",
  description: "Buscador y control interno de radiografías para derivaciones",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RadiologiaDerivacionesIngresoPage() {
  const registros = await getRadiologiaDerivacionesRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/20">
          <Scan className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Registro Digital de Radiología</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Derivaciones
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Buscador, registro y flujo de trabajo de radiografías derivadas del Policlínico Tabancura.
          </p>
        </div>
      </div>

      <RadiologiaDerivacionesClient initialData={registros} />
    </div>
  );
}
