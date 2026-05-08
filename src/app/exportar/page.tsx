import { getRegistros, getDynamicOptions } from '../actions';
import ExportarClient from './ExportarClient';
import { Download } from 'lucide-react';

export const metadata = {
  title: "Exportar",
};

export default async function ExportarPage() {
  const registros = await getRegistros();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-500">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Datos</h1>
          <p className="text-muted-foreground mt-1">Genere y descargue reportes filtrados en formato Excel o CSV.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <ExportarClient data={registros} options={options} />
      </div>
    </div>
  );
}
