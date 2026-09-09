import { getRadiologiaDerivacionesRegistros } from '../actions';
import ReporteriaClient from '../ReporteriaClient';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Reportería de Radiología - Derivaciones",
  description: "Filtre y exporte reportes en formatos Excel, CSV o PDF para control de derivaciones.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReporteriaRadiologiaDerivacionesPage() {
  const registros = await getRadiologiaDerivacionesRegistros();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/20">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Reportería de Radiología</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Derivaciones
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Genere y descargue reportes detallados y filtrados de radiografías de derivaciones.
          </p>
        </div>
      </div>

      <div className="bg-card/25 backdrop-blur-xl border border-border/30 rounded-2xl p-6 shadow-xl">
        <ReporteriaClient data={registros} />
      </div>
    </div>
  );
}
