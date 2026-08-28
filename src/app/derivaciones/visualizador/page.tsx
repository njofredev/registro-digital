import { getDerivaciones } from '../actions';
import DerivacionesVisualizadorClient from './DerivacionesVisualizadorClient';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Buscador de Derivaciones",
};

export default async function DerivacionesVisualizadorPage() {
  const registros = await getDerivaciones();
  
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 border border-blue-500/20">
          <Search className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscador de Derivaciones</h1>
          <p className="text-muted-foreground mt-1">Filtre el listado de casos de derivación en tiempo real.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm flex-1 flex flex-col min-h-0">
        <DerivacionesVisualizadorClient data={registros} />
      </div>
    </div>
  );
}
