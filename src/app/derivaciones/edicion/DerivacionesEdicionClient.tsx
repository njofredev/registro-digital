'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { updateDerivacion, deleteDerivacion } from '../actions';
import { Edit3, Trash2, ShieldAlert, FolderSync, Check } from 'lucide-react';

const TOOTH_SVG_PATHS: Record<string, string> = {
  molar: "M28 22 C34 18, 44 24, 50 24 C56 24, 66 18, 72 22 C82 28, 80 48, 76 58 C72 68, 66 84, 58 84 C54 84, 52 74, 50 74 C48 74, 46 84, 42 84 C34 84, 28 68, 24 58 C20 48, 18 28, 28 22 Z",
  premolar: "M32 24 C38 20, 44 26, 50 26 C56 26, 62 20, 68 24 C76 28, 75 48, 72 58 C69 68, 62 82, 56 82 C53 82, 52 74, 50 74 C48 74, 47 82, 44 82 C38 82, 31 68, 28 58 C25 48, 24 28, 32 24 Z",
  canine: "M34 26 C42 16, 48 14, 50 14 C52 14, 58 16, 66 26 C74 36, 73 52, 69 62 C65 72, 57 84, 50 84 C43 84, 35 72, 31 62 C27 52, 26 36, 34 26 Z",
  incisor: "M32 24 C40 22, 60 22, 68 24 C74 26, 73 50, 69 60 C65 70, 57 86, 50 86 C43 86, 35 70, 31 60 C27 50, 26 26, 32 24 Z"
};

