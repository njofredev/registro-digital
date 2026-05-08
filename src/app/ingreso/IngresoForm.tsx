'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { Save, User, Activity, CalendarDays, Box, ClipboardList, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function IngresoForm({ nextId, options }: { nextId: number; options: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const optEstado = options?.estado || [];
  const optDoctor = options?.doctor || [];
  const optTons = options?.tons_a_cargo || [];
  const optSucursal = options?.sucursal || [];
  const optMaterial = options?.material || [];
  const optDiseno = options?.diseno || [];
  const optBloques = options?.bloques_usados || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createRegistro(formData);
    setIsSubmitting(false);
    form.reset();
    router.refresh(); 
    
    // Scroll smoothly to top to show success banner
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
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
