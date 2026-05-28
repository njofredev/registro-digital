'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { createRegistro } from '../actions';
import { Save, User, Activity, CalendarDays, Box, ClipboardList, Check, AlertCircle } from 'lucide-react';
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

export default function IngresoForm({ nextId, options }: { nextId: number; options: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const optEstado = options?.estado || [];
  const optDoctor = options?.doctor || [];
  const optTons = options?.tons_a_cargo || [];
  const optSucursal = options?.sucursal || [];
  const optMaterial = options?.material || [];
  const optDiseno = options?.diseno || [];
  const optBloques = options?.bloques_usados || [];

  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);

  const toggleTooth = (tooth: number) => {
    setSelectedTeeth(prev => 
      prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setShowSuccess(false);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const result = await createRegistro(formData);

      if (result.success) {
        form.reset();
        setSelectedTeeth([]);
        router.refresh(); 
        
        // Scroll smoothly to top to show success banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setErrorMsg(result.error || 'Ocurrió un error inesperado al guardar.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error("Exception during createRegistro:", err);
      setErrorMsg('No se pudo conectar con el servidor para guardar el caso.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
      
      {/* Banner de Éxito */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="bg-emerald-500/20 p-2 rounded-full">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold">¡Registro Exitoso!</h4>
            <p className="text-sm opacity-90">El nuevo caso clínico ha sido ingresado al sistema correctamente.</p>
          </div>
        </div>
      )}

      {/* Banner de Error */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="bg-destructive/20 p-2 rounded-full">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold">Error al Registrar</h4>
            <p className="text-sm opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Sección: Identificación y Estado */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6 text-foreground/90 border-b border-border/40 pb-4">
          <Activity className="h-5 w-5 text-primary" />
          Apertura de Caso Clínico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label htmlFor="identificador" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">N° Identificador</Label>
            <Input id="identificador" name="identificador" type="number" defaultValue={nextId} required readOnly className="bg-muted/50 border-transparent text-lg font-bold h-12 w-full rounded-xl shadow-inner pointer-events-none" />
          </div>
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha de ingreso</Label>
            <DatePicker name="fecha_ingreso" defaultValue={today} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="estado" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Estado inicial</Label>
            <Select name="estado">
              <SelectTrigger id="estado" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione estado..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optEstado.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sección: Actores */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6 text-foreground/90 border-b border-border/40 pb-4">
          <User className="h-5 w-5 text-blue-500" />
          Información de Participantes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label htmlFor="nombre_paciente" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Nombre paciente</Label>
            <Input id="nombre_paciente" name="nombre_paciente" placeholder="Ej. Juan Pérez" className="h-12 w-full rounded-xl bg-background/50 border-border/50 focus:border-blue-500 shadow-sm" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="doctor" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Doctor Tratante</Label>
            <Select name="doctor">
              <SelectTrigger id="doctor" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione doctor..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optDoctor.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="tons_a_cargo" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Técnico (Tons) a Cargo</Label>
            <Select name="tons_a_cargo">
              <SelectTrigger id="tons_a_cargo" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione técnico..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optTons.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sección: Fechas Técnicas */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6 text-foreground/90 border-b border-border/40 pb-4">
          <CalendarDays className="h-5 w-5 text-purple-500" />
          Planificación y Tiempos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha de Diseño</Label>
            <DatePicker name="fecha_diseno" />
          </div>
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha de Fresado</Label>
            <DatePicker name="fecha_fresado" />
          </div>
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Fecha de Entrega</Label>
            <DatePicker name="fecha_entrega" />
          </div>
        </div>
      </div>

      {/* Sección: Detalles Materiales */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6 text-foreground/90 border-b border-border/40 pb-4">
          <Box className="h-5 w-5 text-amber-500" />
          Especificaciones Técnicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <Label htmlFor="sucursal" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Sucursal</Label>
            <Select name="sucursal">
              <SelectTrigger id="sucursal" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione sucursal..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optSucursal.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="material" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Material Clínico</Label>
            <Select name="material">
              <SelectTrigger id="material" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione material..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optMaterial.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="bloques_usados" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Bloques Usados</Label>
            <Select name="bloques_usados">
              <SelectTrigger id="bloques_usados" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione bloques..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optBloques.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="diseno" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Diseño</Label>
            <Select name="diseno">
              <SelectTrigger id="diseno" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 focus-visible:ring-primary/50 shadow-sm text-left">
                <SelectValue placeholder="Seleccione diseño..." />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-xl shadow-xl z-50">
                {optDiseno.map((opt: string) => (
                  <SelectItem key={opt} value={opt} className="py-3 px-4 focus:bg-primary/20 focus:text-foreground font-medium cursor-pointer">
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
            <Activity className="h-4 w-4 text-primary" />
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

        <div className="space-y-3">
          <Label htmlFor="asunto_detalles" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Detalles y Observaciones
          </Label>
          <Input id="asunto_detalles" name="asunto_detalles" placeholder="Añade instrucciones especiales o notas del caso..." className="h-12 w-full rounded-xl bg-background/50 border-border/50 focus:border-amber-500 shadow-sm" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto px-10 h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-primary/20 transition-all gap-2">
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Registrando en sistema...' : 'Guardar Nuevo Registro'}
        </Button>
      </div>
    </form>
  );
}
