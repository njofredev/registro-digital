import { getDerivaciones, getDynamicOptions } from '../actions';
import DerivacionesExportarClient from './DerivacionesExportarClient';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Exportar Reportes - Derivaciones",
};

export default async function DerivacionesExportarPage() {
  const registros = await getDerivaciones();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/20">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Reportes de Derivaciones</h1>
          <p className="text-muted-foreground mt-1">Descarga el dataset completo o segmentado en formato CSV y planillas Excel.</p>
        </div>
      </div>
      
      <DerivacionesExportarClient data={registros} options={options} />
    </div>
  );
}