function getToothSvgPath(num: number) {
  if ([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(num)) return TOOTH_SVG_PATHS.molar;
  if ([4, 5, 12, 13, 20, 21, 28, 29].includes(num)) return TOOTH_SVG_PATHS.premolar;
  if ([6, 11, 22, 27].includes(num)) return TOOTH_SVG_PATHS.canine;
  return TOOTH_SVG_PATHS.incisor;
}

type Registro = any;

export default function DerivacionesEdicionClient({ data, options }: { data: Registro[]; options: any }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);

  const toggleTooth = (tooth: number) => {
    setSelectedTeeth(prev => 
      prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth].sort((a, b) => a - b)
    );
  };

  const selectedRecord = data.find(r => r.identificador === selectedId);

  useEffect(() => {
    setShowDeleteConfirm(false);
    if (selectedRecord) {
      const piezasStr = selectedRecord.piezas || '';
      const parsed = piezasStr ? piezasStr.split(',').map(Number).filter((n: number) => !isNaN(n)) : [];
      setSelectedTeeth(parsed);
    } else {
      setSelectedTeeth([]);
    }
  }, [selectedId, selectedRecord]);

  const optEstado = options?.estado || [];
  const optDoctor = ["Antonio Alvear"];
  const optTons = options?.tons_a_cargo || [];
  const optSucursal = options?.sucursal || [];
  const optMaterial = options?.material || [];
  const optDiseno = options?.diseno || [];
  const optBloques = options?.bloques_usados || [];

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateDerivacion(selectedId, formData);
    setIsSubmitting(false);
    if (res.success) {
      router.refresh();
      alert(`✅ Caso de derivación #${selectedId} actualizado con éxito!`);
    } else {
      alert(`❌ Error al actualizar: ${res.error || 'Error desconocido'}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setIsDeleting(true);
    try {
      const res = await deleteDerivacion(selectedId);
      setIsDeleting(false);
      if (res.success) {
        setSelectedId('');
        setShowDeleteConfirm(false);
        router.refresh();
        alert('🗑️ Derivación eliminada con éxito.');
      } else {
        alert(`❌ Error al eliminar: ${res.error || 'Error desconocido'}`);
      }
    } catch (err: any) {
      console.error("Error in handleDelete client side:", err);
      alert(`❌ Error al eliminar el registro: ${err.message || "Error desconocido"}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Selector de Caso */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Edit3 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Seleccionar Derivación a Modificar</h2>
        <p className="text-muted-foreground mb-8 text-sm">Busque el identificador o paciente de la derivación que desea editar.</p>
        
        <div className="text-left space-y-3">
          <Label htmlFor="record-select" className="font-semibold text-xs uppercase tracking-wider">Identificador de Registro:</Label>
          <Select 
            value={selectedId ? String(selectedId) : ""}
            onValueChange={(val) => setSelectedId(val ? Number(val) : '')}
          >
            <SelectTrigger id="record-select" className="h-14 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-base shadow-sm focus-visible:ring-primary/50 text-left">
              <SelectValue placeholder="Seleccione un caso de derivación..." />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50 max-h-[300px]">
              {data.map(r => (
                <SelectItem key={r.identificador} value={String(r.identificador)} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                  #{r.identificador} - Paciente: {r.nombre_paciente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Formulario de Edición */}
      {selectedRecord && (
        <form key={selectedRecord.identificador} onSubmit={handleUpdate} className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-10 shadow-lg space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha Ingreso</Label>
              <DatePicker name="fecha_ingreso" defaultValue={selectedRecord.fecha_ingreso || ''} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="estado" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Estado del Trabajo</Label>
              <Select name="estado" defaultValue={selectedRecord.estado || ''}>
                <SelectTrigger id="estado" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione estado..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optEstado.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="nombre_paciente" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Nombre Paciente</Label>
              <Input id="nombre_paciente" name="nombre_paciente" defaultValue={selectedRecord.nombre_paciente || ''} className="h-12 w-full rounded-xl bg-background/50 border-border/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border/40 pt-8">
            <div className="space-y-3">
              <Label htmlFor="doctor" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Doctor Tratante</Label>
              <Select name="doctor" defaultValue={selectedRecord.doctor || 'Antonio Alvear'}>
                <SelectTrigger id="doctor" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Antonio Alvear" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optDoctor.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="tons_a_cargo" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Técnico Asignado</Label>
              <Select name="tons_a_cargo" defaultValue={selectedRecord.tons_a_cargo || ''}>
                <SelectTrigger id="tons_a_cargo" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione técnico..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optTons.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="sucursal" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Sucursal</Label>
              <Select name="sucursal" defaultValue={selectedRecord.sucursal || ''}>
                <SelectTrigger id="sucursal" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione sucursal..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optSucursal.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha Diseño</Label>
              <DatePicker name="fecha_diseno" defaultValue={selectedRecord.fecha_diseno || ''} />
            </div>
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha Fresado</Label>
              <DatePicker name="fecha_fresado" defaultValue={selectedRecord.fecha_fresado || ''} />
            </div>
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha Entrega</Label>
              <DatePicker name="fecha_entrega" defaultValue={selectedRecord.fecha_entrega || ''} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border/40 pt-8">
            <div className="space-y-3">
              <Label htmlFor="material" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Material</Label>
              <Select name="material" defaultValue={selectedRecord.material || ''}>
                <SelectTrigger id="material" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione material..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optMaterial.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="diseno" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Diseño</Label>
              <Select name="diseno" defaultValue={selectedRecord.diseno || ''}>
                <SelectTrigger id="diseno" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione diseño..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optDiseno.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="bloques_usados" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Bloques Usados</Label>
              <Select name="bloques_usados" defaultValue={selectedRecord.bloques_usados || ''}>
                <SelectTrigger id="bloques_usados" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione bloques..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                  {optBloques.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Odontograma (Piezas Dentales Involucradas) */}
          <div className="space-y-4 border-t border-border/40 pt-8 pb-4">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <FolderSync className="h-4 w-4 text-primary" />
              Odontograma (Piezas Dentales Involucradas)
            </Label>
            <input type="hidden" name="piezas" value={selectedTeeth.join(',')} />
            
            <div className="space-y-6 bg-background/30 p-6 rounded-2xl border border-border/50">
              {/* Arcada Superior */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
                  Maxilar Superior (Arcada Superior)
                </span>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-2">
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedTeeth.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleTooth(num)}
                        className={`group relative w-12 h-14 md:w-14 md:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 border transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary shadow-md scale-105'
                            : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50'
                        }`}
                      >
                        <svg viewBox="0 0 100 100" className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/20 group-hover:text-muted-foreground/55'}`}>
                          <path d={getToothSvgPath(num)} fill="currentColor" stroke={isSelected ? "currentColor" : "none"} strokeWidth="2" />
                        </svg>
                        <span className="text-[10px] font-extrabold">{num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Arcada Inferior */}
              <div className="space-y-2 border-t border-border/30 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
                  Mandíbula Inferior (Arcada Inferior)
                </span>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-2">
                  {Array.from({ length: 16 }, (_, i) => i + 17).map((num) => {
                    const isSelected = selectedTeeth.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleTooth(num)}
                        className={`group relative w-12 h-14 md:w-14 md:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 border transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary shadow-md scale-105'
                            : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50'
                        }`}
                      >
                        <svg viewBox="0 0 100 100" className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/20 group-hover:text-muted-foreground/55'}`}>
                          <path d={getToothSvgPath(num)} fill="currentColor" stroke={isSelected ? "currentColor" : "none"} strokeWidth="2" />
                        </svg>
                        <span className="text-[10px] font-extrabold">{num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {selectedTeeth.length > 0 && (
                <div className="text-center text-xs text-muted-foreground border-t border-border/30 pt-4">
                  Piezas seleccionadas: <span className="font-bold text-primary">{selectedTeeth.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <Label htmlFor="asunto_detalles" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Observaciones Adicionales</Label>
            <Input id="asunto_detalles" name="asunto_detalles" defaultValue={selectedRecord.asunto_detalles || ''} className="h-12 w-full rounded-xl bg-background/50 border-border/50" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 gap-6">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-3 bg-destructive/10 p-1.5 rounded-xl border border-destructive/20 w-full md:w-auto">
                  <span className="text-xs font-bold text-destructive px-2">¿Confirmar eliminar Derivación #{selectedId}?</span>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete} 
                    disabled={isDeleting} 
                    className="h-9 px-4 rounded-lg font-bold text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)} 
                    className="h-9 px-4 rounded-lg font-bold text-xs bg-background/50 text-foreground"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="w-full md:w-auto h-12 px-6 rounded-xl font-semibold flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-none"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Derivación
                </Button>
              )}
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-10 rounded-xl font-semibold shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              {isSubmitting ? 'Guardando cambios...' : 'Actualizar Derivación'}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
