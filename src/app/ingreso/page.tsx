import { getNextId, getDynamicOptions } from '../actions';
import IngresoForm from './IngresoForm';
import { FilePlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Nuevo Ingreso",
};

export default async function IngresoPage() {
  const nextId = await getNextId();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
          <FilePlus className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Trabajo</h1>
          <p className="text-muted-foreground mt-1">Complete la ficha técnica para dar de alta un nuevo caso clínico.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <IngresoForm nextId={nextId} options={options} />
      </div>
    </div>
  );
}
