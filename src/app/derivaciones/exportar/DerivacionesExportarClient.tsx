'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDown, FileSpreadsheet, FileText, CheckCircle, Database } from 'lucide-react';

type Registro = any;

export default function DerivacionesExportarClient({ data, options }: { data: Registro[]; options: any }) {
  const optSucursal = options?.sucursal || [];
  const optEstado = options?.estado || [];

  const [selectedSucursales, setSelectedSucursales] = useState<string[]>(optSucursal);
  const [selectedEstados, setSelectedEstados] = useState<string[]>(optEstado);

  const toggleSucursal = (s: string) => {
    setSelectedSucursales(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleEstado = (e: string) => {
    setSelectedEstados(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const filteredData = data.filter(r => 
    (selectedSucursales.includes(r.sucursal) || (!r.sucursal && selectedSucursales.length > 0)) &&
    (selectedEstados.includes(r.estado) || (!r.estado && selectedEstados.length > 0))
  );

  const downloadCSV = () => {
    if (filteredData.length === 0) return alert('No hay datos de derivaciones para exportar');
    
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "derivaciones_reporte.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = async () => {
    if (filteredData.length === 0) return alert('No hay datos de derivaciones para exportar');
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Derivaciones');
      
      const headers = Object.keys(filteredData[0]);
      worksheet.addRow(headers);
      
      filteredData.forEach(r => {
        worksheet.addRow(Object.values(r));
      });
      
      // Styling header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' }
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "derivaciones_reporte.xlsx";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error al generar archivo Excel.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-700">
      
      {/* Columna Filtros */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Filtro por Sucursal */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-base mb-4 text-foreground/90 border-b border-border/40 pb-3 flex items-center justify-between">
            <span>Filtrar por Sucursales</span>
            <span className="text-xs text-muted-foreground font-normal">
              {selectedSucursales.length} seleccionadas
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {optSucursal.map((s: string) => {
              const active = selectedSucursales.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSucursal(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-primary/20 border-primary text-primary shadow-sm'
                      : 'bg-background/40 border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro por Estado */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-base mb-4 text-foreground/90 border-b border-border/40 pb-3 flex items-center justify-between">
            <span>Filtrar por Estados</span>
            <span className="text-xs text-muted-foreground font-normal">
              {selectedEstados.length} seleccionados
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {optEstado.map((e: string) => {
              const active = selectedEstados.includes(e);
              return (
                <button
                  key={e}
                  onClick={() => toggleEstado(e)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-primary/20 border-primary text-primary shadow-sm'
                      : 'bg-background/40 border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Columna Acciones / Preview */}
      <div className="space-y-6">
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-1 text-foreground">Generar Archivos</h3>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
              Exporta los datos de derivaciones procesados listos para planillas clínicas o importaciones en otros sistemas.
            </p>

            <div className="bg-secondary/40 border border-border/40 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Total disponible:</span>
                <span className="font-semibold">{data.length} casos</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Coincidencias filtro:</span>
                <span className="font-bold text-primary">{filteredData.length} casos</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={downloadExcel} 
              disabled={filteredData.length === 0}
              className="w-full h-12 rounded-xl font-semibold gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Descargar Excel (.xlsx)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadCSV}
              disabled={filteredData.length === 0}
              className="w-full h-12 rounded-xl font-semibold gap-2 border-border/50 hover:bg-secondary/50"
            >
              <FileText className="w-4 h-4" />
              Descargar Plano (.csv)
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
