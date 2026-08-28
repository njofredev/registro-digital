"use client";

import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ESTADO_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, User, MapPin, Wrench, Layers, FileText, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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

export default function DerivacionesVisualizadorClient({ data }: { data: Registro[] }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const deferredSearch = useDeferredValue(search);

  // Reset page when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, pageSize]);

  const filtered = useMemo(() => {
    return data.filter(r => 
      Object.values(r).some(v => 
        String(v).toLowerCase().includes(deferredSearch.toLowerCase())
      )
    );
  }, [data, deferredSearch]);

  const totalPages = useMemo(() => {
    if (pageSize === 'all' || filtered.length === 0) return 1;
    return Math.ceil(filtered.length / pageSize);
  }, [filtered.length, pageSize]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filtered;
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const startIndex = filtered.length === 0 ? 0 : pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = pageSize === 'all' ? filtered.length : Math.min(filtered.length, currentPage * pageSize);

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-700">
      {/* Header Bar with Search and Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar paciente, ID, sucursal, material..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-md border-border/50 h-11 rounded-xl focus-visible:ring-primary/50 shadow-sm transition-shadow"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground font-medium">Mostrar:</span>
          <div className="flex items-center bg-secondary/40 border border-border/40 p-1 rounded-xl gap-1">
            {[25, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  pageSize === size
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {size}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPageSize('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                pageSize === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-lg flex-1 flex flex-col min-h-0">
        <div className="flex-1 w-full overflow-auto max-h-[calc(100vh-280px)]">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold text-foreground/80 py-3 px-4 w-[10%] text-xs">ID</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[20%] text-xs">Fecha Ingreso</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[20%] text-xs">Estado</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[43%] text-xs">Paciente</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[7%] text-xs text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p>No se encontraron registros de derivación que coincidan con la búsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((r) => {
                  const isExpanded = expandedId === r.identificador;
                  return (
                    <React.Fragment key={r.identificador}>
                      <TableRow 
                        onClick={() => toggleExpand(r.identificador)}
                        className={`group transition-all duration-300 border-border/20 cursor-pointer hover:bg-primary/5 text-xs ${isExpanded ? 'bg-primary/5' : ''}`}
                      >
                        <TableCell className="font-semibold text-foreground/90 px-4 py-4">{r.identificador}</TableCell>
                        <TableCell className="text-muted-foreground py-4 px-2">{r.fecha_ingreso}</TableCell>
                        <TableCell className="py-4 px-2">
                          <Badge variant="secondary" className={`border-transparent font-medium px-2 py-0.5 text-[10px] ${ESTADO_COLORS[r.estado || ''] || ''}`}>
                            <span className="w-1 h-1 rounded-full bg-current mr-1 opacity-70" />
                            {r.estado || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground/90 py-4 px-2 truncate" title={r.nombre_paciente}>
                          {r.nombre_paciente}
                        </TableCell>
                        <TableCell className="py-4 px-2 text-right">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/20">
                          <TableCell colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                              {/* Column 1: Info General */}
                              <div className="space-y-4 bg-background/20 p-4 rounded-xl border border-border/30">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" /> Detalles del Caso
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Doctor Tratante:</span>
                                    <span className="font-semibold text-foreground/90">{r.doctor || 'Antonio Alvear'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Técnico Asignado:</span>
                                    <span className="font-semibold text-foreground/90">{r.tons_a_cargo || '-'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Sucursal:</span>
                                    <span className="font-semibold text-foreground/90">{r.sucursal || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 2: Info Técnica */}
                              <div className="space-y-4 bg-background/20 p-4 rounded-xl border border-border/30">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <Wrench className="h-3.5 w-3.5" /> Especificaciones Técnicas
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Material:</span>
                                    <span className="font-semibold text-foreground/90">{r.material || '-'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Diseño:</span>
                                    <span className="font-semibold text-foreground/90">{r.diseno || '-'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Bloques Usados:</span>
                                    <span className="font-semibold text-foreground/90">{r.bloques_usados || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 3: Fechas de Proceso */}
                              <div className="space-y-4 bg-background/20 p-4 rounded-xl border border-border/30">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" /> Cronología de Proceso
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Fecha Diseño:</span>
                                    <span className="font-semibold text-foreground/90">{r.fecha_diseno || '-'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Fecha Fresado:</span>
                                    <span className="font-semibold text-foreground/90">{r.fecha_fresado || '-'}</span>
                                  </div>
                                  <div className="flex justify-between py-1.5 border-b border-border/30">
                                    <span className="text-muted-foreground">Fecha Entrega:</span>
                                    <span className="font-semibold text-foreground/90">{r.fecha_entrega || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Odontograma Visual en Buscador */}
                              <div className="md:col-span-3 bg-background/20 p-4 rounded-xl border border-border/30 space-y-3 mt-2">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <Layers className="h-3.5 w-3.5" /> Odontograma (Piezas Dentales Involucradas)
                                </h4>
                                {r.piezas ? (
                                  <div className="space-y-4 bg-background/40 p-4 rounded-xl border border-border/50">
                                    {/* Upper arch */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block text-center">Maxilar Superior (Arcada Superior)</span>
                                      <div className="flex flex-wrap justify-center gap-1.5 py-1">
                                        {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
                                          const isSelected = r.piezas.split(',').map(Number).includes(num);
                                          return (
                                            <div
                                              key={num}
                                              className={`w-9 h-11 rounded-lg flex flex-col items-center justify-between p-1 border transition-all ${
                                                isSelected
                                                  ? 'bg-primary/20 border-primary text-primary shadow-sm scale-105'
                                                  : 'bg-card/30 border-border/30 text-muted-foreground/30'
                                              }`}
                                            >
                                              <svg viewBox="0 0 100 100" className={`w-5 h-5 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/15'}`}>
                                                <path d={getToothSvgPath(num)} fill="currentColor" />
                                              </svg>
                                              <span className={`text-[8px] font-black ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`}>{num}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Lower arch */}
                                    <div className="space-y-1 border-t border-border/20 pt-3">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block text-center">Mandíbula Inferior (Arcada Inferior)</span>
                                      <div className="flex flex-wrap justify-center gap-1.5 py-1">
                                        {Array.from({ length: 16 }, (_, i) => i + 17).map(num => {
                                          const isSelected = r.piezas.split(',').map(Number).includes(num);
                                          return (
                                            <div
                                              key={num}
                                              className={`w-9 h-11 rounded-lg flex flex-col items-center justify-between p-1 border transition-all ${
                                                isSelected
                                                  ? 'bg-primary/20 border-primary text-primary shadow-sm scale-105'
                                                  : 'bg-card/30 border-border/30 text-muted-foreground/30'
                                              }`}
                                            >
                                              <svg viewBox="0 0 100 100" className={`w-5 h-5 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/15'}`}>
                                                <path d={getToothSvgPath(num)} fill="currentColor" />
                                              </svg>
                                              <span className={`text-[8px] font-black ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`}>{num}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic p-2 text-center bg-background/10 rounded-lg">Ninguna pieza dental seleccionada para este caso.</p>
                                )}
                              </div>

                              {/* Row completo: Observaciones */}
                              <div className="md:col-span-3 bg-background/40 backdrop-blur-md p-4 rounded-xl border border-border/50 mt-2 space-y-2">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" /> Observaciones Adicionales
                                </h4>
                                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                  {r.asunto_detalles || <span className="text-muted-foreground italic">Sin observaciones registradas.</span>}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-border/50 bg-card/60 backdrop-blur-md px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-muted-foreground font-medium">
              Mostrando <span className="font-semibold text-foreground">{startIndex}</span> - <span className="font-semibold text-foreground">{endIndex}</span> de <span className="font-semibold text-foreground">{filtered.length}</span> casos
              {data.length !== filtered.length && (
                <span className="text-muted-foreground/70 ml-1">(filtrados de {data.length} totales)</span>
              )}
            </div>

            {pageSize !== 'all' && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Primera página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-3 py-1 bg-secondary/50 border border-border/30 rounded-lg font-semibold text-foreground/90">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
