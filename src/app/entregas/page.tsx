import { getRegistros } from '../actions';
import EntregasClient from './EntregasClient';
import { CalendarClock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Entregas",
};

export default async function EntregasPage() {
  const registros = await getRegistros();
  
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-500">
          <CalendarClock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Próximas Entregas</h1>
          <p className="text-muted-foreground mt-1">Agenda de despachos pendientes organizada cronológicamente.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm flex-1 flex flex-col min-h-0">
        <EntregasClient data={registros} />
      </div>
    </div>
  );
}
