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
import { updateRegistro, deleteRegistro, addDynamicOption, removeDynamicOption, editDynamicOption } from '../actions';
import { Edit3, Trash2, ShieldAlert, Plus, FolderSync, PlusCircle, Trash, Pencil, Check, X } from 'lucide-react';

type Registro = any;

export default function EdicionClient({ data, options }: { data: Registro[]; options: any }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic catalogs state
  const [localOptions, setLocalOptions] = useState(options);
  const [activeCategory, setActiveCategory] = useState<'doctor' | 'tons_a_cargo' | 'sucursal' | 'material' | 'diseno' | 'bloques_usados' | 'estado'>('doctor');
  const [newOptionValue, setNewOptionValue] = useState('');

  // Custom non-blocking confirmation and editing states
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const selectedRecord = data.find(r => r.identificador === selectedId);

  // Sync state with props when server re-renders
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [selectedId, selectedRecord]);

  const optEstado = localOptions?.estado || [];
  const optDoctor = localOptions?.doctor || [];
  const optTons = localOptions?.tons_a_cargo || [];
  const optSucursal = localOptions?.sucursal || [];
  const optMaterial = localOptions?.material || [];
  const optDiseno = localOptions?.diseno || [];
  const optBloques = localOptions?.bloques_usados || [];

  const categoryLabels = {
    doctor: 'Doctores Tratantes',
    tons_a_cargo: 'Técnicos (Tons) a Cargo',
    sucursal: 'Sucursales',
    material: 'Materiales Clínicos',
    diseno: 'Diseños',
    bloques_usados: 'Bloques Usados',
    estado: 'Estados de Trabajo'
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateRegistro(selectedId, formData);
    setIsSubmitting(false);
    router.refresh();
    alert(`✅ Caso #${selectedId} actualizado con éxito!`);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setIsDeleting(true);
    try {
      await deleteRegistro(selectedId);
      setIsDeleting(false);
      setSelectedId('');
      setShowDeleteConfirm(false);
      router.refresh();
      alert('🗑️ Trabajo eliminado con éxito.');
    } catch (err: any) {
      console.error("Error in handleDelete client side:", err);
      alert(`❌ Error al eliminar el registro: ${err.message || "Error desconocido"}`);
      setIsDeleting(false);
    }
  };

  // Catalog Add/Remove actions
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim()) return;
    const val = newOptionValue.trim();
    console.log("handleAddOption called with:", val, "activeCategory:", activeCategory);
    try {
      const res = await addDynamicOption(activeCategory, val);
      console.log("addDynamicOption response:", res);
      if (res.success) {
        setLocalOptions(res.options);
        setNewOptionValue('');
        router.refresh();
        alert(`✅ "${val}" fue agregado con éxito.`);
      } else {
        alert(`❌ Error al agregar: ${res.error || "No se pudo guardar en el archivo"}`);
      }
    } catch (err: any) {
      console.error("Error in handleAddOption client side:", err);
      alert(`❌ Error de red o del servidor: ${err.message || "Error desconocido"}`);
    }
  };

  const handleRemoveOption = async (val: string) => {
    const categoryName = categoryLabels[activeCategory];
    console.log("handleRemoveOption called with:", val, "activeCategory:", activeCategory);
    try {
      const res = await removeDynamicOption(activeCategory, val);
      console.log("removeDynamicOption response:", res);
      if (res.success) {
        setLocalOptions(res.options);
        router.refresh();
        alert(`🗑️ "${val}" fue eliminado con éxito de ${categoryName}.`);
      } else {
        alert(`❌ Error al eliminar: ${res.error || "No se pudo actualizar el archivo"}`);
      }
    } catch (err: any) {
      console.error("Error in handleRemoveOption client side:", err);
      alert(`❌ Error de red o del servidor: ${err.message || "Error desconocido"}`);
    }
  };

  const handleEditOption = async (oldVal: string, newVal: string) => {
    if (!newVal.trim() || newVal.trim() === oldVal) {
      setEditingOption(null);
      return;
    }
    const val = newVal.trim();
    const categoryName = categoryLabels[activeCategory];
    console.log("handleEditOption called with oldVal:", oldVal, "newVal:", val, "activeCategory:", activeCategory);
    try {
      const res = await editDynamicOption(activeCategory, oldVal, val);
      console.log("editDynamicOption response:", res);
      if (res.success) {
        setLocalOptions(res.options);
        setEditingOption(null);
        router.refresh();
        alert(`✏️ "${oldVal}" fue cambiado a "${val}" con éxito.`);
      } else {
        alert(`❌ Error al editar: ${res.error || "No se pudo actualizar el archivo"}`);
      }
    } catch (err: any) {
      console.error("Error in handleEditOption client side:", err);
      alert(`❌ Error de red o del servidor: ${err.message || "Error desconocido"}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Selector de Caso */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Edit3 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Seleccionar Caso a Modificar</h2>
        <p className="text-muted-foreground mb-8 text-sm">Busque el identificador o paciente que desea editar en el sistema.</p>
        
        <div className="text-left space-y-3">
          <Label htmlFor="record-select" className="font-semibold text-xs uppercase tracking-wider">Identificador de Registro:</Label>
          <Select 
            value={selectedId ? String(selectedId) : ""}
            onValueChange={(val) => setSelectedId(val ? Number(val) : '')}
          >
            <SelectTrigger id="record-select" className="h-14 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-base shadow-sm focus-visible:ring-primary/50 text-left">
              <SelectValue placeholder="Seleccione un caso..." />
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
        <form onSubmit={handleUpdate} className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-10 shadow-lg space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
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
              <Select name="doctor" defaultValue={selectedRecord.doctor || ''}>
                <SelectTrigger id="doctor" className="h-12 w-full rounded-xl border border-border/50 bg-background/50 text-left">
                  <SelectValue placeholder="Seleccione doctor..." />
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

          <div className="space-y-3 pb-8">
            <Label htmlFor="asunto_detalles" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Observaciones Adicionales</Label>
            <Input id="asunto_detalles" name="asunto_detalles" defaultValue={selectedRecord.asunto_detalles || ''} className="h-12 w-full rounded-xl bg-background/50 border-border/50" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 gap-6">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Delete Case Button with non-blocking inline confirmation */}
              {showDeleteConfirm ? (
                <div className="flex items-center gap-3 bg-destructive/10 p-1.5 rounded-xl border border-destructive/20 w-full md:w-auto">
                  <span className="text-xs font-bold text-destructive px-2">¿Confirmar Caso #{selectedId}?</span>
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
                  Eliminar Caso
                </Button>
              )}
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-10 rounded-xl font-semibold shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              {isSubmitting ? 'Guardando cambios...' : 'Actualizar Información'}
            </Button>
          </div>
        </form>
      )}

      {/* 3. ADMINISTRADOR DE CATÁLOGOS DINÁMICOS */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2 text-foreground/90 border-b border-border/40 pb-4">
          <FolderSync className="h-5 w-5 text-primary" />
          Administración de Catálogos (Doctores, Técnicos, Sucursales, etc.)
        </h3>
        <p className="text-sm text-muted-foreground">Aquí puede personalizar las opciones que aparecen en todos los formularios del sistema. Añada nuevos elementos o elimine los existentes.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* List/Select Category */}
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Seleccionar Categoría:</Label>
            <div className="flex flex-col gap-1.5">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key as any);
                    setNewOptionValue('');
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List and Actions inside Category */}
          <div className="md:col-span-2 space-y-5 flex flex-col h-[350px]">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              Elementos de: <span className="text-foreground font-bold">{categoryLabels[activeCategory]}</span>
            </Label>

            {/* List scrollable box */}
            <div className="flex-1 border border-border/40 rounded-xl p-4 bg-background/30 overflow-y-auto space-y-2 no-scrollbar">
              {(localOptions[activeCategory] || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-4 text-center">No hay elementos registrados en esta categoría.</p>
              ) : (
                (localOptions[activeCategory] || []).map((val: string) => {
                  const isPending = pendingDelete === val;
                  const isEditing = editingOption === val;
                  
                  return (
                    <div key={val} className="flex items-center justify-between px-3 py-2 bg-card border border-border/30 rounded-lg hover:border-primary/20 transition-all">
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2 mr-4">
                          <Input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="h-9 py-1 px-3 bg-background/50 border-border/50 text-sm rounded-lg"
                            placeholder="Nuevo nombre..."
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handleEditOption(val, editingValue);
                            }}
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                            title="Guardar nombre"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingOption(null);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary/20 transition-all"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-medium transition-colors ${isPending ? "text-destructive font-semibold" : ""}`}>
                          {val} {isPending && <span className="text-xs font-normal ml-2">(¿Eliminar?)</span>}
                        </span>
                      )}
                      
                      {!isEditing && (
                        <div className="flex items-center gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPendingDelete(null);
                                  await handleRemoveOption(val);
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-md bg-destructive text-white hover:bg-destructive/90 transition-all"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPendingDelete(null);
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 transition-all"
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit Name Button (to the left of Delete button) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingOption(val);
                                  setEditingValue(val);
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                                title={`Editar nombre de ${val}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPendingDelete(val);
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                title={`Eliminar ${val}`}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Option Input Form */}
            <form onSubmit={handleAddOption} className="flex gap-3 pt-2">
              <Input
                type="text"
                placeholder={`Nuevo(a) ${categoryLabels[activeCategory].toLowerCase()}...`}
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                className="h-11 bg-background/50 border-border/50"
              />
              <Button type="submit" size="sm" className="h-11 px-5 rounded-xl font-bold gap-1 shadow-md">
                <PlusCircle className="h-4 w-4" />
                Agregar
              </Button>
            </form>

          </div>

        </div>
      </div>

    </div>
  );
}
