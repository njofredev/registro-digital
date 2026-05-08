"use client";

import { useState, useMemo, useDeferredValue } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ESTADO_COLORS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

type Registro = any;

export default function VisualizadorClient({ data }: { data: Registro[] }) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    return data.filter(r => 
      Object.values(r).some(v => 
        String(v).toLowerCase().includes(deferredSearch.toLowerCase())
      )
    );
  }, [data, deferredSearch]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar paciente, ID, sucursal..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-md border-border/50 h-12 rounded-xl focus-visible:ring-primary/50 shadow-sm transition-shadow"
        />
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="h-[calc(100vh-230px)] w-full overflow-auto">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold text-foreground/80 py-3 px-4 w-[6%] text-xs">ID</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[11%] text-xs">Fecha Ingreso</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[10%] text-xs">Estado</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[18%] text-xs">Paciente</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[12%] text-xs">Doctor</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[11%] text-xs">Técnico (Tons)</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[10%] text-xs">Sucursal</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[10%] text-xs">Material</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[14%] text-xs">Diseño</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3 px-2 w-[8%] text-xs">Bloques</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p>No se encontraron registros que coincidan con la búsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.identificador} className="group hover:bg-primary/5 transition-all duration-300 border-border/20 cursor-pointer hover:shadow-sm text-xs">
                    <TableCell className="font-semibold text-foreground/90 px-4 py-3">{r.identificador}</TableCell>
                    <TableCell className="text-muted-foreground py-3 px-2">{r.fecha_ingreso}</TableCell>
                    <TableCell className="py-3 px-2">
                      <Badge variant="secondary" className={`border-transparent font-medium px-2 py-0.5 text-[10px] ${ESTADO_COLORS[r.estado || ''] || ''}`}>
                        <span className="w-1 h-1 rounded-full bg-current mr-1 opacity-70" />
                        {r.estado || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium py-3 px-2 truncate" title={r.nombre_paciente}>{r.nombre_paciente}</TableCell>
                    <TableCell className="text-muted-foreground py-3 px-2 truncate" title={r.doctor}>{r.doctor}</TableCell>
                    <TableCell className="py-3 px-2">
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm font-medium border-border/50 text-foreground/70 px-1.5 py-0 text-[10px] truncate max-w-full block" title={r.tons_a_cargo || ''}>
                        {r.tons_a_cargo || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 px-2 truncate" title={r.sucursal}>
                      {r.sucursal ? r.sucursal.replace('Sucursal ', '') : '-'}
                    </TableCell>
                    <TableCell className="text-foreground/80 py-3 px-2 truncate" title={r.material}>{r.material || '-'}</TableCell>
                    <TableCell className="text-muted-foreground py-3 px-2 truncate" title={r.diseno}>
                      {r.diseno ? r.diseno.replace('Diseñado por ', 'Por ') : '-'}
                    </TableCell>
                    <TableCell className="py-3 px-2">
                      {r.bloques_usados ? (
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-medium px-1.5 py-0 text-[10px]">
                          {r.bloques_usados}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
