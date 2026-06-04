'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDown, FileSpreadsheet, FileText, CheckCircle, Database, Calendar, User } from 'lucide-react';

type RadiologiaRecord = any;

const optSucursal = ["Externo", "Los Tribunales", "Vitacura"];
const optEstado = ["PENDIENTE", "INGRESADO", "PROCESANDO", "FINALIZADO", "ENVIADO"];

const MONTHS = [
  { value: 'all', label: 'Todos los Meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

export default function ReporteriaClient({ data }: { data: RadiologiaRecord[] }) {
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>(optSucursal);
  const [selectedEstados, setSelectedEstados] = useState<string[]>(optEstado);
  
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedRadiologo, setSelectedRadiologo] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const getRecordMonthAndYear = (dateStr: string) => {
    if (!dateStr) return { month: '', year: '' };
    const cleaned = dateStr.trim();
    const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return { month: match[2], year: match[1] };
    }
    return { month: '', year: '' };
  };

  // Generate dynamic lists from dataset
  const uniqueDoctors = useMemo(() => {
    const docs = new Set<string>();
    data.forEach(r => {
      if (r.doctor) {
        const clean = r.doctor.trim();
        if (clean) docs.add(clean);
      }
    });
    return Array.from(docs).sort();
  }, [data]);

  const uniqueRadiologos = useMemo(() => {
    const rads = new Set<string>();
    data.forEach(r => {
      if (r.radiologo_responsable) {
        const clean = r.radiologo_responsable.trim();
        if (clean) rads.add(clean);
      }
    });
    return Array.from(rads).sort();
  }, [data]);

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach(r => {
      const dateStr = r.fecha_toma_examen || r.fecha_entrega;
      const { year } = getRecordMonthAndYear(dateStr);
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const toggleSucursal = (s: string) => {
    setSelectedSucursales(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleEstado = (e: string) => {
    setSelectedEstados(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const filteredData = data.filter(r => {
    const matchSucursal = selectedSucursales.includes(r.sucursal || "") || (!r.sucursal && selectedSucursales.includes(""));
    const matchEstado = selectedEstados.includes(r.proceso || "PENDIENTE") || (!r.proceso && selectedEstados.includes("PENDIENTE"));
    
    const matchDoctor = selectedDoctor === 'all' || r.doctor?.trim() === selectedDoctor;
    const matchRadiologo = selectedRadiologo === 'all' || r.radiologo_responsable?.trim() === selectedRadiologo;
    
    const dateStr = r.fecha_toma_examen || r.fecha_entrega;
    const { month, year } = getRecordMonthAndYear(dateStr);
    
    const matchMonth = selectedMonth === 'all' || month === selectedMonth;
    const matchYear = selectedYear === 'all' || year === selectedYear;

    return matchSucursal && matchEstado && matchDoctor && matchRadiologo && matchMonth && matchYear;
  });

  const getExamenesList = (r: any) => {
    const list = [];
    if (r.rx_panoramica) list.push("Panorámica");
    if (r.analisis_cefalometrico) list.push("Cefalométrico");
    if (r.teleradiografia) list.push("Teleradiografía");
    if (r.tomografia_atm) list.push("ATM");
    if (r.tomografia_grupo_pieza) list.push("T. Grupo/Pieza");
    if (r.tomografia_arcada) list.push("T. Arcada");
    if (r.tomografia_total) list.push("T. Total");
    if (r.rx_retroalveolar_total) list.push("Retroalveolar");
    if (r.rx_mano) list.push("Mano");
    if (r.bitewing_bilateral) list.push("Bitewing");
    return list.join(" | ");
  };

  const getExportFilename = (ext: string) => {
    const parts = ['reporte_radiologia'];
    if (selectedRadiologo !== 'all') {
      parts.push('radiologo_' + selectedRadiologo.replace(/[^a-zA-Z0-9]/g, ''));
    }
    if (selectedDoctor !== 'all') {
      parts.push('doctor_' + selectedDoctor.replace(/[^a-zA-Z0-9]/g, ''));
    }
    if (selectedMonth !== 'all') {
      const monthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || selectedMonth;
      parts.push(monthLabel.toLowerCase());
    }
    if (selectedYear !== 'all') {
      parts.push(selectedYear);
    }
    return `${parts.join('_')}.${ext}`;
  };

  const downloadCSV = () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar');
    
    const headers = ["ID", "RUT", "Paciente", "Doctor", "Especialidad", "Sucursal", "Radiografías", "Fecha Toma", "Fecha Entrega", "Estado", "Radiologo"].join(',');
    const rows = filteredData.map(r => [
      r.id,
      r.rut || "",
      `"${r.nombre || ""} ${r.apellido_paterno || ""} ${r.apellido_materno || ""}"`,
      `"${r.doctor || ""}"`,
      `"${r.especialidad || ""}"`,
      `"${r.sucursal || ""}"`,
      `"${getExamenesList(r)}"`,
      r.fecha_toma_examen || "",
      r.fecha_entrega || "",
      r.proceso || "",
      `"${r.radiologo_responsable || ""}"`
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", getExportFilename('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = async () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar');
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte Radiología');
      
      const headers = ["ID", "RUT", "Paciente", "Doctor", "Especialidad", "Sucursal", "Radiografías", "Fecha Toma", "Fecha Entrega", "Estado", "Radiólogo Responsable"];
      worksheet.addRow(headers);
      
      filteredData.forEach(r => {
        worksheet.addRow([
          r.id,
          r.rut || "",
          `${r.nombre || ""} ${r.apellido_paterno || ""} ${r.apellido_materno || ""}`.trim(),
          r.doctor || "",
          r.especialidad || "",
          r.sucursal || "",
          getExamenesList(r),
          r.fecha_toma_examen || "",
          r.fecha_entrega || "",
          r.proceso || "",
          r.radiologo_responsable || ""
        ]);
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = getExportFilename('xlsx');
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
      doc.text("Registro Digital de Radiología - Reporte de Radiografías", 14, 21);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`, 14, 26);
      
      let filterDetails = `Radiografías Incluidas: ${filteredData.length}`;
      if (selectedRadiologo !== 'all') filterDetails += ` | Radiólogo: ${selectedRadiologo}`;
      if (selectedDoctor !== 'all') filterDetails += ` | Doctor: ${selectedDoctor}`;
      if (selectedMonth !== 'all') filterDetails += ` | Mes: ${MONTHS.find(m => m.value === selectedMonth)?.label}`;
      if (selectedYear !== 'all') filterDetails += ` | Año: ${selectedYear}`;
      
      doc.text(filterDetails, 14, 31);

      // Separator Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 34, 283, 34);

      // Map rows for the table
      const tableColumns = ["RUT", "Paciente", "Doctor", "Sucursal", "Radiografías", "Fecha Toma", "Entrega", "Estado", "Radiólogo"];
      const tableRows = filteredData.map(r => [
        r.rut || "-",
        `${r.nombre || ""} ${r.apellido_paterno || ""}`.trim() || "-",
        r.doctor || "-",
        r.sucursal || "-",
        getExamenesList(r) || "Ninguno",
        r.fecha_toma_examen || "-",
        r.fecha_entrega || "-",
        r.proceso || "-",
        r.radiologo_responsable || "-"
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 38,
        theme: 'striped',
        headStyles: {
          fillColor: [14, 165, 233], // Sky Blue
          textColor: [255, 255, 255],
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

      doc.save(getExportFilename('pdf'));
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el archivo PDF.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Filters: Sucursal */}
        <div className="space-y-5 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-slate-50/50 dark:bg-[#0e1936]/20 backdrop-blur-xl shadow-lg">
          <Label className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800/40">
            <CheckCircle className="h-5 w-5 text-sky-400" />
            Filtro por Sucursal
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {optSucursal.map((s: string) => (
              <label key={s} className="flex items-center gap-3 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedSucursales.includes(s)} 
                  onChange={() => toggleSucursal(s)} 
                  className="rounded-lg h-5 w-5 border-slate-300 dark:border-slate-850 text-sky-500 bg-white dark:bg-slate-900 focus:ring-sky-500/50 transition-all checked:bg-sky-500 cursor-pointer" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">{s}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Filters: Estado */}
        <div className="space-y-5 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-slate-50/50 dark:bg-[#0e1936]/20 backdrop-blur-xl shadow-lg">
          <Label className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800/40">
            <CheckCircle className="h-5 w-5 text-purple-400" />
            Filtro por Estado
          </Label>
          <div className="grid grid-cols-2 gap-4 max-h-40 overflow-y-auto no-scrollbar">
            {optEstado.map((e: string) => (
              <label key={e} className="flex items-center gap-3 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedEstados.includes(e)} 
                  onChange={() => toggleEstado(e)} 
                  className="rounded-lg h-5 w-5 border-slate-300 dark:border-slate-850 text-purple-500 bg-white dark:bg-slate-900 focus:ring-purple-500/50 transition-all checked:bg-purple-500 cursor-pointer" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">{e}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filters: Doctor / Radiólogo */}
        <div className="space-y-5 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-slate-50/50 dark:bg-[#0e1936]/20 backdrop-blur-xl shadow-lg md:col-span-1">
          <Label className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800/40">
            <User className="h-5 w-5 text-emerald-400" />
            Filtrar por Profesional
          </Label>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Radiólogo Responsable</label>
              <select
                value={selectedRadiologo}
                onChange={(e) => setSelectedRadiologo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Todos los Radiólogos</option>
                {uniqueRadiologos.map(name => (
                  <option key={name} value={name} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Doctor Derivador</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Todos los Doctores</option>
                {uniqueDoctors.map(name => (
                  <option key={name} value={name} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters: Período (Mes / Año) */}
        <div className="space-y-5 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-slate-50/50 dark:bg-[#0e1936]/20 backdrop-blur-xl shadow-lg md:col-span-1">
          <Label className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800/40">
            <Calendar className="h-5 w-5 text-amber-400" />
            Filtrar por Período
          </Label>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Mes de la Radiografía</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Año de la Radiografía</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Todos los Años</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>
 
      {/* Action Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-8 gap-6">
        <p className="font-semibold text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Database className="h-4 w-4 text-sky-400" />
          Radiografías filtradas listas para exportar: <span className="text-sky-400 font-extrabold text-base">{filteredData.length}</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button variant="outline" size="lg" onClick={downloadCSV} className="rounded-xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-[#0e1936]/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-2 h-12">
            <FileText className="h-4 w-4 text-slate-400" />
            Descargar CSV
          </Button>
          <Button variant="outline" size="lg" onClick={downloadExcel} className="rounded-xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-[#0e1936]/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-2 h-12">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Descargar Excel
          </Button>
          <Button size="lg" onClick={downloadPDF} className="rounded-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white gap-2 h-12 shadow-lg hover:shadow-sky-500/20 transition-all border-0">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
