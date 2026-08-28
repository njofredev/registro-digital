import { getNextDerivacionId, getDynamicOptions } from '../actions';
import DerivacionesIngresoForm from './DerivacionesIngresoForm';
import { FilePlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Nuevo Ingreso de Derivación",
};

export default async function DerivacionesIngresoPage() {
  const nextId = await getNextDerivacionId();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/20">
          <FilePlus className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Nueva Derivación</h1>
          <p className="text-muted-foreground mt-1">Complete la ficha técnica para dar de alta un nuevo caso de derivación clínica.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <DerivacionesIngresoForm nextId={nextId} options={options} />
      </div>
    </div>
  );
}
