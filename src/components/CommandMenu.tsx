"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { BarChart2, PlusCircle, Search, Edit3, Calendar, Download } from "lucide-react"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Alt+K or Ctrl/Cmd+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escriba un comando o busque una sección..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="1. Laboratorio Digital - Cubos Dentales">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Dashboard Cubos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/ingreso"))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Nuevo Ingreso Cubos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/visualizador"))} value="buscador visualizador cubos">
            <Search className="mr-2 h-4 w-4" />
            <span>Buscador Cubos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/edicion"))} value="edicion modificar cubos">
            <Edit3 className="mr-2 h-4 w-4" />
            <span>Edición Cubos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/entregas"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda Entregas Cubos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/exportar"))} value="exportar cubos excel">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar Cubos (PDF/Excel)</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="2. Laboratorio Digital - Radiología General">
          <CommandItem onSelect={() => runCommand(() => router.push("/radiologia"))}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Dashboard Radiología Lab</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/radiologia/ingreso"))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Ingreso y Gestión Radiología</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/radiologia/reporteria"))}>
            <Download className="mr-2 h-4 w-4" />
            <span>Reportería Radiología Lab</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="3. Derivaciones - Cubos Dentales">
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/dashboard"))} value="derivaciones dashboard cubos">
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/ingreso"))} value="derivaciones ingreso nuevo caso cubos">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Nuevo Ingreso</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/visualizador"))} value="derivaciones buscador visualizador cubos">
            <Search className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Buscador</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/edicion"))} value="derivaciones edicion modificar cubos">
            <Edit3 className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Edición</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/entregas"))} value="derivaciones entregas agenda cubos">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Agenda Entregas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/exportar"))} value="derivaciones exportar reportes excel cubos">
            <Download className="mr-2 h-4 w-4" />
            <span>Derivaciones Cubos - Exportar Reportes</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="4. Derivaciones - Radiología">
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/radiologia"))} value="derivaciones radiologia dashboard">
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Derivaciones Radiología - Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/radiologia/ingreso"))} value="derivaciones radiologia ingreso">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Derivaciones Radiología - Ingreso</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/derivaciones/radiologia/reporteria"))} value="derivaciones radiologia reporteria exportar">
            <Download className="mr-2 h-4 w-4" />
            <span>Derivaciones Radiología - Reportería</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
