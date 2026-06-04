import { getRadiologiaRegistros } from '../actions';
import RadiologiaClient from '../RadiologiaClient';
import { Scan } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Ingreso de Radiología",
  description: "Buscador y control interno de radiografías",
};

export default async function RadiologiaIngresoPage() {
  const registros = await getRadiologiaRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
          <Scan className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro Digital para Radiología</h1>
          <p className="text-muted-foreground mt-1">
            Buscador, registro y flujo de trabajo para radiografías del Policlínico Tabancura.
          </p>
        </div>
      </div>

      <RadiologiaClient initialData={registros} />
    </div>
  );
}
