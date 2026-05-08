import { getRegistros, getDynamicOptions } from '../actions';
import EdicionClient from './EdicionClient';
import { Edit } from 'lucide-react';

export const metadata = {
  title: "Edición",
};

export default async function EdicionPage() {
  const registros = await getRegistros();
  const options = await getDynamicOptions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
          <Edit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modificar Trabajo</h1>
          <p className="text-muted-foreground mt-1">Actualice parámetros técnicos o elimine registros del sistema.</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <EdicionClient data={registros} options={options} />
      </div>
    </div>
  );
}
