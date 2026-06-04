import { getRadiologiaRegistros } from '../actions';
import ReporteriaClient from './ReporteriaClient';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Reportería de Radiología",
  description: "Filtre y exporte reportes en formatos Excel, CSV o PDF para control interno.",
};

export default async function ReporteriaRadiologiaPage() {
  const registros = await getRadiologiaRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportería de Radiología</h1>
          <p className="text-muted-foreground mt-1">
            Genere y descargue reportes detallados y filtrados de radiografías.
          </p>
        </div>
      </div>

      <div className="bg-card/25 backdrop-blur-xl border border-border/30 rounded-2xl p-6 shadow-xl">
        <ReporteriaClient data={registros} />
      </div>
    </div>
  );
}
