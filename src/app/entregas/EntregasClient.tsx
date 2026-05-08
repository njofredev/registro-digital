'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ESTADO_COLORS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CalendarOff } from 'lucide-react';

type Registro = any;

export default function EntregasClient({ data }: { data: Registro[] }) {
  const pendings = data
    .filter(r => r.estado !== 'Entregado')
    .sort((a, b) => {
      const dateA = new Date(a.fecha_entrega || '9999-12-31').getTime();
      const dateB = new Date(b.fecha_entrega || '9999-12-31').getTime();
      return dateA - dateB;
    });

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl flex-1 overflow-hidden shadow-lg animate-in fade-in duration-700 mt-6">
      <ScrollArea className="h-[600px] w-full">
        <Table>
          <TableHeader className="bg-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-semibold text-foreground/80 py-4 px-6">ID</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-4">Paciente</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-4">Fecha de Entrega</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-4">Estado Actual</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-4">Técnico (Tons)</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-4">Sucursal Destino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarOff className="h-8 w-8 text-muted-foreground/50" />
                    <p>No hay entregas pendientes en la agenda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pendings.map((r) => (
                <TableRow key={r.identificador} className="group hover:bg-muted/30 transition-colors border-border/20 cursor-pointer">
                  <TableCell className="font-semibold text-foreground/90 px-6 py-4">{r.identificador}</TableCell>
                  <TableCell className="font-medium py-4">{r.nombre_paciente}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
                      {r.fecha_entrega || 'Sin fecha'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className={`border-transparent font-medium px-2.5 py-1 ${ESTADO_COLORS[r.estado || ''] || ''}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70" />
                      {r.estado || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">{r.tons_a_cargo}</TableCell>
                  <TableCell className="py-4">
                    <span className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {r.sucursal || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
