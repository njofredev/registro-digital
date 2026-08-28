import { getDerivaciones, getDynamicOptions } from '../actions';
import DerivacionesEdicionClient from './DerivacionesEdicionClient';
import { Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Edición de Derivaciones",
};

export default async function DerivacionesEdicionPage() {
  const registros = await getDerivaciones();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500 border border-purple-500/20">
          <Edit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modificar Caso de Derivación</h1>
          <p className="text-muted-foreground mt-1">Actualice parámetros técnicos o elimine registros de derivación del sistema.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <DerivacionesEdicionClient data={registros} options={options} />
      </div>
    </div>
  );
}
