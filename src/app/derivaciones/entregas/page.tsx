import { getDerivaciones } from '../actions';
import DerivacionesEntregasClient from './DerivacionesEntregasClient';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Agenda de Entregas - Derivaciones",
};

export default async function DerivacionesEntregasPage() {
  const registros = await getDerivaciones();
  
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-500 border border-amber-500/20">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Entregas (Derivaciones)</h1>
          <p className="text-muted-foreground mt-1">Monitoreo de trabajos pendientes ordenados cronológicamente.</p>
        </div>
      </div>
      
      <DerivacionesEntregasClient data={registros} />
    </div>
  );
}
