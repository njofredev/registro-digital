import { getRegistros } from '../actions';
import VisualizadorClient from './VisualizadorClient';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Buscador",
};

export default async function VisualizadorPage() {
  const registros = await getRegistros();
  
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
          <Search className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscador de Casos</h1>
          <p className="text-muted-foreground mt-1">Filtre el listado de trabajos históricos en tiempo real.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm flex-1 flex flex-col min-h-0">
        <VisualizadorClient data={registros} />
      </div>
    </div>
  );
}
