'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Plus, Trash2, Edit, Calendar, CheckSquare, User, FileText, CheckCircle, Mail, MapPin, Stethoscope, Activity, Info, Edit3, Scan, X } from 'lucide-react';
import { createRadiologiaDerivacionRegistro, updateRadiologiaDerivacionRegistro, deleteRadiologiaDerivacionRegistro } from './actions';

const getMonthName = (dateStr: string | null) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^\d{4}-(\d{2})-\d{2}/);
  if (match) {
    const monthNum = match[1];
    const months = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    return months[monthNum as keyof typeof months] || null;
  }
  return null;
};


export default function RadiologiaDerivacionesClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('todos');
  const [filterProceso, setFilterProceso] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [filterAño, setFilterAño] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;


  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSucursal, filterProceso, filterMes, filterAño, filterFecha]);

  const hasActiveFilters = search !== '' || filterSucursal !== 'todos' || filterProceso !== 'todos' || filterMes !== 'todos' || filterAño !== 'todos' || filterFecha !== '';

  const handleClearFilters = () => {
    setSearch('');
    setFilterSucursal('todos');
    setFilterProceso('todos');
    setFilterMes('todos');
    setFilterAño('todos');
    setFilterFecha('');
  };



  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    edad: '',
    fecha_nacimiento: '',
    doctor: '',
    especialidad: '',
    dg_clinico: '',
    sucursal: '',
    observaciones: '',
    fecha_toma_examen: '',
    observaciones_operador: '',
    rx_panoramica: false,
    analisis_cefalometrico: false,
    teleradiografia: false,
    tomografia_atm: false,
    tomografia_grupo_pieza: false,
    tomografia_arcada: false,
    tomografia_total: false,
    rx_retroalveolar_total: false,
    rx_mano: false,
    bitewing_bilateral: false,
    fecha_entrega: '',
    radiologo_responsable: '',
    proceso: 'PENDIENTE',
    correo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dropdown options
  const sucursales = useMemo(() => {
    const set = new Set(data.map(d => d.sucursal).filter(Boolean));
    return Array.from(set);
  }, [data]);

  const procesos = useMemo(() => {
    const set = new Set(data.map(d => d.proceso).filter(Boolean));
    return Array.from(set);
  }, [data]);

  // Statistics
  const stats = useMemo(() => {
    const total = data.length;
    const finalizados = data.filter(d => d.proceso === 'FINALIZADO' || d.proceso === 'ENVIADO').length;
    const pendientes = total - finalizados;
    return { total, finalizados, pendientes };
  }, [data]);

  // Unique years list
  const years = useMemo(() => {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.fecha_toma_examen) {
        const match = item.fecha_toma_examen.match(/^(\d{4})/);
        if (match) set.add(match[1]);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Filtering data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const rutStr = (item.rut || '').toLowerCase();
      const nombreStr = `${item.nombre || ''} ${item.apellido_paterno || ''} ${item.apellido_materno || ''}`.toLowerCase();
      const docStr = (item.doctor || '').toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch = rutStr.includes(query) || nombreStr.includes(query) || docStr.includes(query);
      const matchesSucursal = filterSucursal === 'todos' || item.sucursal === filterSucursal;
      const matchesProceso = filterProceso === 'todos' || item.proceso === filterProceso;
      const matchesMes = filterMes === 'todos' ||
        (filterMes === 'sin_fecha' && !item.fecha_toma_examen) ||
        (getMonthName(item.fecha_toma_examen) === filterMes);

      const itemYear = item.fecha_toma_examen ? item.fecha_toma_examen.split('-')[0] : '';
      const matchesAño = filterAño === 'todos' || itemYear === filterAño;
      const matchesFecha = !filterFecha || item.fecha_toma_examen === filterFecha;

      return matchesSearch && matchesSucursal && matchesProceso && matchesMes && matchesAño && matchesFecha;
    });
  }, [data, search, filterSucursal, filterProceso, filterMes, filterAño, filterFecha]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setIsReadOnlyMode(false);
    setCurrentId(null);
    setForm({
      rut: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      edad: '',
      fecha_nacimiento: '',
      doctor: '',
      especialidad: '',
      dg_clinico: '',
      sucursal: '',
      observaciones: '',
      fecha_toma_examen: '',
      observaciones_operador: '',
      rx_panoramica: false,
      analisis_cefalometrico: false,
      teleradiografia: false,
      tomografia_atm: false,
      tomografia_grupo_pieza: false,
      tomografia_arcada: false,
      tomografia_total: false,
      rx_retroalveolar_total: false,
      rx_mano: false,
      bitewing_bilateral: false,
      fecha_entrega: '',
      radiologo_responsable: '',
      proceso: 'PENDIENTE',
      correo: '',
    });
    setErrorMessage('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditMode(true);
    setIsReadOnlyMode(false);
    setCurrentId(item.id);
    setForm({
      rut: item.rut || '',
      nombre: item.nombre || '',
      apellido_paterno: item.apellido_paterno || '',
      apellido_materno: item.apellido_materno || '',
      edad: item.edad !== null ? String(item.edad) : '',
      fecha_nacimiento: item.fecha_nacimiento || '',
      doctor: item.doctor || '',
      especialidad: item.especialidad || '',
      dg_clinico: item.dg_clinico || '',
      sucursal: item.sucursal || '',
      observaciones: item.observaciones || '',
      fecha_toma_examen: item.fecha_toma_examen || '',
      observaciones_operador: item.observaciones_operador || '',
      rx_panoramica: !!item.rx_panoramica,
      analisis_cefalometrico: !!item.analisis_cefalometrico,
      teleradiografia: !!item.teleradiografia,
      tomografia_atm: !!item.tomografia_atm,
      tomografia_grupo_pieza: !!item.tomografia_grupo_pieza,
      tomografia_arcada: !!item.tomografia_arcada,
      tomografia_total: !!item.tomografia_total,
      rx_retroalveolar_total: !!item.rx_retroalveolar_total,
      rx_mano: !!item.rx_mano,
      bitewing_bilateral: !!item.bitewing_bilateral,
      fecha_entrega: item.fecha_entrega || '',
      radiologo_responsable: item.radiologo_responsable || '',
      proceso: item.proceso || 'PENDIENTE',
      correo: item.correo || '',
    });
    setErrorMessage('');
    setIsOpen(true);
  };

  const handleOpenView = (item: any) => {
    setIsEditMode(false);
    setIsReadOnlyMode(true);
    setCurrentId(item.id);
    setForm({
      rut: item.rut || '',
      nombre: item.nombre || '',
      apellido_paterno: item.apellido_paterno || '',
      apellido_materno: item.apellido_materno || '',
      edad: item.edad !== null ? String(item.edad) : '',
      fecha_nacimiento: item.fecha_nacimiento || '',
      doctor: item.doctor || '',
      especialidad: item.especialidad || '',
      dg_clinico: item.dg_clinico || '',
      sucursal: item.sucursal || '',
      observaciones: item.observaciones || '',
      fecha_toma_examen: item.fecha_toma_examen || '',
      observaciones_operador: item.observaciones_operador || '',
      rx_panoramica: !!item.rx_panoramica,
      analisis_cefalometrico: !!item.analisis_cefalometrico,
      teleradiografia: !!item.teleradiografia,
      tomografia_atm: !!item.tomografia_atm,
      tomografia_grupo_pieza: !!item.tomografia_grupo_pieza,
      tomografia_arcada: !!item.tomografia_arcada,
      tomografia_total: !!item.tomografia_total,
      rx_retroalveolar_total: !!item.rx_retroalveolar_total,
      rx_mano: !!item.rx_mano,
      bitewing_bilateral: !!item.bitewing_bilateral,
      fecha_entrega: item.fecha_entrega || '',
      radiologo_responsable: item.radiologo_responsable || '',
      proceso: item.proceso || 'PENDIENTE',
      correo: item.correo || '',
    });
    setErrorMessage('');
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (searchParams.get('ingreso') === 'true') {
      handleOpenCreate();
      const params = new URLSearchParams(searchParams.toString());
      params.delete('ingreso');
      router.replace(`/derivaciones/radiologia?${params.toString()}`);
    }
  }, [searchParams]);

  const handleDelete = async (id: number) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Estás seguro de que deseas eliminar este registro de radiología de derivaciones?')) return;
    const res = await deleteRadiologiaDerivacionRegistro(id);
    if (res.success) {
      setData(prev => prev.filter(d => d.id !== id));
    } else {
      if (typeof window !== 'undefined') window.alert('Error al eliminar: ' + res.error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Prepare payload
    const payload = {
      ...form,
      rx_panoramica: form.rx_panoramica ? 1 : null,
      analisis_cefalometrico: form.analisis_cefalometrico ? 1 : null,
      teleradiografia: form.teleradiografia ? 1 : null,
      tomografia_atm: form.tomografia_atm ? 1 : null,
      tomografia_grupo_pieza: form.tomografia_grupo_pieza ? 1 : null,
      tomografia_arcada: form.tomografia_arcada ? 1 : null,
      tomografia_total: form.tomografia_total ? 1 : null,
      rx_retroalveolar_total: form.rx_retroalveolar_total ? 1 : null,
      rx_mano: form.rx_mano ? 1 : null,
      bitewing_bilateral: form.bitewing_bilateral ? 1 : null,
    };

    if (isEditMode && currentId) {
      const res = await updateRadiologiaDerivacionRegistro(currentId, payload);
      if (res.success && res.record) {
        setData(prev => prev.map(d => d.id === currentId ? res.record : d));
        handleCloseModal();
      } else {
        setErrorMessage(res.error || 'Error al actualizar registro');
      }
    } else {
      const res = await createRadiologiaDerivacionRegistro(payload);
      if (res.success && res.record) {
        setData(prev => [res.record, ...prev]);
        handleCloseModal();
      } else {
        setErrorMessage(res.error || 'Error al crear registro');
      }
    }
    setIsSubmitting(false);
  };

  const renderExamIcon = (val: number | null, label: string) => {
    if (!val) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20" title={label}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border/40 bg-card/30 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Radiologías</p>
            <h3 className="text-3xl font-extrabold text-foreground mt-2">{stats.total}</h3>
          </div>
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-border/40 bg-card/30 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finalizados / Enviados</p>
            <h3 className="text-3xl font-extrabold text-emerald-500 mt-2">{stats.finalizados}</h3>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-border/40 bg-card/30 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pendientes</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-2">{stats.pendientes}</h3>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/20 backdrop-blur-md p-4 rounded-2xl border border-border/30">

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Buscar por RUT, Paciente o Doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background/50 border border-border/30 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground font-semibold placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <select
            value={filterSucursal}
            onChange={(e) => setFilterSucursal(e.target.value)}
            className="px-3 py-2.5 bg-secondary border border-border/30 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="todos" className="bg-card text-foreground">Todas las Sucursales</option>
            {sucursales.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
          </select>

          <select
            value={filterProceso}
            onChange={(e) => setFilterProceso(e.target.value)}
            className="px-3 py-2.5 bg-secondary border border-border/30 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="todos" className="bg-card text-foreground">Todos los Estados</option>
            {procesos.map(p => <option key={p} value={p} className="bg-card text-foreground">{p}</option>)}
          </select>

          <select
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="px-3 py-2.5 bg-secondary border border-border/30 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="todos" className="bg-card text-foreground">Todos los Meses</option>
            <option value="Enero" className="bg-card text-foreground">Enero</option>
            <option value="Febrero" className="bg-card text-foreground">Febrero</option>
            <option value="Marzo" className="bg-card text-foreground">Marzo</option>
            <option value="Abril" className="bg-card text-foreground">Abril</option>
            <option value="Mayo" className="bg-card text-foreground">Mayo</option>
            <option value="Junio" className="bg-card text-foreground">Junio</option>
            <option value="Julio" className="bg-card text-foreground">Julio</option>
            <option value="Agosto" className="bg-card text-foreground">Agosto</option>
            <option value="Septiembre" className="bg-card text-foreground">Septiembre</option>
            <option value="Octubre" className="bg-card text-foreground">Octubre</option>
            <option value="Noviembre" className="bg-card text-foreground">Noviembre</option>
            <option value="Diciembre" className="bg-card text-foreground">Diciembre</option>
            <option value="sin_fecha" className="bg-card text-foreground">Sin Fecha</option>
          </select>

          <select
            value={filterAño}
            onChange={(e) => setFilterAño(e.target.value)}
            className="px-3 py-2.5 bg-secondary border border-border/30 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="todos" className="bg-card text-foreground">Todos los Años</option>
            {years.map(y => <option key={y} value={y} className="bg-card text-foreground">{y}</option>)}
          </select>

          <div className="relative">
            <input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2.5 bg-secondary border border-border/30 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer dark:[color-scheme:dark]"
              title="Filtrar por fecha específica"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 transition-all cursor-pointer shrink-0"
              title="Limpiar filtros"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar Filtros
            </button>
          )}


        </div>

        {/* Create action button */}
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all w-full md:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Registro
        </button>
      </div>

      {/* Main Table */}
      <div className="border border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Paciente</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Profesional / Sucursal</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Exámenes Requeridos</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado / Radiólogo</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fechas</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground/60 font-semibold">
                    No se encontraron registros de radiología.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">

                    {/* Patient */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {item.nombre} {item.apellido_paterno} {item.apellido_materno}
                          </p>
                          <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
                            RUT: {item.rut || 'No registra'} {item.edad ? `(${item.edad} años)` : ''}
                          </p>
                          {item.correo && (
                            <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {item.correo}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Doc / Branch */}
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-primary" />
                          Dr(a). {item.doctor || 'No registra'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.especialidad || 'Sin especialidad'}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {item.sucursal || 'Sin sucursal asignada'}
                        </p>
                      </div>
                    </td>

                    {/* Exam checkboxes labels */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {renderExamIcon(item.rx_panoramica, 'RX Panorámica')}
                        {renderExamIcon(item.analisis_cefalometrico, 'A. Cefalométrico')}
                        {renderExamIcon(item.teleradiografia, 'Teleradiografía')}
                        {renderExamIcon(item.tomografia_atm, 'T. ATM')}
                        {renderExamIcon(item.tomografia_grupo_pieza, 'T. Grupo/Pieza')}
                        {renderExamIcon(item.tomografia_arcada, 'T. Arcada')}
                        {renderExamIcon(item.tomografia_total, 'T. Total')}
                        {renderExamIcon(item.rx_retroalveolar_total, 'RX Retroalveolar T.')}
                        {renderExamIcon(item.rx_mano, 'RX Mano')}
                        {renderExamIcon(item.bitewing_bilateral, 'Bitewing Bilateral')}
                        {!item.rx_panoramica && !item.analisis_cefalometrico && !item.teleradiografia && !item.tomografia_atm && !item.tomografia_grupo_pieza && !item.tomografia_arcada && !item.tomografia_total && !item.rx_retroalveolar_total && !item.rx_mano && !item.bitewing_bilateral && (
                          <span className="text-xs text-muted-foreground/40 italic">Ninguna radiografía seleccionada</span>
                        )}
                      </div>
                      {item.observaciones && (
                        <p className="text-[11px] bg-secondary/30 text-muted-foreground p-1.5 rounded-lg border border-border/20 mt-2 max-w-[280px] truncate" title={item.observaciones}>
                          {item.observaciones}
                        </p>
                      )}
                    </td>

                    {/* Process status / Radiologist */}
                    <td className="p-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${item.proceso === 'FINALIZADO' || item.proceso === 'ENVIADO'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : item.proceso === 'PROCESANDO' || item.proceso === 'INGRESADO'
                            ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                          {item.proceso || 'PENDIENTE'}
                        </span>
                        <p className="text-xs text-muted-foreground/80 mt-1 font-semibold">
                          {item.radiologo_responsable || 'Radiólogo no asignado'}
                        </p>
                        {item.observaciones_operador && (
                          <p className="text-[10px] text-muted-foreground/50 italic mt-0.5 truncate max-w-[160px]" title={item.observaciones_operador}>
                            Obs: {item.observaciones_operador}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Toma: {item.fecha_toma_examen || 'Pendiente'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Entrega: {item.fecha_entrega || 'Pendiente'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-2 hover:bg-[#0e1936]/40 text-sky-400 hover:text-sky-300 rounded-lg transition-all"
                          title="Ver Registro"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                          title="Editar Registro"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg transition-all"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card/20 backdrop-blur-md p-4 rounded-2xl border border-border/30 mt-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Mostrando {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredData.length, currentPage * itemsPerPage)} de {filteredData.length} registros
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              Anterior
            </button>
            <span className="flex items-center text-xs font-bold text-foreground px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}


      {/* Create / Edit Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in scale-in duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500 dark:text-sky-400 border border-sky-500/20">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {isReadOnlyMode 
                    ? 'Detalles del Registro de Radiología' 
                    : isEditMode 
                      ? 'Editar Registro de Radiología' 
                      : 'Registrar Nueva Radiografía'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">

              {/* Informational Banner */}
              <div className="bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 p-4 rounded-2xl text-sm font-medium flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs text-sky-500 dark:text-sky-400">
                    {isReadOnlyMode ? 'Vista de Ficha de Radiología' : 'Revisión de Ficha de Radiología'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isReadOnlyMode 
                      ? 'Estás viendo la ficha en modo lectura. Para modificar la información utiliza el botón de edición en la lista principal.' 
                      : 'Por favor, complete o verifique detalladamente todos los campos de datos y exámenes solicitados para guardar el registro en forma definitiva.'}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-2xl text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {errorMessage}
                </div>
              )}

              {/* Paciente Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Datos del Paciente</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* RUT */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">RUT</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnlyMode}
                        value={form.rut}
                        onChange={(e) => setForm({ ...form, rut: e.target.value })}
                        placeholder="12345678-9"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Nombre</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnlyMode}
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Juan"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Apellido Paterno */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Apellido Paterno</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnlyMode}
                        value={form.apellido_paterno}
                        onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })}
                        placeholder="Pérez"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Apellido Materno */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Apellido Materno</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.apellido_materno}
                        onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })}
                        placeholder="Gómez"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Edad */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Edad</label>
                      <input
                        type="number"
                        disabled={isReadOnlyMode}
                        value={form.edad}
                        onChange={(e) => setForm({ ...form, edad: e.target.value })}
                        placeholder="35"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Fecha Nacimiento */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Fecha Nacimiento</label>
                      <input
                        type="date"
                        disabled={isReadOnlyMode}
                        value={form.fecha_nacimiento}
                        onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none dark:[color-scheme:dark] disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinica / Doctor Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-2">
                  <Stethoscope className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Datos de la Radiografía y Profesional</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Doctor */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Doctor</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.doctor}
                        onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                        placeholder="Grace Martinson"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Especialidad</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.especialidad}
                        onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                        placeholder="Ortodoncia"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Dg. Clínico */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Dg. Clínico</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.dg_clinico}
                        onChange={(e) => setForm({ ...form, dg_clinico: e.target.value })}
                        placeholder="Ev Ortodoncia"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Sucursal */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Sucursal</label>
                      <select
                        value={form.sucursal}
                        disabled={isReadOnlyMode}
                        onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
                        required
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none cursor-pointer disabled:opacity-100 disabled:text-foreground disabled:cursor-default"
                      >
                        <option value="" className="bg-background text-muted-foreground/60">Seleccionar...</option>
                        <option value="Externo" className="bg-background text-foreground">Externo</option>
                        <option value="Los Tribunales" className="bg-background text-foreground">Los Tribunales</option>
                        <option value="Vitacura" className="bg-background text-foreground">Vitacura</option>
                      </select>
                    </div>
                  </div>

                  {/* Correo Paciente */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 sm:col-span-2 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Correo Electrónico Paciente</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.correo}
                        onChange={(e) => setForm({ ...form, correo: e.target.value })}
                        placeholder="paciente@correo.com"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Radiografías */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-2">
                  <Scan className="w-4 h-4 text-sky-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Radiografías Solicitadas</h3>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      category: 'Radiografías Convencionales (2D)',
                      items: [
                        { key: 'rx_panoramica', label: 'RX Panorámica' },
                        { key: 'teleradiografia', label: 'Teleradiografía' },
                        { key: 'analisis_cefalometrico', label: 'A. Cefalométrico', desc: 'Análisis Cefalométrico, que se realiza sobre la teleradiografía' },
                        { key: 'rx_retroalveolar_total', label: 'RX Retroalveolar T.', desc: 'Total o por zona' },
                        { key: 'bitewing_bilateral', label: 'Bitewing Bilateral', desc: 'Aleta de mordida' },
                      ]
                    },
                    {
                      category: 'Tomografías / Cono Computado (3D)',
                      items: [
                        { key: 'tomografia_atm', label: 'Tomografía ATM', desc: 'Articulación Temporomandibular' },
                        { key: 'tomografia_total', label: 'Tomografía Total', desc: 'Maxilar y mandíbula completos' },
                        { key: 'tomografia_arcada', label: 'T. Una Arcada', desc: 'Solo maxilar superior o inferior' },
                        { key: 'tomografia_grupo_pieza', label: 'T. Grupo o Pieza', desc: 'Tomografía localizada para dientes específicos' },
                      ]
                    },
                    {
                      category: 'Estudios Complementarios',
                      items: [
                        { key: 'rx_mano', label: 'RX Mano', desc: 'Radiografía carpal, utilizada en ortodoncia para medir la edad ósea y el crecimiento' },
                      ]
                    }
                  ].map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <h4 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-1">{cat.category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/5 dark:bg-[#0e1936]/20 border border-slate-200 dark:border-slate-800/60 p-4 rounded-2xl">
                        {cat.items.map((exam) => (
                          <label
                            key={exam.key}
                            className={`flex flex-col gap-1 border transition-all p-3 rounded-xl select-none ${
                              form[exam.key as keyof typeof form]
                                ? 'border-sky-500/40 bg-sky-500/5 text-sky-600 dark:text-sky-200'
                                : 'border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0e1936]/40 text-slate-500 dark:text-slate-400'
                            } ${isReadOnlyMode ? 'pointer-events-none opacity-85' : 'cursor-pointer hover:bg-secondary/15 dark:hover:bg-[#0e1936]/60 hover:text-foreground dark:hover:text-slate-300'}`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled={isReadOnlyMode}
                                checked={!!form[exam.key as keyof typeof form]}
                                onChange={(e) => setForm({ ...form, [exam.key]: e.target.checked })}
                                className="rounded border-slate-300 dark:border-slate-800 text-sky-500 focus:ring-sky-500/50 w-4 h-4 bg-white dark:bg-slate-900 cursor-pointer disabled:opacity-100 disabled:text-sky-500"
                              />
                              <span className="text-xs font-bold">{exam.label}</span>
                            </div>
                            {exam.desc && (
                              <span className="text-[10px] text-muted-foreground/75 pl-7 leading-tight font-medium">
                                {exam.desc}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radiologo & Estado */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Control de Operación</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Proceso / Estado */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Proceso / Estado</label>
                      <select
                        value={form.proceso}
                        disabled={isReadOnlyMode}
                        onChange={(e) => setForm({ ...form, proceso: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none cursor-pointer disabled:opacity-100 disabled:text-foreground disabled:cursor-default"
                      >
                        <option value="PENDIENTE" className="bg-background text-foreground">PENDIENTE</option>
                        <option value="INGRESADO" className="bg-background text-foreground">INGRESADO</option>
                        <option value="PROCESANDO" className="bg-background text-foreground">PROCESANDO</option>
                        <option value="FINALIZADO" className="bg-background text-foreground">FINALIZADO</option>
                        <option value="ENVIADO" className="bg-background text-foreground">ENVIADO</option>
                      </select>
                    </div>
                  </div>

                  {/* Radiólogo Responsable Dropdown */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Radiólogo Responsable</label>
                      <select
                        disabled={isReadOnlyMode}
                        value={form.radiologo_responsable || 'Sin radiologo'}
                        onChange={(e) => setForm({ ...form, radiologo_responsable: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none cursor-pointer disabled:opacity-100 disabled:text-foreground disabled:cursor-default"
                      >
                        <option value="Sin radiologo" className="bg-background text-foreground">Sin radiologo</option>
                        <option value="Alessandra Santana" className="bg-background text-foreground">Alessandra Santana</option>
                        <option value="Joaquín Vial" className="bg-background text-foreground">Joaquín Vial</option>
                      </select>
                    </div>
                  </div>

                  {/* Fecha de Toma Examen */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Fecha Toma Radiografía</label>
                      <input
                        type="date"
                        disabled={isReadOnlyMode}
                        value={form.fecha_toma_examen}
                        onChange={(e) => setForm({ ...form, fecha_toma_examen: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none dark:[color-scheme:dark] disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Fecha de Entrega */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Fecha de Entrega</label>
                      <input
                        type="date"
                        disabled={isReadOnlyMode}
                        value={form.fecha_entrega}
                        onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none dark:[color-scheme:dark] disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>

                  {/* Observaciones del Operador */}
                  <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-center gap-3 sm:col-span-2 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                    <div className="w-9 h-9 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Observaciones del Operador</label>
                      <input
                        type="text"
                        disabled={isReadOnlyMode}
                        value={form.observaciones_operador}
                        onChange={(e) => setForm({ ...form, observaciones_operador: e.target.value })}
                        placeholder="Obs. del operador radiológico..."
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-100 disabled:text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones del Doctor */}
              <div className={`border border-slate-200 dark:border-slate-800 bg-secondary/10 dark:bg-[#0e1936]/20 transition-all rounded-2xl p-4 flex items-start gap-3 ${isReadOnlyMode ? '' : 'hover:bg-secondary/20 dark:hover:bg-[#0e1936]/40 focus-within:border-sky-500/50 focus-within:bg-secondary/30 dark:focus-within:bg-[#0e1936]/60'}`}>
                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-1">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">Observaciones del Doctor</label>
                  <textarea
                    value={form.observaciones}
                    disabled={isReadOnlyMode}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    placeholder="Detalles u observaciones del doctor..."
                    rows={3}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 resize-none disabled:opacity-100 disabled:text-foreground"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 border-t border-border pt-6 bg-muted/30 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-sm rounded-xl transition-all border border-border cursor-pointer"
                >
                  {isReadOnlyMode ? 'Cerrar' : 'Cancelar'}
                </button>
                {!isReadOnlyMode && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Guardando...' : 'Confirmar y Guardar Registro'}
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
