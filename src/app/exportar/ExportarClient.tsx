'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDown, FileSpreadsheet, FileText, CheckCircle, Database } from 'lucide-react';

type Registro = any;

export default function ExportarClient({ data, options }: { data: Registro[]; options: any }) {
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
    if (filteredData.length === 0) return alert('No hay datos para exportar');
    
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lab_digital_reporte.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = async () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar');
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');
      
      const headers = Object.keys(filteredData[0]);
      worksheet.addRow(headers);
      
      filteredData.forEach(r => {
        worksheet.addRow(Object.values(r));
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lab_digital_reporte.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Hubo un error al generar el archivo Excel.");
    }
  };

  const downloadPDF = async () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar');

    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Clean Title Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(11, 17, 32); // Deep Navy
      doc.text("Policlínico Tabancura", 14, 15);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Muted slate
      doc.text("Registro Digital de Laboratorio - Reporte de Casos", 14, 21);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`, 14, 26);
      doc.text(`Casos Incluidos: ${filteredData.length}`, 14, 31);

      // Separator Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 34, 283, 34);

      // Map rows for the table
      const tableColumns = ["ID", "Fecha Ingreso", "Estado", "Paciente", "Doctor", "Técnico (Tons)", "Sucursal", "Material"];
      const tableRows = filteredData.map(r => [
        r.identificador,
        r.fecha_ingreso || "-",
        r.estado || "-",
        r.nombre_paciente || "-",
        r.doctor || "-",
        r.tons_a_cargo || "-",
        r.sucursal || "-",
        r.material || "-"
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 38,
        theme: 'striped',
        headStyles: {
          fillColor: [32, 212, 137], // Mint Green (#20d489)
          textColor: [11, 17, 32], // Deep Navy
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 }
      });

      doc.save(`reporte_lab_tabancura_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el archivo PDF.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Filters: Sucursal */}
        <div className="space-y-5 border border-border/50 p-6 rounded-2xl bg-card/40 backdrop-blur-xl shadow-lg">
          <Label className="text-base font-bold flex items-center gap-2 text-foreground/90 pb-2 border-b border-border/40">
            <CheckCircle className="h-5 w-5 text-primary" />
            Filtro por Sucursal
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {optSucursal.map((s: string) => (
              <label key={s} className="flex items-center gap-3 cursor-pointer group hover:text-foreground transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedSucursales.includes(s)} 
                  onChange={() => toggleSucursal(s)} 
                  className="rounded-lg h-5 w-5 border-border/50 text-primary bg-background/50 focus:ring-primary/50 transition-all checked:bg-primary cursor-pointer" 
                />
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{s}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Filters: Estado */}
        <div className="space-y-5 border border-border/50 p-6 rounded-2xl bg-card/40 backdrop-blur-xl shadow-lg">
          <Label className="text-base font-bold flex items-center gap-2 text-foreground/90 pb-2 border-b border-border/40">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Filtro por Estado
          </Label>
          <div className="grid grid-cols-2 gap-4 max-h-40 overflow-y-auto no-scrollbar">
            {optEstado.map((e: string) => (
              <label key={e} className="flex items-center gap-3 cursor-pointer group hover:text-foreground transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedEstados.includes(e)} 
                  onChange={() => toggleEstado(e)} 
                  className="rounded-lg h-5 w-5 border-border/50 text-blue-500 bg-background/50 focus:ring-blue-500/50 transition-all checked:bg-blue-500 cursor-pointer" 
                />
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{e}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between border-t border-border/40 pt-8 gap-6">
        <p className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
          <Database className="h-4 w-4 text-primary" />
          Casos filtrados listos para exportar: <span className="text-primary font-extrabold text-base">{filteredData.length}</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button variant="outline" size="lg" onClick={downloadCSV} className="rounded-xl border-border/50 font-bold bg-background/40 hover:bg-secondary/40 gap-2 h-12">
            <FileText className="h-4 w-4 text-slate-400" />
            Descargar CSV
          </Button>
          <Button variant="outline" size="lg" onClick={downloadExcel} className="rounded-xl border-border/50 font-bold bg-background/40 hover:bg-secondary/40 gap-2 h-12">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Descargar Excel
          </Button>
          <Button size="lg" onClick={downloadPDF} className="rounded-xl font-bold gap-2 h-12 shadow-lg hover:shadow-primary/20 transition-all">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
